-- Migration 004: Add show date, show time, and cinema name to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS show_date VARCHAR(60);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS show_time VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cinema_name VARCHAR(150);
