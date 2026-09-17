import crypto from 'crypto';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { SandstoneOrder } from './payment.types';

export class SandstoneService {
  /**
   * Create a payment order/intent with Sandstone Payment Gateway
   */
  static async createOrder(params: {
    bookingId: string;
    amount: number;
    currency?: string;
    customerEmail?: string;
    customerName?: string;
  }): Promise<SandstoneOrder> {
    const currency = params.currency || 'INR';
    const orderId = `sand_ord_${crypto.randomBytes(12).toString('hex')}`;
    const timestamp = Date.now();

    // Generate cryptographic clientSecret / checkout token using SANDSTONE_SECRET_KEY
    const clientSecretData = `${env.SANDSTONE_MERCHANT_ID}:${orderId}:${params.amount}:${currency}:${timestamp}`;
    const clientSecret = crypto
      .createHmac('sha256', env.SANDSTONE_SECRET_KEY)
      .update(clientSecretData)
      .digest('hex');

    logger.info(`[Sandstone Gateway] Created order ${orderId} for booking ${params.bookingId}, amount: ${params.amount} ${currency}`);

    return {
      orderId,
      amount: params.amount,
      currency,
      merchantId: env.SANDSTONE_MERCHANT_ID,
      clientSecret: `sec_${clientSecret}`,
      status: 'CREATED',
      createdAt: timestamp,
    };
  }

  /**
   * Cryptographically verify payment signature returned after user checkout
   * Ensures payment cannot be spoofed by client modifications
   */
  static verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    const { orderId, paymentId, signature } = params;

    if (!orderId || !paymentId || !signature) {
      return false;
    }

    // Expected signature = HMAC-SHA256(orderId + "|" + paymentId, SANDSTONE_SECRET_KEY)
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.SANDSTONE_SECRET_KEY)
      .update(payload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const providedBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== providedBuffer.length) {
      logger.warn(`[Sandstone Gateway] Signature length mismatch for order ${orderId}`);
      return false;
    }

    const isValid = crypto.timingSafeEqual(expectedBuffer, providedBuffer);
    if (!isValid) {
      logger.warn(`[Sandstone Gateway] Invalid payment signature for order ${orderId}`);
    }

    return isValid;
  }

  /**
   * Helper to sign payment proof (used by Sandstone checkout modal during sandbox testing)
   */
  static generateSandboxPaymentSignature(orderId: string, paymentId: string): string {
    const payload = `${orderId}|${paymentId}`;
    return crypto
      .createHmac('sha256', env.SANDSTONE_SECRET_KEY)
      .update(payload)
      .digest('hex');
  }

  /**
   * Cryptographically verify Sandstone Webhook signature
   */
  static verifyWebhookSignature(rawBody: string | Buffer, signatureHeader: string): boolean {
    if (!rawBody || !signatureHeader) return false;

    const expectedSignature = crypto
      .createHmac('sha256', env.SANDSTONE_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const providedBuffer = Buffer.from(signatureHeader, 'utf8');

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  }
}
