import { api } from './api';
import { PaymentIntentResponse } from '../types';

export const PaymentService = {
  async createIntent(bookingId: string): Promise<PaymentIntentResponse> {
    const res = await api.post('/payments/intent', { bookingId });
    return res.data.data;
  },

  async verifyPayment(data: {
    bookingId: string;
    sandstoneOrderId: string;
    sandstonePaymentId: string;
    signature: string;
    paymentMethod?: string;
  }) {
    const res = await api.post('/payments/verify', data);
    return res.data.data;
  },

  async getSandboxSignature(orderId: string, paymentId: string): Promise<string> {
    const res = await api.post('/payments/sandbox/sign', { orderId, paymentId });
    return res.data.signature;
  },
};
