import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';

export class PaymentController {
  static async createIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PaymentService.createPaymentIntent(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Sandstone payment intent created',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PaymentService.verifyPaymentAndConfirmBooking(req.user!.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Payment verified and booking confirmed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signatureHeader = req.headers['x-sandstone-signature'] as string;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      const result = await PaymentService.processWebhook(rawBody, signatureHeader, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getSandboxSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, paymentId } = req.body;
      if (!orderId || !paymentId) {
        res.status(400).json({ success: false, message: 'orderId and paymentId are required' });
        return;
      }
      const signature = PaymentService.generateSandboxSignature(orderId, paymentId);
      res.status(200).json({ success: true, signature });
    } catch (err) {
      next(err);
    }
  }
}
