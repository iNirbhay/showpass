"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/config/database");
const booking_service_1 = require("../src/modules/bookings/booking.service");
const logger_1 = require("../src/utils/logger");
async function runConcurrencyStressTest() {
    logger_1.logger.info('=====================================================');
    logger_1.logger.info('🧪 STARTING DATABASE CONCURRENCY & DOUBLE-BOOKING STRESS TEST');
    logger_1.logger.info('=====================================================');
    // Initialize DB
    await (0, database_1.initDatabase)();
    const db = (0, database_1.getDatabase)();
    // 1. Pick an event and find an available seat
    const eventRes = await db.query('SELECT id, title FROM events LIMIT 1');
    if (eventRes.rows.length === 0) {
        throw new Error('No events found to test. Run seed first.');
    }
    const testEvent = eventRes.rows[0];
    // Pick one specific seat
    const seatRes = await db.query(`SELECT id, seat_number FROM seats 
     WHERE event_id = $1 AND status = 'AVAILABLE' 
     LIMIT 1`, [testEvent.id]);
    if (seatRes.rows.length === 0) {
        throw new Error('No available seat found in test event');
    }
    const targetSeat = seatRes.rows[0];
    logger_1.logger.info(`Target event: "${testEvent.title}" (${testEvent.id})`);
    logger_1.logger.info(`Target seat: ${targetSeat.seat_number} (${targetSeat.id})`);
    // 2. Setup 50 distinct test users
    const totalConcurrentAttempts = 50;
    logger_1.logger.info(`Generating ${totalConcurrentAttempts} concurrent booking attempts for seat ${targetSeat.seat_number}...`);
    const userIds = [];
    for (let i = 0; i < totalConcurrentAttempts; i++) {
        const userEmail = `stress_test_user_${i}_${Date.now()}@example.com`;
        const userRes = await db.query(`INSERT INTO users (email, full_name, role) 
       VALUES ($1, $2, 'CUSTOMER') 
       RETURNING id`, [userEmail, `Stress Tester ${i}`]);
        userIds.push(userRes.rows[0].id);
    }
    logger_1.logger.info(`Firing ${totalConcurrentAttempts} simultaneous reservation requests at the exact same millisecond...`);
    // 3. Fire all requests concurrently with Promise.all
    const startTime = Date.now();
    const results = await Promise.allSettled(userIds.map((uid) => booking_service_1.BookingService.reserveSeats(uid, {
        eventId: testEvent.id,
        seatIds: [targetSeat.id],
        holdDurationSeconds: 300,
    })));
    const duration = Date.now() - startTime;
    let successCount = 0;
    let rejectedCount = 0;
    let errorReasons = {};
    for (const r of results) {
        if (r.status === 'fulfilled') {
            successCount++;
        }
        else {
            rejectedCount++;
            const reason = r.reason?.message || 'Unknown error';
            errorReasons[reason] = (errorReasons[reason] || 0) + 1;
        }
    }
    // 4. Verify database-level constraints directly
    const activeBookingsOnSeat = await db.query(`SELECT COUNT(*) as count FROM booking_seats 
     WHERE seat_id = $1 AND status IN ('HELD', 'BOOKED')`, [targetSeat.id]);
    const activeCountInDb = parseInt(activeBookingsOnSeat.rows[0]?.count || '0', 10);
    const seatStatusInDb = await db.query(`SELECT status, held_by_user_id, booking_id FROM seats WHERE id = $1`, [targetSeat.id]);
    logger_1.logger.info('-----------------------------------------------------');
    logger_1.logger.info(`⏱️ Duration: ${duration}ms`);
    logger_1.logger.info(`📊 Total Concurrent Requests: ${totalConcurrentAttempts}`);
    logger_1.logger.info(`✅ Successful Reservations: ${successCount}`);
    logger_1.logger.info(`❌ Rejected Reservations (Double-Booking Blocked): ${rejectedCount}`);
    logger_1.logger.info(`🛡️ Active Bookings Recorded in Database: ${activeCountInDb}`);
    logger_1.logger.info(`🪑 Seat Status in Database: ${seatStatusInDb.rows[0]?.status}`);
    logger_1.logger.info('Detailed Rejection Reasons:');
    for (const [reason, count] of Object.entries(errorReasons)) {
        logger_1.logger.info(`   - "${reason}": ${count} request(s)`);
    }
    logger_1.logger.info('-----------------------------------------------------');
    // Assertions
    if (successCount === 1 && rejectedCount === totalConcurrentAttempts - 1 && activeCountInDb === 1) {
        logger_1.logger.info('🎉 TEST PASSED! Double-booking is GUARANTEED IMPOSSIBLE at the database level!');
        process.exit(0);
    }
    else {
        logger_1.logger.error('💥 TEST FAILED: Concurrency violation detected!');
        logger_1.logger.error(`Expected 1 success, got ${successCount}. Expected 1 active row in DB, got ${activeCountInDb}.`);
        process.exit(1);
    }
}
runConcurrencyStressTest().catch((err) => {
    logger_1.logger.error('Fatal error during test:', err);
    process.exit(1);
});
