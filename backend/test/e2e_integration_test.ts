import { initDatabase, getDatabase } from '../src/config/database';
import { AuthService } from '../src/modules/auth/auth.service';
import { EventService } from '../src/modules/events/event.service';
import { SeatService } from '../src/modules/seats/seat.service';
import { BookingService } from '../src/modules/bookings/booking.service';
import { PaymentService } from '../src/modules/payments/payment.service';
import { SandstoneService } from '../src/modules/payments/sandstone.service';
import { findOrCreateOAuthUser } from '../src/config/passport';
import { logger } from '../src/utils/logger';

async function runEndToEndIntegrationTest() {
  logger.info('========================================================');
  logger.info('🚀 STARTING FULL-STACK END-TO-END INTEGRATION TEST');
  logger.info('========================================================');

  // 1. Initialize DB
  await initDatabase();
  const db = getDatabase();

  // 2. User Registration
  const timestamp = Date.now();
  const organizerData = await AuthService.register({
    email: `test_organizer_${timestamp}@showpass.com`,
    password: 'password123',
    fullName: 'Starlight Arena Host',
    role: 'ORGANIZER',
  });
  logger.info(`✅ Step 1: Registered Organizer (${organizerData.user.email})`);

  const customerData = await AuthService.register({
    email: `test_customer_${timestamp}@showpass.com`,
    password: 'password123',
    fullName: 'Alice Walker',
    role: 'CUSTOMER',
  });
  logger.info(`✅ Step 2: Registered Customer (${customerData.user.email})`);

  // 3. Create Event
  const newEvent = await EventService.createEvent(
    {
      title: 'Cosmic Symphonic Odyssey',
      description: 'An immersive orchestral symphony accompanied by 4K spatial projection mapping.',
      category: 'Concerts',
      venue: 'Metropolitan Dome, Screen 1',
      eventDate: '2026-11-20',
      eventTime: '20:30',
      price: 1000,
      rows: 5,
      cols: 6, // 30 seats total
      coverImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    },
    organizerData.user.id
  );
  logger.info(`✅ Step 3: Created Event "${newEvent.title}" (${newEvent.id}) with 30 generated seats.`);

  // 4. Query Seat Map
  const seatMap = await SeatService.getEventSeatMap(newEvent.id);
  if (seatMap.totalSeats !== 30 || seatMap.availableSeats !== 30) {
    throw new Error(`Expected 30 total & available seats, got ${seatMap.totalSeats}/${seatMap.availableSeats}`);
  }
  logger.info(`✅ Step 4: Retrieved Seat Map. Total: ${seatMap.totalSeats}, Available: ${seatMap.availableSeats}.`);

  const firstRow = seatMap.seatRows[0];
  const seat1 = firstRow.seats[0]; // VIP tier (1.5x = 1500)
  const seat2 = firstRow.seats[1];
  const seat3 = firstRow.seats[2];
  const seat4 = firstRow.seats[3];
  const seat5 = firstRow.seats[4];

  // 5. Test Maximum 4 Seats Rule (Attempt to book 5 seats)
  let maxSeatsBlocked = false;
  try {
    await BookingService.reserveSeats(customerData.user.id, {
      eventId: newEvent.id,
      seatIds: [seat1.id, seat2.id, seat3.id, seat4.id, seat5.id],
      holdDurationSeconds: 600,
    });
  } catch (err: any) {
    if (err.message.includes('4 seats')) {
      maxSeatsBlocked = true;
    }
  }
  if (!maxSeatsBlocked) {
    throw new Error('FAILED: System allowed booking more than 4 seats!');
  }
  logger.info('✅ Step 5: Max 4 seats restriction successfully enforced!');

  // 6. Reserve 2 Seats Validly
  const reservation = await BookingService.reserveSeats(customerData.user.id, {
    eventId: newEvent.id,
    seatIds: [seat1.id, seat2.id],
    holdDurationSeconds: 600,
  });
  logger.info(`✅ Step 6: Successfully held seats A1 & A2. Booking ID: ${reservation.booking_id}, Ref: ${reservation.booking_reference}, Total: ₹${reservation.total_amount}`);

  // 7. Verify Concurrent Conflict Protection
  // Another customer tries to book seat1 while it is held
  let conflictBlocked = false;
  const competitorCustomer = await AuthService.register({
    email: `competitor_${timestamp}@example.com`,
    password: 'password123',
    fullName: 'Bob Competitor',
    role: 'CUSTOMER',
  });

  try {
    await BookingService.reserveSeats(competitorCustomer.user.id, {
      eventId: newEvent.id,
      seatIds: [seat1.id],
      holdDurationSeconds: 600,
    });
  } catch (err: any) {
    conflictBlocked = true;
  }
  if (!conflictBlocked) {
    throw new Error('FAILED: Competitor was able to reserve already held seat!');
  }
  logger.info('✅ Step 7: Double-booking blocked while seat is HELD!');

  // 8. Create Sandstone Payment Intent
  const paymentIntent = await PaymentService.createPaymentIntent(customerData.user.id, {
    bookingId: reservation.booking_id,
  });
  logger.info(`✅ Step 8: Created Sandstone Order ${paymentIntent.order.orderId}, Merchant: ${paymentIntent.order.merchantId}`);

  // 9. Verify Tamper-Proof Signature Security (Attempt verify with forged signature)
  let invalidSignatureBlocked = false;
  try {
    await PaymentService.verifyPaymentAndConfirmBooking(customerData.user.id, {
      bookingId: reservation.booking_id,
      sandstoneOrderId: paymentIntent.order.orderId,
      sandstonePaymentId: 'sand_pay_fake123',
      signature: 'forged_fake_signature_abc123',
    });
  } catch (err: any) {
    invalidSignatureBlocked = true;
  }
  if (!invalidSignatureBlocked) {
    throw new Error('FAILED: System accepted an invalid payment signature!');
  }
  logger.info('✅ Step 9: Forged/invalid payment signature correctly rejected by server-side verification!');

  // 10. Submit Valid Cryptographic Signature & Confirm Booking
  const validPaymentId = `sand_pay_${Date.now()}`;
  const validSignature = SandstoneService.generateSandboxPaymentSignature(
    paymentIntent.order.orderId,
    validPaymentId
  );

  const confirmRes = await PaymentService.verifyPaymentAndConfirmBooking(customerData.user.id, {
    bookingId: reservation.booking_id,
    sandstoneOrderId: paymentIntent.order.orderId,
    sandstonePaymentId: validPaymentId,
    signature: validSignature,
    paymentMethod: 'CARD',
  });
  logger.info(`✅ Step 10: Payment verified and booking CONFIRMED! Status: ${confirmRes.status}`);

  // 11. Verify Database State
  const confirmedBooking = await BookingService.getBookingById(reservation.booking_id, customerData.user.id);
  if (confirmedBooking.status !== 'CONFIRMED' || confirmedBooking.payment_status !== 'PAID') {
    throw new Error(`Booking status mismatch. Expected CONFIRMED/PAID, got ${confirmedBooking.status}/${confirmedBooking.payment_status}`);
  }

  const updatedSeatMap = await SeatService.getEventSeatMap(newEvent.id);
  if (updatedSeatMap.bookedSeats !== 2 || updatedSeatMap.availableSeats !== 28) {
    throw new Error(`Seat map mismatch after booking confirmation. Expected 2 booked, got ${updatedSeatMap.bookedSeats}`);
  }
  logger.info(`✅ Step 11: Verified seat map: 2 permanently BOOKED, 28 AVAILABLE.`);

  // 12. Verify Organizer Dashboard Analytics
  const dashboard = await EventService.getOrganizerDashboard(organizerData.user.id);
  if (dashboard.summary.totalTicketsSold !== 2) {
    throw new Error(`Expected 2 tickets sold in organizer dashboard, got ${dashboard.summary.totalTicketsSold}`);
  }
  logger.info(`✅ Step 12: Organizer Dashboard verified! Total Revenue: ₹${dashboard.summary.totalRevenue}, Tickets: ${dashboard.summary.totalTicketsSold}`);

  // 13. Verify Google OAuth User Synchronisation, Account Linking & JWT Generation
  const oauthGoogleId = `google_oauth_sub_${Date.now()}`;
  const oauthEmail = `alex.rivers_${Date.now()}@gmail.com`;

  // 13a. Create new OAuth user
  const newOAuthUser = await findOrCreateOAuthUser({
    id: oauthGoogleId,
    email: oauthEmail,
    fullName: 'Alex Rivers',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    provider: 'google',
  });
  if (!newOAuthUser || newOAuthUser.email !== oauthEmail) {
    throw new Error(`OAuth user creation failed. Expected email ${oauthEmail}, got ${newOAuthUser?.email}`);
  }

  // 13b. Verify Idempotency on repeated OAuth login
  const repeatedOAuthUser = await findOrCreateOAuthUser({
    id: oauthGoogleId,
    email: oauthEmail,
    fullName: 'Alex Rivers Updated',
    provider: 'google',
  });
  if (repeatedOAuthUser.id !== newOAuthUser.id) {
    throw new Error(`OAuth idempotency failed. Expected user id ${newOAuthUser.id}, got ${repeatedOAuthUser.id}`);
  }

  // 13c. Verify Account Linking for existing local email
  const linkedOAuthUser = await findOrCreateOAuthUser({
    id: `google_link_${Date.now()}`,
    email: customerData.user.email,
    fullName: customerData.user.fullName,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    provider: 'google',
  });
  if (linkedOAuthUser.id !== customerData.user.id) {
    throw new Error(`OAuth account linking failed. Expected user id ${customerData.user.id}, got ${linkedOAuthUser.id}`);
  }
  // 14. Cleanup test event and user artifacts so tests never leave duplicate events in the catalog
  await db.query("DELETE FROM events WHERE title = 'Cosmic Symphonic Odyssey'");
  logger.info('🧹 Cleaned up e2e test event artifacts.');

  logger.info('========================================================');
  logger.info('🎉 ALL 13 END-TO-END INTEGRATION TESTS PASSED PERFECTLY!');
  logger.info('========================================================');
  process.exit(0);
}

runEndToEndIntegrationTest().catch((err) => {
  logger.error('Integration test failed:', err);
  process.exit(1);
});
