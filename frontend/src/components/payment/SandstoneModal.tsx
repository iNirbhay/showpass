import React, { useState } from 'react';
import { 
  Lock, 
  CreditCard, 
  Smartphone, 
  Building, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  Loader2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { PaymentService } from '../../services/payment.service';
import { SandstoneOrder } from '../../types';

interface SandstoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SandstoneOrder;
  bookingId: string;
  bookingReference: string;
  eventTitle: string;
  onPaymentSuccess: (confirmedData: any) => void;
}

export const SandstoneModal: React.FC<SandstoneModalProps> = ({
  isOpen,
  onClose,
  order,
  bookingId,
  bookingReference,
  eventTitle,
  onPaymentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState('John Doe');

  // UPI state
  const [vpa, setVpa] = useState('user@okhdfcbank');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  if (!isOpen) return null;

  const handleFillTestCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setExpiry('12/28');
    setCvv('888');
    setCardHolder('Sandstone Sandbox Tester');
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Generate sandbox payment ID and HMAC-SHA256 signature
      const mockPaymentId = `sand_pay_${Math.random().toString(36).substring(2, 14)}`;
      const signature = await PaymentService.getSandboxSignature(order.orderId, mockPaymentId);

      // 2. CRITICAL Server-Side Payment Verification Guard
      const verificationResponse = await PaymentService.verifyPayment({
        bookingId,
        sandstoneOrderId: order.orderId,
        sandstonePaymentId: mockPaymentId,
        signature,
        paymentMethod: activeTab.toUpperCase(),
      });

      onPaymentSuccess(verificationResponse);
    } catch (err: any) {
      console.error('Sandstone payment error:', err);
      setErrorMessage(
        err.response?.data?.message || err.message || 'Payment processing failed.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900">
        {/* Gateway Header */}
        <div className="bg-slate-900 p-5 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-display font-black text-sm shadow-xs">
              <Lock className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Sandstone Payment Gateway
                </h3>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  256-BIT ENCRYPTED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Merchant: {order.merchantId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Summary Bar */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500">Ref:</span>{' '}
            <span className="font-mono font-bold text-slate-900">{bookingReference}</span>
            <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{eventTitle}</p>
          </div>
          <div className="text-right">
            <span className="text-slate-500 text-[10px] uppercase font-mono block">Amount Payable</span>
            <p className="text-lg font-mono font-black text-amber-600">
              ₹{order.amount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 shadow-xs">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="p-5 space-y-4">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('card')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                activeTab === 'card'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Card</span>
            </button>
            <button
              onClick={() => setActiveTab('upi')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                activeTab === 'upi'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>UPI / QR</span>
            </button>
            <button
              onClick={() => setActiveTab('netbanking')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                activeTab === 'netbanking'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Net Banking</span>
            </button>
          </div>

          {/* TAB 1: CARD */}
          {activeTab === 'card' && (
            <div className="space-y-3.5">
              {/* Card visual graphic */}
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-slate-400">SANDSTONE DEBIT/CREDIT</span>
                  <span className="font-mono font-bold text-xs text-amber-400">VISA</span>
                </div>
                <div className="font-mono text-base tracking-widest pt-1 text-white">
                  {cardNumber}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>CARDHOLDER: {cardHolder.toUpperCase()}</span>
                  <span>EXP: {expiry}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-600 font-medium">Card Information</span>
                <button
                  type="button"
                  onClick={handleFillTestCard}
                  className="text-[11px] font-mono font-semibold text-amber-700 hover:text-amber-800 transition flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" /> Auto-fill Test Card
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 transition"
                  placeholder="Card number"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 transition"
                  placeholder="MM/YY"
                />
                <input
                  type="password"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 transition"
                  placeholder="CVV"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
                  placeholder="Cardholder Name"
                />
              </div>
            </div>
          )}

          {/* TAB 2: UPI */}
          {activeTab === 'upi' && (
            <div className="space-y-4 text-center py-2">
              <div className="inline-block p-3 rounded-2xl bg-white border border-slate-200 shadow-md">
                <div className="w-32 h-32 grid grid-cols-5 gap-1 bg-slate-100 p-1.5 rounded-xl">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 || i % 3 === 0) ? 'bg-slate-900' : 'bg-transparent'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Scan with any UPI App (GPay, PhonePe, Paytm)
              </p>
              <div className="text-left">
                <label className="block text-[11px] text-slate-500 mb-1 font-mono font-medium">OR ENTER UPI VPA</label>
                <input
                  type="text"
                  value={vpa}
                  onChange={(e) => setVpa(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          )}

          {/* TAB 3: NET BANKING */}
          {activeTab === 'netbanking' && (
            <div className="space-y-2.5">
              <span className="text-xs text-slate-600 block font-medium">Select Banking Institution</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    className={`p-3 rounded-xl border text-left font-medium transition ${
                      selectedBank === b
                        ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-400 transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying with Sandstone Server...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authorize ₹{order.amount.toFixed(2)} Payment</span>
                </div>
              )}
            </button>

            <p className="text-[10px] font-mono text-center text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              HMAC-SHA256 Server-side Verification Protocol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
