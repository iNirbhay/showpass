-- 001_initial_schema.sql
-- Production schema for Seat Booking & Event Management Platform

-- Users Table
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

-- Events Table
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

-- Seats Table
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

-- Bookings Table
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

-- Foreign key link back from seats to bookings (idempotent)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_seats_booking') THEN 
        ALTER TABLE seats ADD CONSTRAINT fk_seats_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL; 
    END IF; 
END $$;

-- Booking Seats Table (Individual seat assignment in a booking)
CREATE TABLE IF NOT EXISTS booking_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    seat_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'HELD' CHECK (status IN ('HELD', 'BOOKED', 'RELEASED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HARD DATABASE-LEVEL CONCURRENCY INTEGRITY:
-- This partial unique index guarantees that NO TWO active records can exist
-- for the same seat simultaneously in HELD or BOOKED state!
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_seat_booking 
ON booking_seats (seat_id) 
WHERE status IN ('HELD', 'BOOKED');

-- Payments Table (Sandstone Gateway Audit & Logs)
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

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_seats_event_id ON seats(event_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
