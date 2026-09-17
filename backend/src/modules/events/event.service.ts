import { getDatabase } from '../../config/database';
import { CreateEventInput, UpdateEventInput } from './event.types';

export class EventService {
  static async createEvent(input: CreateEventInput, organizerId: string) {
    const db = getDatabase();

    const insertRes = await db.query(
      `INSERT INTO events (
        title, description, category, venue, event_date, event_time, 
        price, rows, cols, cover_image_url, organizer_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, title, description, category, venue, event_date, event_time, 
                price, rows, cols, cover_image_url, organizer_id, created_at`,
      [
        input.title,
        input.description,
        input.category,
        input.venue,
        input.eventDate,
        input.eventTime,
        input.price,
        input.rows,
        input.cols,
        input.coverImageUrl || null,
        organizerId,
      ]
    );

    const event = insertRes.rows[0];
    const eventId = event.id;

    // Generate seats for the grid
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < input.rows; r++) {
      const rowLabel = rowLetters[r];
      let tier = 'STANDARD';
      let multiplier = 1.0;

      if (r < 2) {
        tier = 'VIP';
        multiplier = 1.5;
      } else if (r < Math.ceil(input.rows / 2) + 1) {
        tier = 'PREMIUM';
        multiplier = 1.25;
      }

      for (let c = 1; c <= input.cols; c++) {
        const seatNumber = `${rowLabel}${c}`;
        await db.query(
          `INSERT INTO seats (event_id, row_label, col_number, seat_number, seat_tier, price_multiplier, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'AVAILABLE')
           ON CONFLICT (event_id, row_label, col_number) DO NOTHING`,
          [eventId, rowLabel, c, seatNumber, tier, multiplier]
        );
      }
    }

    return event;
  }

  static async listEvents(filters: {
    search?: string;
    category?: string;
    date?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const db = getDatabase();
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (filters.search) {
      params.push(`%${filters.search}%`);
      whereClauses.push(`(e.title ILIKE $${params.length} OR e.venue ILIKE $${params.length})`);
    }

    if (filters.category && filters.category !== 'All') {
      params.push(filters.category);
      whereClauses.push(`e.category = $${params.length}`);
    }

    if (filters.date) {
      params.push(filters.date);
      whereClauses.push(`e.event_date = $${params.length}`);
    }

    if (filters.minPrice !== undefined) {
      params.push(filters.minPrice);
      whereClauses.push(`e.price >= $${params.length}`);
    }

    if (filters.maxPrice !== undefined) {
      params.push(filters.maxPrice);
      whereClauses.push(`e.price <= $${params.length}`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        e.*,
        u.full_name as organizer_name,
        COUNT(s.id) as total_seats,
        COUNT(CASE WHEN s.status = 'BOOKED' THEN 1 END) as booked_seats,
        COUNT(CASE WHEN s.status = 'AVAILABLE' THEN 1 END) as available_seats
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN seats s ON e.id = s.event_id
      ${whereSql}
      GROUP BY e.id, u.full_name
      ORDER BY e.event_date ASC, e.event_time ASC
    `;

    const res = await db.query(sql, params);
    return res.rows.map((row) => {
      const total = parseInt(row.total_seats || '0', 10);
      const booked = parseInt(row.booked_seats || '0', 10);
      const occupancy = total > 0 ? Math.round((booked / total) * 100) : 0;
      return {
        ...row,
        genres: typeof row.genres === 'string' ? JSON.parse(row.genres || '[]') : (row.genres || []),
        cast_members: typeof row.cast_members === 'string' ? JSON.parse(row.cast_members || '[]') : (row.cast_members || []),
        reviews: typeof row.reviews === 'string' ? JSON.parse(row.reviews || '[]') : (row.reviews || []),
        total_seats: total,
        booked_seats: booked,
        available_seats: parseInt(row.available_seats || '0', 10),
        occupancyRate: occupancy,
      };
    });
  }

  static async getEventById(eventId: string) {
    const db = getDatabase();

    const sql = `
      SELECT 
        e.*,
        u.full_name as organizer_name,
        u.email as organizer_email,
        COUNT(s.id) as total_seats,
        COUNT(CASE WHEN s.status = 'BOOKED' THEN 1 END) as booked_seats,
        COUNT(CASE WHEN s.status = 'HELD' AND s.held_until > NOW() THEN 1 END) as held_seats,
        COUNT(CASE WHEN s.status = 'AVAILABLE' OR (s.status = 'HELD' AND s.held_until < NOW()) THEN 1 END) as available_seats
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN seats s ON e.id = s.event_id
      WHERE e.id = $1
      GROUP BY e.id, u.full_name, u.email
    `;

    const res = await db.query(sql, [eventId]);
    if (res.rows.length === 0) {
      const error: any = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    const event = res.rows[0];
    const total = parseInt(event.total_seats || '0', 10);
    const booked = parseInt(event.booked_seats || '0', 10);
    const held = parseInt(event.held_seats || '0', 10);

    return {
      ...event,
      genres: typeof event.genres === 'string' ? JSON.parse(event.genres || '[]') : (event.genres || []),
      cast_members: typeof event.cast_members === 'string' ? JSON.parse(event.cast_members || '[]') : (event.cast_members || []),
      reviews: typeof event.reviews === 'string' ? JSON.parse(event.reviews || '[]') : (event.reviews || []),
      total_seats: total,
      booked_seats: booked,
      held_seats: held,
      available_seats: parseInt(event.available_seats || '0', 10),
      occupancyRate: total > 0 ? Math.round((booked / total) * 100) : 0,
    };
  }

  static async getOrganizerDashboard(organizerId: string) {
    const db = getDatabase();

    // 1. Fetch events created by organizer
    const eventsRes = await db.query(
      `SELECT 
        e.*,
        COUNT(DISTINCT s.id) as total_seats,
        COUNT(DISTINCT CASE WHEN s.status = 'BOOKED' THEN s.id END) as booked_seats,
        COALESCE(SUM(CASE WHEN b.status = 'CONFIRMED' THEN b.total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(DISTINCT CASE WHEN b.status = 'CONFIRMED' THEN b.id END) as confirmed_bookings_count
       FROM events e
       LEFT JOIN seats s ON e.id = s.event_id
       LEFT JOIN bookings b ON e.id = b.event_id
       WHERE e.organizer_id = $1
       GROUP BY e.id
       ORDER BY e.created_at DESC`,
      [organizerId]
    );

    // 2. Fetch recent bookings across organizer events
    const recentBookingsRes = await db.query(
      `SELECT 
        b.id, b.booking_reference, b.total_amount, b.seat_count, b.status, b.created_at,
        e.title as event_title,
        u.full_name as customer_name,
        u.email as customer_email,
        array_agg(s.seat_number) as seats
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       JOIN users u ON b.user_id = u.id
       JOIN booking_seats bs ON b.id = bs.booking_id
       JOIN seats s ON bs.seat_id = s.id
       WHERE e.organizer_id = $1 AND b.status = 'CONFIRMED'
       GROUP BY b.id, e.title, u.full_name, u.email
       ORDER BY b.created_at DESC
       LIMIT 20`,
      [organizerId]
    );

    const events = eventsRes.rows.map((ev) => {
      const total = parseInt(ev.total_seats || '0', 10);
      const booked = parseInt(ev.booked_seats || '0', 10);
      return {
        ...ev,
        total_seats: total,
        booked_seats: booked,
        total_revenue: parseFloat(ev.total_revenue || '0'),
        confirmed_bookings_count: parseInt(ev.confirmed_bookings_count || '0', 10),
        occupancyRate: total > 0 ? Math.round((booked / total) * 100) : 0,
      };
    });

    const totalRevenue = events.reduce((acc, ev) => acc + ev.total_revenue, 0);
    const totalTicketsSold = events.reduce((acc, ev) => acc + ev.booked_seats, 0);

    return {
      summary: {
        totalEvents: events.length,
        totalRevenue,
        totalTicketsSold,
      },
      events,
      recentBookings: recentBookingsRes.rows,
    };
  }

  static async deleteEvent(eventId: string, organizerId: string) {
    const db = getDatabase();
    const check = await db.query('SELECT organizer_id FROM events WHERE id = $1', [eventId]);
    if (check.rows.length === 0) {
      const error: any = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    if (check.rows[0].organizer_id !== organizerId) {
      const error: any = new Error('Forbidden. You do not own this event.');
      error.statusCode = 403;
      throw error;
    }

    await db.query('DELETE FROM events WHERE id = $1', [eventId]);
    return { success: true, message: 'Event deleted successfully' };
  }
}
