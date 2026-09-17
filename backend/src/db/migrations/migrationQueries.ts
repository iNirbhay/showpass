// migrationQueries.ts - Embedded SQL strings for robust serverless execution
export const MIGRATION_001_SQL = `
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ORGANIZER', 'ADMIN')),
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Movies',
    venue VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(20) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    rows INT NOT NULL CHECK (rows >= 1 AND rows <= 20),
    cols INT NOT NULL CHECK (cols >= 1 AND cols <= 20),
    cover_image_url TEXT,
    organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    row_label VARCHAR(5) NOT NULL,
    col_number INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_tier VARCHAR(20) NOT NULL DEFAULT 'STANDARD' CHECK (seat_tier IN ('STANDARD', 'PREMIUM', 'VIP')),
    price_multiplier NUMERIC(3, 2) NOT NULL DEFAULT 1.00,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'HELD', 'BOOKED')),
    held_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    held_until TIMESTAMPTZ,
    booking_id UUID,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_event_row_col UNIQUE (event_id, row_label, col_number)
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(32) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL,
    seat_count INT NOT NULL CHECK (seat_count >= 1 AND seat_count <= 4),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED')),
    payment_intent_id VARCHAR(100),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_seats_booking') THEN 
        ALTER TABLE seats ADD CONSTRAINT fk_seats_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL; 
    END IF; 
END $$;

CREATE TABLE IF NOT EXISTS booking_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    seat_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'HELD' CHECK (status IN ('HELD', 'BOOKED', 'RELEASED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_seat_booking 
ON booking_seats (seat_id) 
WHERE status IN ('HELD', 'BOOKED');

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    sandstone_order_id VARCHAR(100) UNIQUE NOT NULL,
    sandstone_payment_id VARCHAR(100),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'PENDING', 'CAPTURED', 'FAILED', 'REFUNDED')),
    payment_method VARCHAR(50),
    signature VARCHAR(255),
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seats_event_id ON seats(event_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
`;

export const MIGRATION_002_SQL = `
CREATE OR REPLACE FUNCTION release_expired_holds()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_released_count INT := 0;
BEGIN
    WITH expired_seats AS (
        UPDATE seats
        SET status = 'AVAILABLE',
            held_by_user_id = NULL,
            held_until = NULL,
            booking_id = NULL,
            version = version + 1
        WHERE status = 'HELD' 
          AND held_until IS NOT NULL 
          AND held_until < NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO v_released_count FROM expired_seats;

    UPDATE booking_seats bs
    SET status = 'RELEASED'
    FROM bookings b
    WHERE bs.booking_id = b.id
      AND bs.status = 'HELD'
      AND b.status = 'PENDING'
      AND b.expires_at < NOW();

    UPDATE bookings
    SET status = 'EXPIRED',
        updated_at = NOW()
    WHERE status = 'PENDING'
      AND expires_at < NOW();

    RETURN v_released_count;
END;
$$;

CREATE OR REPLACE FUNCTION reserve_seats(
    p_user_id UUID,
    p_event_id UUID,
    p_seat_ids UUID[],
    p_hold_duration_seconds INT DEFAULT 600
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_booking_id UUID;
    v_booking_ref VARCHAR(32);
    v_seat_count INT;
    v_locked_count INT;
    v_base_price NUMERIC(10, 2);
    v_total_amount NUMERIC(10, 2) := 0;
    v_expires_at TIMESTAMPTZ;
    v_seat_details JSONB;
BEGIN
    v_seat_count := array_length(p_seat_ids, 1);
    IF v_seat_count IS NULL OR v_seat_count < 1 THEN
        RAISE EXCEPTION 'AT_LEAST_ONE_SEAT_REQUIRED' USING ERRCODE = 'P0001';
    END IF;
    
    IF v_seat_count > 4 THEN
        RAISE EXCEPTION 'CANNOT_BOOK_MORE_THAN_4_SEATS' USING ERRCODE = 'P0001';
    END IF;

    SELECT price INTO v_base_price
    FROM events
    WHERE id = p_event_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'EVENT_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;

    PERFORM release_expired_holds();

    v_expires_at := NOW() + (p_hold_duration_seconds || ' seconds')::INTERVAL;

    WITH locked_rows AS (
        SELECT s.id, s.seat_number, s.seat_tier, s.price_multiplier,
               (v_base_price * s.price_multiplier) AS seat_price
        FROM seats s
        WHERE s.id = ANY(p_seat_ids)
          AND s.event_id = p_event_id
          AND (
              s.status = 'AVAILABLE' 
              OR (s.status = 'HELD' AND s.held_until < NOW())
          )
        ORDER BY s.id ASC
        FOR UPDATE
    )
    SELECT COUNT(*), COALESCE(SUM(seat_price), 0), jsonb_agg(jsonb_build_object(
        'id', id,
        'seat_number', seat_number,
        'seat_tier', seat_tier,
        'price', seat_price
    ))
    INTO v_locked_count, v_total_amount, v_seat_details
    FROM locked_rows;

    IF v_locked_count <> v_seat_count THEN
        RAISE EXCEPTION 'SEATS_UNAVAILABLE_OR_ALREADY_RESERVED' USING ERRCODE = 'P0003';
    END IF;

    v_booking_ref := 'SP-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));

    INSERT INTO bookings (
        booking_reference,
        user_id,
        event_id,
        total_amount,
        seat_count,
        status,
        payment_status,
        expires_at
    ) VALUES (
        v_booking_ref,
        p_user_id,
        p_event_id,
        v_total_amount,
        v_seat_count,
        'PENDING',
        'UNPAID',
        v_expires_at
    ) RETURNING id INTO v_booking_id;

    UPDATE seats
    SET status = 'HELD',
        held_by_user_id = p_user_id,
        held_until = v_expires_at,
        booking_id = v_booking_id,
        version = version + 1
    WHERE id = ANY(p_seat_ids);

    INSERT INTO booking_seats (
        booking_id,
        seat_id,
        event_id,
        seat_price,
        status
    )
    SELECT 
        v_booking_id,
        s.id,
        p_event_id,
        (v_base_price * s.price_multiplier),
        'HELD'
    FROM seats s
    WHERE s.id = ANY(p_seat_ids);

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_reference', v_booking_ref,
        'total_amount', v_total_amount,
        'seat_count', v_seat_count,
        'expires_at', v_expires_at,
        'seats', v_seat_details
    );
END;
$$;

CREATE OR REPLACE FUNCTION confirm_booking_payment(
    p_booking_id UUID,
    p_payment_intent_id VARCHAR(100),
    p_amount_paid NUMERIC(10, 2)
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_booking RECORD;
BEGIN
    SELECT * INTO v_booking
    FROM bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE = 'P0004';
    END IF;

    IF v_booking.status = 'CONFIRMED' THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'ALREADY_CONFIRMED',
            'booking_id', p_booking_id,
            'booking_reference', v_booking.booking_reference
        );
    END IF;

    IF v_booking.status = 'EXPIRED' OR (v_booking.status = 'PENDING' AND v_booking.expires_at < NOW()) THEN
        RAISE EXCEPTION 'BOOKING_HAS_EXPIRED' USING ERRCODE = 'P0005';
    END IF;

    UPDATE bookings
    SET status = 'CONFIRMED',
        payment_status = 'PAID',
        payment_intent_id = p_payment_intent_id,
        updated_at = NOW()
    WHERE id = p_booking_id;

    UPDATE seats
    SET status = 'BOOKED',
        held_until = NULL,
        version = version + 1
    WHERE booking_id = p_booking_id;

    UPDATE booking_seats
    SET status = 'BOOKED'
    WHERE booking_id = p_booking_id;

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'booking_reference', v_booking.booking_reference,
        'status', 'CONFIRMED'
    );
END;
$$;

CREATE OR REPLACE FUNCTION cancel_booking(
    p_booking_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_booking RECORD;
BEGIN
    SELECT * INTO v_booking
    FROM bookings
    WHERE id = p_booking_id AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND_OR_UNAUTHORIZED' USING ERRCODE = 'P0006';
    END IF;

    UPDATE seats
    SET status = 'AVAILABLE',
        held_by_user_id = NULL,
        held_until = NULL,
        booking_id = NULL,
        version = version + 1
    WHERE booking_id = p_booking_id;

    UPDATE booking_seats
    SET status = 'RELEASED'
    WHERE booking_id = p_booking_id;

    UPDATE bookings
    SET status = 'CANCELLED',
        updated_at = NOW()
    WHERE id = p_booking_id;

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'status', 'CANCELLED'
    );
END;
$$;
`;

export const MIGRATION_003_SQL = `
ALTER TABLE events ADD COLUMN IF NOT EXISTS certification VARCHAR(20) DEFAULT 'U';
ALTER TABLE events ADD COLUMN IF NOT EXISTS language VARCHAR(100) DEFAULT 'Hindi';
ALTER TABLE events ADD COLUMN IF NOT EXISTS duration VARCHAR(30) DEFAULT '2h 15m';
ALTER TABLE events ADD COLUMN IF NOT EXISTS genres JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS release_date VARCHAR(50);
ALTER TABLE events ADD COLUMN IF NOT EXISTS backdrop_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cast_members JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;
`;

export const MIGRATION_004_SQL = `
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS show_date VARCHAR(60);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS show_time VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cinema_name VARCHAR(150);
`;
