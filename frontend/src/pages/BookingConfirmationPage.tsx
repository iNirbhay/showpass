import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import { BookingService } from '../services/booking.service';
import { DigitalTicket } from '../components/ticket/DigitalTicket';
import { CheckCircle2, Ticket, ArrowLeft, Loader2, Calendar, Sparkles, Download, ArrowRight } from 'lucide-react';

export const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking-confirmation', bookingId],
    queryFn: () => BookingService.getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  useEffect(() => {
    if (booking && booking.status === 'CONFIRMED') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#FDE68A', '#FFFBEB', '#EAB308', '#CA8A04'],
      });
    }
  }, [booking]);

  if (isLoading) {
    return (
      <div className="py-36 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#FACC15]" />
        </div>
        <p className="text-xs text-slate-400 font-mono">Generating certified Sandstone admission pass...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-2xl font-display font-bold text-[#FFFBEB]">Booking Record Not Found</h2>
        <Link to="/my-bookings" className="text-xs text-[#FACC15] hover:text-[#FDE68A] font-semibold hover:underline">
          Go to My Passes & Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 px-4 pb-28 text-center">
      {/* Celebration Header */}
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Payment Verified • Sandstone Gateway</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Admission Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Your reservation was cryptographically authorized and locked. Present this admission ticket QR at the auditorium usher console.
        </p>
      </div>

      {/* Digital Admission Ticket */}
      <DigitalTicket booking={booking} />

      {/* Navigation Links */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 print:hidden">
        <Link
          to="/my-bookings"
          className="px-6 py-3 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-500 transition shadow-sm flex items-center gap-2 active:scale-95"
        >
          <Ticket className="w-4 h-4" />
          <span>View All My Bookings</span>
        </Link>
        <Link
          to="/events"
          className="px-6 py-3 rounded-xl font-bold text-xs text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200 transition flex items-center gap-2 shadow-xs active:scale-95"
        >
          <span>Discover More Screenings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
