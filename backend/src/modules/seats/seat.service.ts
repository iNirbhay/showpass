import { getDatabase } from '../../config/database';
import { SeatMapResponse, SeatResponse } from './seat.types';

export class SeatService {
  static async getEventSeatMap(eventId: string, currentUserId?: string): Promise<SeatMapResponse> {
    const db = getDatabase();

    // 1. First trigger opportunistic expiration of stale holds
    await db.query('SELECT release_expired_holds()');

    // 2. Fetch event information
    const eventRes = await db.query(
      'SELECT id, price, rows, cols FROM events WHERE id = $1',
      [eventId]
    );

    if (eventRes.rows.length === 0) {
      const error: any = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    const event = eventRes.rows[0];
    const basePrice = parseFloat(event.price);

    // 3. Fetch all seats for the event
    const seatsRes = await db.query(
      `SELECT 
        id, event_id, row_label, col_number, seat_number, seat_tier, 
        price_multiplier, status, held_by_user_id, held_until
       FROM seats
       WHERE event_id = $1
       ORDER BY row_label ASC, col_number ASC`,
      [eventId]
    );
    let seatsRows = seatsRes.rows;

    // Safety fallback: if event has no seats generated yet, generate full matrix on the fly
    if (seatsRows.length === 0) {
      const rowLetters = "ABCDEFGHIJ";
      const rows = event.rows || 8;
      const cols = event.cols || 12;
      for (let r = 0; r < rows; r++) {
        const rowLabel = rowLetters[r];
        let tier = "STANDARD";
        let multiplier = 1.0;
        if (r < 2) {
          tier = "VIP";
          multiplier = 1.5;
        } else if (r < 5) {
          tier = "PREMIUM";
          multiplier = 1.25;
        }
        for (let c = 1; c <= cols; c++) {
          const seatNumber = `${rowLabel}${c}`;
          await db.query(`
            INSERT INTO seats (event_id, row_label, col_number, seat_number, seat_tier, price_multiplier, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'AVAILABLE')
            ON CONFLICT (event_id, row_label, col_number) DO NOTHING
          `, [eventId, rowLabel, c, seatNumber, tier, multiplier]);
        }
      }
      const refetched = await db.query(
        `SELECT id, event_id, row_label, col_number, seat_number, seat_tier, 
         price_multiplier, status, held_by_user_id, held_until
         FROM seats WHERE event_id = $1 ORDER BY row_label ASC, col_number ASC`,
        [eventId]
      );
      seatsRows = refetched.rows;
    }

    const now = new Date();
    let bookedCount = 0;
    let heldCount = 0;
    let availableCount = 0;

    const rowMap = new Map<string, { rowLabel: string; tier: 'STANDARD' | 'PREMIUM' | 'VIP'; seats: SeatResponse[] }>();

    for (const row of seatsRows) {
      let displayStatus: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'HELD_BY_ME' = 'AVAILABLE';
      const isHeld = row.status === 'HELD' && row.held_until && new Date(row.held_until) > now;

      if (row.status === 'BOOKED') {
        displayStatus = 'BOOKED';
        bookedCount++;
      } else if (isHeld) {
        if (currentUserId && row.held_by_user_id === currentUserId) {
          displayStatus = 'HELD_BY_ME';
        } else {
          displayStatus = 'HELD';
        }
        heldCount++;
      } else {
        displayStatus = 'AVAILABLE';
        availableCount++;
      }

      const multiplier = parseFloat(row.price_multiplier || '1.0');
      const finalPrice = Math.round(basePrice * multiplier * 100) / 100;

      const seatObj: SeatResponse = {
        id: row.id,
        eventId: row.event_id,
        rowLabel: row.row_label,
        colNumber: row.col_number,
        seatNumber: row.seat_number,
        seatTier: row.seat_tier,
        priceMultiplier: multiplier,
        finalPrice,
        status: displayStatus,
        heldUntil: row.held_until,
      };

      if (!rowMap.has(row.row_label)) {
        rowMap.set(row.row_label, {
          rowLabel: row.row_label,
          tier: row.seat_tier,
          seats: [],
        });
      }

      rowMap.get(row.row_label)!.seats.push(seatObj);
    }

    return {
      eventId: event.id,
      rows: event.rows,
      cols: event.cols,
      basePrice,
      totalSeats: seatsRows.length,
      availableSeats: availableCount,
      bookedSeats: bookedCount,
      heldSeats: heldCount,
      seatRows: Array.from(rowMap.values()),
    };
  }
}
