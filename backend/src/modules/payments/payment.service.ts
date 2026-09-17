import { getDatabase } from '../../config/database';
import { SandstoneService } from './sandstone.service';
import { CreatePaymentIntentInput, VerifyPaymentInput, SandstoneWebhookPayload } from './payment.types';
import { logger } from '../../utils/logger';

export class PaymentService {
  /**
   * Create payment intent with Sandstone Gateway
   */
  static async createPaymentIntent(userId: string, input: CreatePaymentIntentInput) {
    const db = getDatabase();

    // Check if booking exists, belongs to user, and is not expired
    const bookingRes = await db.query(
      `SELECT b.*, u.email, u.full_name, e.title as event_title
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN events e ON b.event_id = e.id
       WHERE b.id = $1`,
      [input.bookingId]
    );

    if (bookingRes.rows.length === 0) {
      const error: any = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    const booking = bookingRes.rows[0];

    if (booking.user_id !== userId) {
      const error: any = new Error('Unauthorized. You do not own this booking.');
      error.statusCode = 403;
      throw error;
    }

    if (booking.status === 'CONFIRMED') {
      const error: any = new Error('This booking is already confirmed and paid.');
      error.statusCode = 400;
      throw error;
    }

    if (booking.status === 'EXPIRED' || new Date(booking.expires_at) < new Date()) {
      const error: any = new Error('Hold expired. The reserved seats have been released. Please reselect seats.');
      error.statusCode = 410;
      throw error;
    }

    // Call Sandstone Gateway
    const sandstoneOrder = await SandstoneService.createOrder({
      bookingId: booking.id,
      amount: parseFloat(booking.total_amount),
      customerEmail: booking.email,
      customerName: booking.full_name,
    });

    // Save payment intent record in DB
    await db.query(
      `INSERT INTO payments (booking_id, sandstone_order_id, amount, currency, status)
       VALUES ($1, $2, $3, $4, 'CREATED')
       ON CONFLICT (sandstone_order_id) DO UPDATE SET updated_at = NOW()`,
      [booking.id, sandstoneOrder.orderId, sandstoneOrder.amount, sandstoneOrder.currency]
    );

    // Update booking with payment intent ID
    await db.query(
      `UPDATE bookings SET payment_intent_id = $1, payment_status = 'PROCESSING' WHERE id = $2`,
      [sandstoneOrder.orderId, booking.id]
    );

    return {
      order: sandstoneOrder,
      booking: {
        id: booking.id,
        bookingReference: booking.booking_reference,
        eventTitle: booking.event_title,
        totalAmount: parseFloat(booking.total_amount),
        expiresAt: booking.expires_at,
      },
    };
  }

  /**
   * CRITICAL: Server-side Payment Verification
   * Never confirm merely because frontend claims success.
   * Cryptographically verifies HMAC-SHA256 signature and executes atomic confirm_booking_payment RPC.
   */
  static async verifyPaymentAndConfirmBooking(userId: string, input: VerifyPaymentInput) {
    const db = getDatabase();
    logger.info(`[PaymentService] Verifying payment for booking ${input.bookingId}, order ${input.sandstoneOrderId}`);

    // 1. Check booking validity
    const bookingRes = await db.query(
      'SELECT id, user_id, total_amount, status, expires_at FROM bookings WHERE id = $1',
      [input.bookingId]
    );

    if (bookingRes.rows.length === 0) {
      const error: any = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    const booking = bookingRes.rows[0];

    if (booking.user_id !== userId) {
      const error: any = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    if (booking.status === 'CONFIRMED') {
      return {
        success: true,
        alreadyConfirmed: true,
        bookingId: booking.id,
        message: 'Booking has already been confirmed.',
      };
    }

    if (booking.status === 'EXPIRED' || new Date(booking.expires_at) < new Date()) {
      const error: any = new Error('Hold expired. Payment verification aborted and seats released.');
      error.statusCode = 410;
      throw error;
    }

    // 2. Cryptographic signature verification with Sandstone secret
    const isSignatureValid = SandstoneService.verifyPaymentSignature({
      orderId: input.sandstoneOrderId,
      paymentId: input.sandstonePaymentId,
      signature: input.signature,
    });

    if (!isSignatureValid) {
      logger.error(`[PaymentService] Cryptographic signature check FAILED for order ${input.sandstoneOrderId}`);
      await db.query(
        `UPDATE payments SET status = 'FAILED', updated_at = NOW() WHERE sandstone_order_id = $1`,
        [input.sandstoneOrderId]
      );
      const error: any = new Error('Payment verification failed: invalid gateway signature');
      error.statusCode = 400;
      throw error;
    }

    logger.info(`[PaymentService] Signature verified successfully. Calling atomic confirm_booking_payment RPC...`);

    // 3. Execute PostgreSQL transactional RPC confirm_booking_payment
    const rpcRes = await db.query(
      'SELECT confirm_booking_payment($1::uuid, $2::varchar, $3::numeric) as result',
      [input.bookingId, input.sandstonePaymentId, parseFloat(booking.total_amount)]
    );

    const rpcResult = rpcRes.rows[0]?.result;

    // 4. Update payments table record
    await db.query(
      `UPDATE payments 
       SET sandstone_payment_id = $1,
           signature = $2,
           status = 'CAPTURED',
           payment_method = $3,
           updated_at = NOW()
       WHERE sandstone_order_id = $4`,
      [input.sandstonePaymentId, input.signature, input.paymentMethod || 'CARD', input.sandstoneOrderId]
    );

    logger.info(`[PaymentService] Booking ${input.bookingId} successfully confirmed via Sandstone Gateway!`);

    return {
      success: true,
      bookingId: input.bookingId,
      bookingReference: rpcResult.booking_reference,
      sandstonePaymentId: input.sandstonePaymentId,
      status: 'CONFIRMED',
    };
  }

  /**
   * Process Sandstone Webhooks
   */
  static async processWebhook(rawBody: string | Buffer, signatureHeader: string, payload: SandstoneWebhookPayload) {
    const isValid = SandstoneService.verifyWebhookSignature(rawBody, signatureHeader);
    if (!isValid) {
      logger.warn('[PaymentService Webhook] Webhook signature invalid.');
      const error: any = new Error('Invalid webhook signature');
      error.statusCode = 401;
      throw error;
    }

    const db = getDatabase();
    logger.info(`[PaymentService Webhook] Processing event ${payload.event} for order ${payload.data.orderId}`);

    if (payload.event === 'payment.succeeded') {
      const { bookingId, paymentId, amount } = payload.data;
      await db.query(
        'SELECT confirm_booking_payment($1::uuid, $2::varchar, $3::numeric)',
        [bookingId, paymentId, amount]
      );

      await db.query(
        `UPDATE payments 
         SET status = 'CAPTURED', sandstone_payment_id = $1, updated_at = NOW() 
         WHERE sandstone_order_id = $2`,
        [paymentId, payload.data.orderId]
      );
    }

    return { received: true };
  }

  /**
   * Sandbox simulation helper for frontend modal checkout
   */
  static generateSandboxSignature(orderId: string, paymentId: string) {
    return SandstoneService.generateSandboxPaymentSignature(orderId, paymentId);
  }
}
