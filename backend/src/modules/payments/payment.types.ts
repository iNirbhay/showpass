import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
});

export const verifyPaymentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  sandstoneOrderId: z.string().min(1, 'Order ID is required'),
  sandstonePaymentId: z.string().min(1, 'Payment ID is required'),
  signature: z.string().min(1, 'Payment signature is required'),
  paymentMethod: z.string().optional().default('CARD'),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export interface SandstoneOrder {
  orderId: string;
  amount: number;
  currency: string;
  merchantId: string;
  clientSecret: string;
  status: 'CREATED' | 'ATTEMPTED' | 'PAID';
  createdAt: number;
}

export interface SandstoneWebhookPayload {
  event: 'payment.succeeded' | 'payment.failed' | 'payment.authorized';
  data: {
    orderId: string;
    paymentId: string;
    amount: number;
    currency: string;
    bookingId: string;
    paymentMethod?: string;
  };
}
