import { getDatabase } from '../../config/database';
import { ReserveSeatsInput } from './booking.types';
import { logger } from '../../utils/logger';

export class BookingService {
  static async reserveSeats(userId: string, input: ReserveSeatsInput) {
    const db = getDatabase();

    try {
      // Execute the PostgreSQL RPC function
      const res = await db.query(
        'SELECT reserve_seats($1::uuid, $2::uuid, $3::uuid[], $4::int) as result',
        [userId, input.eventId, input.seatIds, input.holdDurationSeconds || 600]
      );

      const data = res.rows[0]?.result;
      if (data && data.booking_id && (input.showDate || input.showTime || input.cinemaName)) {
        await db.query(
          'UPDATE bookings SET show_date = $1, show_time = $2, cinema_name = $3 WHERE id = $4',
          [input.showDate || null, input.showTime || null, input.cinemaName || null, data.booking_id]
        );
      }
      return data;
    } catch (err: any) {
      logger.warn('reserveSeats error:', err.message);

      if (err.message?.includes('CANNOT_BOOK_MORE_THAN_4_SEATS') || err.code === 'P0001') {
        const error: any = new Error('You cannot book more than 4 seats per booking.');
        error.statusCode = 400;
        throw error;
      }

      if (
        err.message?.includes('SEATS_UNAVAILABLE_OR_ALREADY_RESERVED') ||
        err.code === 'P0003' ||
        err.code === '23505' // PostgreSQL unique constraint violation
      ) {
        const error: any = new Error('One or more of the selected seats have just been reserved or booked by another user. Please choose different seats.');
        error.statusCode = 409;
        throw error;
      }

      throw err;
    }
  }

  static async getMyBookings(userId: string) {
    const db = getDatabase();

    // Trigger opportunistic expiry check
    await db.query('SELECT release_expired_holds()');

    const sql = `
      SELECT 
        b.id,
        b.booking_reference,
        b.event_id,
        b.total_amount,
        b.seat_count,
        b.status,
        b.payment_status,
        b.payment_intent_id,
        b.expires_at,
        b.created_at,
        e.title as event_title,
        COALESCE(b.cinema_name, e.venue) as event_venue,
        COALESCE(b.show_date, e.event_date::text) as event_date,
        COALESCE(b.show_time, e.event_time) as event_time,
        e.category as event_category,
        e.cover_image_url as event_cover_image,
        COALESCE(json_agg(json_build_object(
          'id', s.id,
          'seatNumber', s.seat_number,
          'rowLabel', s.row_label,
          'colNumber', s.col_number,
          'tier', s.seat_tier,
          'price', bs.seat_price
        )) FILTER (WHERE s.id IS NOT NULL), '[]'::json) as seats
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      LEFT JOIN booking_seats bs ON b.id = bs.booking_id
      LEFT JOIN seats s ON bs.seat_id = s.id
      WHERE b.user_id = $1
      GROUP BY b.id, b.show_date, b.show_time, b.cinema_name, e.title, e.venue, e.event_date, e.event_time, e.category, e.cover_image_url
      ORDER BY b.created_at DESC
    `;

    const res = await db.query(sql, [userId]);
    return res.rows;
  }

  static async getBookingById(bookingId: string, userId: string) {
    const db = getDatabase();

    // Trigger opportunistic expiry check
    await db.query('SELECT release_expired_holds()');

    const sql = `
      SELECT 
        b.id,
        b.booking_reference,
        b.event_id,
        b.user_id,
        b.total_amount,
        b.seat_count,
        b.status,
        b.payment_status,
        b.payment_intent_id,
        b.expires_at,
        b.created_at,
        u.full_name as user_name,
        u.email as user_email,
        e.title as event_title,
        e.description as event_description,
        COALESCE(b.cinema_name, e.venue) as event_venue,
        COALESCE(b.show_date, e.event_date::text) as event_date,
        COALESCE(b.show_time, e.event_time) as event_time,
        e.category as event_category,
        e.cover_image_url as event_cover_image,
        COALESCE(json_agg(json_build_object(
          'id', s.id,
          'seatNumber', s.seat_number,
          'rowLabel', s.row_label,
          'colNumber', s.col_number,
          'tier', s.seat_tier,
          'price', bs.seat_price
        )) FILTER (WHERE s.id IS NOT NULL), '[]'::json) as seats
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN booking_seats bs ON b.id = bs.booking_id
      LEFT JOIN seats s ON bs.seat_id = s.id
      WHERE b.id = $1
      GROUP BY b.id, b.show_date, b.show_time, b.cinema_name, u.full_name, u.email, e.title, e.description, e.venue, e.event_date, e.event_time, e.category, e.cover_image_url
    `;

    const res = await db.query(sql, [bookingId]);
    if (res.rows.length === 0) {
      const error: any = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    const booking = res.rows[0];

    // Ownership check (only user or organizer of the event or admin can view)
    if (booking.user_id !== userId) {
      const error: any = new Error('Forbidden. You cannot view this booking.');
      error.statusCode = 403;
      throw error;
    }

    return booking;
  }

  static async cancelBooking(bookingId: string, userId: string) {
    const db = getDatabase();

    const res = await db.query(
      'SELECT cancel_booking($1::uuid, $2::uuid) as result',
      [bookingId, userId]
    );

    return res.rows[0]?.result;
  }
}
