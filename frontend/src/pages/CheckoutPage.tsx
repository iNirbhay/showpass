import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BookingService } from '../services/booking.service';
import { PaymentService } from '../services/payment.service';
import { HoldCountdownTimer } from '../components/payment/HoldCountdownTimer';
import { SandstoneModal } from '../components/payment/SandstoneModal';
import { SandstoneOrder } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  Loader2,
  CreditCard,
  Tv,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [isSandstoneModalOpen, setIsSandstoneModalOpen] = useState(false);
  const [sandstoneOrder, setSandstoneOrder] = useState<SandstoneOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Fetch Booking Details
  const { data: booking, isLoading, refetch } = useQuery({
    queryKey: ['booking-detail', bookingId],
    queryFn: () => BookingService.getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  // Create Sandstone Payment Intent Mutation
  const createIntentMutation = useMutation({
    mutationFn: () => PaymentService.createIntent(bookingId!),
    onSuccess: (data) => {
      setSandstoneOrder(data.order);
      setIsSandstoneModalOpen(true);
    },
    onError: (err: any) => {
      console.error('Create intent error:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to initialize Sandstone checkout. Please try again.'
      );
    },
  });

  const handleStartSandstonePayment = () => {
    if (isExpired) return;
    setErrorMessage(null);
    createIntentMutation.mutate();
  };

  const handlePaymentSuccess = () => {
    setIsSandstoneModalOpen(false);
    navigate(`/bookings/${bookingId}/confirmation`);
  };

  if (isLoading) {
    return (
      <div className="py-36 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#FACC15]" />
        </div>
        <p className="text-xs text-slate-400 font-mono">Retrieving secured booking order...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-2xl font-display font-bold text-[#FFFBEB]">Booking Order Expired</h2>
        <p className="text-xs text-slate-400">This temporary hold reservation was not found or has been automatically released.</p>
        <Link to="/events" className="inline-flex items-center gap-2 text-xs text-[#FACC15] hover:text-[#FDE68A] font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Browse Live Showtimes
        </Link>
      </div>
    );
  }

  // If already confirmed
  if (booking.status === 'CONFIRMED') {
    navigate(`/bookings/${bookingId}/confirmation`, { replace: true });
    return null;
  }

  const subtotal = Number(booking.total_amount);
  const finalPayable = subtotal;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 sm:px-6 pb-28">
      {/* Top Breadcrumb & Heading */}
      <div className="space-y-2">
        <Link
          to={`/events/${booking.event_id}/seats`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Return to Seat Matrix</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Review & Complete Reservation
        </h1>
        <p className="text-xs text-slate-500">
          Your selected seats are currently locked under row-level database exclusivity. Complete payment to mint your digital admission pass.
        </p>
      </div>

      {/* Expiry / Hold Timer */}
      {booking.status === 'PENDING' && (
        <HoldCountdownTimer
          expiresAt={booking.expires_at}
          onExpire={() => setIsExpired(true)}
        />
      )}

      {isExpired && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>The 10-minute hold window expired. These seats have been returned to public inventory.</span>
          </div>
          <Link
            to={`/events/${booking.event_id}/seats`}
            className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-500 transition shadow-xs"
          >
            Re-select Seats
          </Link>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left 7 Cols: Screening Info & Reserved Seats List */}
        <div className="md:col-span-7 space-y-6">
          {/* Event Card Info */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {booking.event_category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {booking.event_title}
                </h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                REF: {booking.booking_reference}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span className="text-slate-800 font-medium">{new Date(booking.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-slate-800 font-medium">{booking.event_time} IST</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="truncate text-slate-700 font-medium">{booking.event_venue}</span>
              </div>
            </div>
          </div>

          {/* Reserved Seats List */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-500" />
                <span>Locked Seats ({booking.seats?.length || 0})</span>
              </h4>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Database Exclusive Lock</span>
              </span>
            </div>

            <div className="space-y-2.5">
              {booking.seats?.map((seat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-white text-slate-900 font-mono font-bold flex items-center justify-center text-xs border border-slate-200 shadow-2xs">
                      {seat.seatNumber}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">Row {seat.rowLabel}, Seat {seat.colNumber}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{seat.tier} Tier</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">₹{Number(seat.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Payment Breakdown & Sandstone Pay CTA */}
        <div className="md:col-span-5 space-y-6">
          <div className="sticky top-24 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3.5">
              Settlement Breakdown
            </h4>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Admission Subtotal ({booking.seat_count} seats)</span>
                <span className="text-slate-900 font-mono font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Integrated Sandstone Fee</span>
                <span className="text-emerald-700 font-semibold">Included (₹0.00)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Database Seat Hold</span>
                <span className="text-amber-700 font-semibold">Active (10m)</span>
              </div>
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Total Payable</span>
                <span className="text-2xl font-black text-slate-950 font-mono">
                  ₹{finalPayable.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Gateway Trigger */}
            <button
              onClick={handleStartSandstonePayment}
              disabled={isExpired || createIntentMutation.isPending}
              className="w-full py-3.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-500 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createIntentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Sandstone Gateway...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay via Sandstone Gateway</span>
                </>
              )}
            </button>

            {/* Gateway trust */}
            <div className="pt-2 text-center text-[11px] text-slate-500 space-y-1.5 border-t border-slate-100">
              <p className="flex items-center justify-center gap-1.5 text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>HMAC-SHA256 Encrypted Protocol</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Supports UPI QR, Test Cards, & Net Banking
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sandstone Payment Gateway Modal */}
      {sandstoneOrder && (
        <SandstoneModal
          isOpen={isSandstoneModalOpen}
          onClose={() => setIsSandstoneModalOpen(false)}
          order={sandstoneOrder}
          bookingId={booking.id}
          bookingReference={booking.booking_reference}
          eventTitle={booking.event_title}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
