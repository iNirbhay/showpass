import { initDatabase, getDatabase } from '../src/config/database';
import { BookingService } from '../src/modules/bookings/booking.service';
import { logger } from '../src/utils/logger';

async function runConcurrencyStressTest() {
  logger.info('=====================================================');
  logger.info('🧪 STARTING DATABASE CONCURRENCY & DOUBLE-BOOKING STRESS TEST');
  logger.info('=====================================================');

  // Initialize DB
  await initDatabase();
  const db = getDatabase();

  // 1. Pick an event and find an available seat
  const eventRes = await db.query('SELECT id, title FROM events LIMIT 1');
  if (eventRes.rows.length === 0) {
    throw new Error('No events found to test. Run seed first.');
  }
  const testEvent = eventRes.rows[0];

  // Pick one specific seat
  const seatRes = await db.query(
    `SELECT id, seat_number FROM seats 
     WHERE event_id = $1 AND status = 'AVAILABLE' 
     LIMIT 1`,
    [testEvent.id]
  );

  if (seatRes.rows.length === 0) {
    throw new Error('No available seat found in test event');
  }

  const targetSeat = seatRes.rows[0];
  logger.info(`Target event: "${testEvent.title}" (${testEvent.id})`);
  logger.info(`Target seat: ${targetSeat.seat_number} (${targetSeat.id})`);

  // 2. Setup 50 distinct test users
  const totalConcurrentAttempts = 50;
  logger.info(`Generating ${totalConcurrentAttempts} concurrent booking attempts for seat ${targetSeat.seat_number}...`);

  const userIds: string[] = [];
  for (let i = 0; i < totalConcurrentAttempts; i++) {
    const userEmail = `stress_test_user_${i}_${Date.now()}@example.com`;
    const userRes = await db.query(
      `INSERT INTO users (email, full_name, role) 
       VALUES ($1, $2, 'CUSTOMER') 
       RETURNING id`,
      [userEmail, `Stress Tester ${i}`]
    );
    userIds.push(userRes.rows[0].id);
  }

  logger.info(`Firing ${totalConcurrentAttempts} simultaneous reservation requests at the exact same millisecond...`);

  // 3. Fire all requests concurrently with Promise.all
  const startTime = Date.now();
  const results = await Promise.allSettled(
    userIds.map((uid) =>
      BookingService.reserveSeats(uid, {
        eventId: testEvent.id,
        seatIds: [targetSeat.id],
        holdDurationSeconds: 300,
      })
    )
  );
  const duration = Date.now() - startTime;

  let successCount = 0;
  let rejectedCount = 0;
  let errorReasons: Record<string, number> = {};

  for (const r of results) {
    if (r.status === 'fulfilled') {
      successCount++;
    } else {
      rejectedCount++;
      const reason = r.reason?.message || 'Unknown error';
      errorReasons[reason] = (errorReasons[reason] || 0) + 1;
    }
  }

  // 4. Verify database-level constraints directly
  const activeBookingsOnSeat = await db.query(
    `SELECT COUNT(*) as count FROM booking_seats 
     WHERE seat_id = $1 AND status IN ('HELD', 'BOOKED')`,
    [targetSeat.id]
  );
  const activeCountInDb = parseInt(activeBookingsOnSeat.rows[0]?.count || '0', 10);

  const seatStatusInDb = await db.query(
    `SELECT status, held_by_user_id, booking_id FROM seats WHERE id = $1`,
    [targetSeat.id]
  );

  logger.info('-----------------------------------------------------');
  logger.info(`⏱️ Duration: ${duration}ms`);
  logger.info(`📊 Total Concurrent Requests: ${totalConcurrentAttempts}`);
  logger.info(`✅ Successful Reservations: ${successCount}`);
  logger.info(`❌ Rejected Reservations (Double-Booking Blocked): ${rejectedCount}`);
  logger.info(`🛡️ Active Bookings Recorded in Database: ${activeCountInDb}`);
  logger.info(`🪑 Seat Status in Database: ${seatStatusInDb.rows[0]?.status}`);
  logger.info('Detailed Rejection Reasons:');
  for (const [reason, count] of Object.entries(errorReasons)) {
    logger.info(`   - "${reason}": ${count} request(s)`);
  }
  logger.info('-----------------------------------------------------');

  // Assertions
  if (successCount === 1 && rejectedCount === totalConcurrentAttempts - 1 && activeCountInDb === 1) {
    logger.info('🎉 TEST PASSED! Double-booking is GUARANTEED IMPOSSIBLE at the database level!');
    process.exit(0);
  } else {
    logger.error('💥 TEST FAILED: Concurrency violation detected!');
    logger.error(`Expected 1 success, got ${successCount}. Expected 1 active row in DB, got ${activeCountInDb}.`);
    process.exit(1);
  }
}

runConcurrencyStressTest().catch((err) => {
  logger.error('Fatal error during test:', err);
  process.exit(1);
});
