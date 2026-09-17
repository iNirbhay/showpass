-- 002_rpc_booking_functions.sql
-- PostgreSQL Transactional Stored Functions (RPC) for Concurrency-Safe Seat Reservations

-- Function: Release all expired holds
CREATE OR REPLACE FUNCTION release_expired_holds()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_released_count INT := 0;
BEGIN
    -- Update expired seats back to AVAILABLE
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

    -- Update booking_seats to RELEASED for expired bookings
    UPDATE booking_seats bs
    SET status = 'RELEASED'
    FROM bookings b
    WHERE bs.booking_id = b.id
      AND bs.status = 'HELD'
      AND b.status = 'PENDING'
      AND b.expires_at < NOW();

    -- Mark expired bookings
    UPDATE bookings
    SET status = 'EXPIRED',
        updated_at = NOW()
    WHERE status = 'PENDING'
      AND expires_at < NOW();

    RETURN v_released_count;
END;
$$;


-- Function: Atomic Reserve Seats (Transactional RPC with Row Locks)
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
    -- 1. Validate Seat Count (Max 4 seats rule)
    v_seat_count := array_length(p_seat_ids, 1);
    IF v_seat_count IS NULL OR v_seat_count < 1 THEN
        RAISE EXCEPTION 'AT_LEAST_ONE_SEAT_REQUIRED' USING ERRCODE = 'P0001';
    END IF;
    
    IF v_seat_count > 4 THEN
        RAISE EXCEPTION 'CANNOT_BOOK_MORE_THAN_4_SEATS' USING ERRCODE = 'P0001';
    END IF;

    -- 2. Verify Event exists and get base ticket price
    SELECT price INTO v_base_price
    FROM events
    WHERE id = p_event_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'EVENT_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;

    -- 3. Release any already expired holds
    PERFORM release_expired_holds();

    -- 4. Set hold expiration timestamp (default 10 minutes)
    v_expires_at := NOW() + (p_hold_duration_seconds || ' seconds')::INTERVAL;

    -- 5. ROW-LEVEL SERIALIZATION & ACQUISITION:
    -- Lock all requested seats FOR UPDATE ordered by ID to eliminate deadlock risk.
    -- Only select seats that are currently AVAILABLE (or stale held).
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

    -- If any requested seat is not available, immediately fail and rollback
    IF v_locked_count <> v_seat_count THEN
        RAISE EXCEPTION 'SEATS_UNAVAILABLE_OR_ALREADY_RESERVED' USING ERRCODE = 'P0003';
    END IF;

    -- 6. Generate Unique Booking Reference (e.g. BMS-7F3A29B1)
    v_booking_ref := 'SP-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));

    -- 7. Create Pending Booking
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

    -- 8. Transition Seats to HELD
    UPDATE seats
    SET status = 'HELD',
        held_by_user_id = p_user_id,
        held_until = v_expires_at,
        booking_id = v_booking_id,
        version = version + 1
    WHERE id = ANY(p_seat_ids);

    -- 9. Insert into booking_seats
    -- NOTE: Protected additionally by the partial unique index idx_unique_active_seat_booking
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

    -- 10. Return success response
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


-- Function: Confirm Booking Payment (Post-Sandstone Server Verification)
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
    -- 1. Lock the booking row
    SELECT * INTO v_booking
    FROM bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE = 'P0004';
    END IF;

    -- If already confirmed (idempotency)
    IF v_booking.status = 'CONFIRMED' THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'ALREADY_CONFIRMED',
            'booking_id', p_booking_id,
            'booking_reference', v_booking.booking_reference
        );
    END IF;

    -- Check if booking was expired
    IF v_booking.status = 'EXPIRED' OR (v_booking.status = 'PENDING' AND v_booking.expires_at < NOW()) THEN
        RAISE EXCEPTION 'BOOKING_HAS_EXPIRED' USING ERRCODE = 'P0005';
    END IF;

    -- 2. Mark Booking as CONFIRMED
    UPDATE bookings
    SET status = 'CONFIRMED',
        payment_status = 'PAID',
        payment_intent_id = p_payment_intent_id,
        updated_at = NOW()
    WHERE id = p_booking_id;

    -- 3. Permanently mark seats as BOOKED
    UPDATE seats
    SET status = 'BOOKED',
        held_until = NULL,
        version = version + 1
    WHERE booking_id = p_booking_id;

    -- 4. Mark booking_seats as BOOKED
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


-- Function: Cancel a booking
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

    -- Free seats
    UPDATE seats
    SET status = 'AVAILABLE',
        held_by_user_id = NULL,
        held_until = NULL,
        booking_id = NULL,
        version = version + 1
    WHERE booking_id = p_booking_id;

    -- Free booking_seats
    UPDATE booking_seats
    SET status = 'RELEASED'
    WHERE booking_id = p_booking_id;

    -- Update booking status
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
