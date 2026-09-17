import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { createPaymentIntentSchema, verifyPaymentSchema } from './payment.types';

export const paymentRoutes = Router();

// Create Sandstone payment intent (Protected)
paymentRoutes.post(
  '/intent',
  authenticateToken,
  validateRequest({ body: createPaymentIntentSchema }),
  PaymentController.createIntent
);

// Verify payment server-side and confirm booking (Protected)
paymentRoutes.post(
  '/verify',
  authenticateToken,
  validateRequest({ body: verifyPaymentSchema }),
  PaymentController.verifyPayment
);

// Secure Webhook for asynchronous payment notification from Sandstone
paymentRoutes.post('/webhook', PaymentController.handleWebhook);

// Sandbox helper for signing test payments in dev environment
paymentRoutes.post('/sandbox/sign', authenticateToken, PaymentController.getSandboxSignature);
