import React, { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingService } from '../services/booking.service';
import { EventService } from '../services/event.service';
import { useAuth } from '../context/AuthContext';
import { InteractiveSeatGrid } from '../components/seat-map/InteractiveSeatGrid';
import { SeatLegend } from '../components/seat-map/SeatLegend';
import { Seat } from '../types';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  X,
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';

export const SeatSelectionPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const cinemaParam = searchParams.get('cinema');
  const timeParam = searchParams.get('time');
  const dateParam = searchParams.get('date');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Event Details
  const { data: event } = useQuery({
    queryKey: ['event-detail', eventId],
    queryFn: () => EventService.getEventById(eventId!),
    enabled: !!eventId,
  });

  // Fetch Seat Map with polling for live availability
  const { 
    data: seatMap, 
    isLoading: isSeatsLoading, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['event-seats', eventId],
    queryFn: () => BookingService.getEventSeats(eventId!),
    enabled: !!eventId,
    refetchInterval: 6000, // 6 seconds live seat poll
  });

  // Calculate formatted display date
  const displayDate = dateParam || (event ? new Date(event.event_date).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Today');

  const displayTime = timeParam || (event ? event.event_time : '07:30 PM');
  const displayCinema = cinemaParam || (event ? event.venue : 'CINTEL Grand Audi 01');

  // Reserve Seats Mutation
  const reserveMutation = useMutation({
    mutationFn: (seatIds: string[]) =>
      BookingService.reserveSeats({
        eventId: eventId!,
        seatIds,
        holdDurationSeconds: 600, // 10 minutes
        showDate: displayDate,
        showTime: displayTime,
        cinemaName: displayCinema,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-seats', eventId] });
      navigate(`/checkout/${data.booking_id}`);
    },
    onError: (err: any) => {
      console.error('Reservation error:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to reserve seats. Someone else may have just reserved them.';
      setErrorMessage(msg);
      refetch();
    },
  });

  const handleSeatToggle = (seat: Seat) => {
    setErrorMessage(null);
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      } else {
        if (prev.length >= 4) return prev;
        return [...prev, seat];
      }
    });
  };

  const handleRemoveSeat = (seatId: string) => {
    setSelectedSeats((prev) => prev.filter((s) => s.id !== seatId));
  };

  const handleClearAll = () => {
    setSelectedSeats([]);
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) return;

    if (!isAuthenticated) {
      const redirectUrl = `/events/${eventId}/seats?cinema=${encodeURIComponent(displayCinema)}&time=${encodeURIComponent(displayTime)}&date=${encodeURIComponent(displayDate)}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    setErrorMessage(null);
    const seatIds = selectedSeats.map((s) => s.id);
    reserveMutation.mutate(seatIds);
  };

  // Pricing calculations
  const ticketBaseTotal = selectedSeats.reduce((sum, s) => sum + Number(s.finalPrice), 0);
  const convenienceFee = selectedSeats.length > 0 ? 29 : 0;
  const grandTotal = ticketBaseTotal + convenienceFee;

  if (isSeatsLoading && !seatMap) {
    return (
      <div className="min-h-screen bg-[#0A0D14] py-36 flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
        <p className="text-xs text-slate-400 font-mono">Calibrating auditorium seat matrix...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white">
      {/* 1. CINEMATIC DOSSIER HEADER (Image 3 Reference) */}
      <section className="relative w-full border-b border-slate-800/80 bg-[#0C101A]/95 backdrop-blur-md overflow-hidden">
        {/* Subtle backdrop glow */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <img
            src={event?.backdrop_url || event?.cover_image_url || '/posters/mirzapur.png'}
            alt=""
            className="w-full h-full object-cover object-top blur-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14] via-[#0A0D14]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Back button */}
          <div className="mb-3">
            <Link
              to={`/events/${eventId}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left Movie Info Dossier */}
            <div className="flex items-center gap-4">
              {/* Poster Thumbnail */}
              {event?.cover_image_url && (
                <div className="w-14 sm:w-16 aspect-[2/3] rounded-xl overflow-hidden shadow-xl border border-white/20 flex-shrink-0 bg-slate-900">
                  <img
                    src={event.cover_image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {event?.title || 'Screening'}
                  </h1>
                  {isFetching && (
                    <span title="Syncing live availability in real-time">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                    </span>
                  )}
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-white/10 text-amber-300 border border-white/10">
                    {event?.certification || 'UA16+'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {event?.duration || '2h 24m'}
                  </span>
                  {event?.genres?.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* Cinema & Date Details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold">{displayCinema}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{displayDate}</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono font-bold text-white">
                    {displayTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Quota Progress Pill */}
            <div className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-[#131724] border border-slate-800 text-xs font-semibold text-slate-300 shadow-sm flex items-center gap-2">
              <span className="text-slate-400">Selected:</span>
              <span className={`font-mono font-bold ${selectedSeats.length === 4 ? 'text-amber-400' : 'text-white'}`}>
                {selectedSeats.length} / 4 seats
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE-COLUMN AUDITORIUM CHAMBER (Image 3 Reference) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold transition"
            >
              Refresh Grid
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Seat Legend & Support Card (Col span 3) */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <SeatLegend />
          </div>

          {/* CENTER COLUMN: Auditorium Screen & Interactive Seat Matrix (Col span 6) */}
          <div className="lg:col-span-6 order-1 lg:order-2 p-6 sm:p-8 rounded-3xl bg-[#0E121D]/90 border border-slate-800/80 shadow-2xl backdrop-blur-md">
            <InteractiveSeatGrid
              seatMap={seatMap || {
                eventId: eventId || '',
                rows: 9,
                cols: 14,
                basePrice: event ? Number(event.price) : 260,
                totalSeats: 126,
                availableSeats: 126,
                bookedSeats: 0,
                heldSeats: 0,
                seatRows: []
              }}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatToggle}
              maxSeats={4}
            />
          </div>

          {/* RIGHT COLUMN: Your Selection & Price Details (Col span 3) */}
          <div className="lg:col-span-3 order-3 p-5 rounded-3xl bg-[#10141E]/90 border border-slate-800/80 text-white backdrop-blur-md space-y-5 shadow-2xl sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Your Selection</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {selectedSeats.length === 0
                    ? 'No seats selected'
                    : `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} selected`}
                </p>
              </div>

              {selectedSeats.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-slate-400 hover:text-amber-400 font-medium transition"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Selected Seats Chips */}
            {selectedSeats.length === 0 ? (
              <div className="py-8 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl bg-[#0D101A]/60">
                <p className="text-xs text-slate-400 font-medium">Select up to 4 seats</p>
                <p className="text-[10px] text-slate-600">Click any available seat in the map</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                {selectedSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="p-3 rounded-2xl bg-[#161C2B] border border-slate-700/80 flex items-center justify-between text-xs animate-fadeIn"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{seat.seatNumber}</span>
                        <span className="text-slate-500">•</span>
                        <span className={`text-[11px] ${
                          seat.seatTier === 'VIP'
                            ? 'text-amber-300 font-semibold'
                            : seat.seatTier === 'PREMIUM'
                            ? 'text-amber-200'
                            : 'text-slate-400'
                        }`}>
                          {seat.seatTier}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-amber-400">
                        ₹{seat.finalPrice}
                      </span>
                      <button
                        onClick={() => handleRemoveSeat(seat.id)}
                        className="w-5 h-5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                        title="Remove seat"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Price Details */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Price Details
              </h4>

              <div className="flex items-center justify-between text-slate-400">
                <span>Ticket Price ({selectedSeats.length})</span>
                <span className="font-mono font-medium text-slate-200">₹{ticketBaseTotal}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Convenience Fee</span>
                <span className="font-mono font-medium text-slate-200">₹{convenienceFee}</span>
              </div>

              <div className="w-full border-t border-slate-800 pt-2 flex items-center justify-between">
                <span className="font-bold text-white text-sm">Total Amount</span>
                <span className="font-mono font-black text-xl text-amber-400">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* Big Proceed to Pay CTA Button */}
            <button
              onClick={handleProceedToCheckout}
              disabled={selectedSeats.length === 0 || reserveMutation.isPending}
              className={`w-full py-3.5 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all duration-150 ${
                selectedSeats.length > 0 && !reserveMutation.isPending
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/20 active:scale-98 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {reserveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Locking Seats...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>100% Secure Payments • Sandstone Certified</span>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Floating Sticky Bottom Bar for Quick Checkout */}
      {selectedSeats.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C101A]/95 border-t border-slate-800 backdrop-blur-xl px-4 py-3.5 shadow-2xl animate-slideUp">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">
                {selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'} selected
              </span>
              <span className="font-mono font-black text-lg text-amber-400">
                ₹{grandTotal}
              </span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={reserveMutation.isPending}
              className="py-2.5 px-5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-400/20 active:scale-95 transition"
            >
              {reserveMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Locking...</span>
                </>
              ) : (
                <>
                  <span>Pay Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
