import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookingService } from '../services/booking.service';
import { DigitalTicket } from '../components/ticket/DigitalTicket';
import { Booking } from '../types';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  Loader2, 
  ArrowRight,
  Eye,
  X,
  Sparkles
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const [selectedTicketBooking, setSelectedTicketBooking] = useState<Booking | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'CONFIRMED' | 'OTHER'>('ALL');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => BookingService.getMyBookings(),
  });

  const filteredBookings = bookings?.filter((b) => {
    if (filterTab === 'CONFIRMED') return b.status === 'CONFIRMED';
    if (filterTab === 'OTHER') return b.status !== 'CONFIRMED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED PASS
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse">
            <Clock3 className="w-3.5 h-3.5" /> PENDING CHECKOUT
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> CANCELLED
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-surface-elevated text-slate-400 border border-white/10">
            EXPIRED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Ticket className="w-4 h-4" />
            <span>Digital Admission Wallet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Passes & Reservations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Access your Sandstone-verified admission passes, seat details, and contactless QR codes.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3.5 py-1.5 rounded-lg transition active:scale-95 ${
              filterTab === 'ALL' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Bookings
          </button>
          <button
            onClick={() => setFilterTab('CONFIRMED')}
            className={`px-3.5 py-1.5 rounded-lg transition active:scale-95 ${
              filterTab === 'CONFIRMED' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilterTab('OTHER')}
            className={`px-3.5 py-1.5 rounded-lg transition active:scale-95 ${
              filterTab === 'OTHER' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending / Past
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          </div>
          <p className="text-xs text-slate-500 font-mono">Loading admission wallet...</p>
        </div>
      ) : filteredBookings && filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 hover:border-amber-400/80 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs hover:shadow-md"
            >
              {/* Event Info */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-16 h-22 sm:w-20 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 shadow-2xs">
                  <img
                    src={
                      b.event_cover_image ||
                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {getStatusBadge(b.status)}
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      REF: {b.booking_reference}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {b.event_title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-slate-700 font-medium">{new Date(b.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-mono text-slate-700">{b.event_time}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate max-w-[180px] text-slate-700">{b.event_venue}</span>
                    </div>
                  </div>

                  {/* Seat Numbers */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 mr-1 font-medium">Reserved Seats:</span>
                    {b.seats?.map((seat, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-mono font-bold text-slate-900"
                      >
                        {seat.seatNumber}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t border-slate-100 md:border-t-0">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Total Settlement</span>
                  <p className="text-2xl font-black text-slate-950 font-mono">
                    ₹{Number(b.total_amount).toFixed(2)}
                  </p>
                </div>

                {b.status === 'CONFIRMED' ? (
                  <button
                    onClick={() => setSelectedTicketBooking(b)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-amber-400 transition shadow-xs active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-500" />
                    <span>View Pass & QR</span>
                  </button>
                ) : b.status === 'PENDING' ? (
                  <Link
                    to={`/checkout/${b.id}`}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition shadow-xs active:scale-95"
                  >
                    <span>Resume Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center rounded-3xl bg-white border border-slate-200 space-y-4 max-w-md mx-auto p-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Ticket className="w-7 h-7 text-amber-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Bookings Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You haven't reserved any cinema seats or concert admissions yet. Discover our curated screenings today.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition shadow-xs active:scale-95"
          >
            Browse Available Shows
          </Link>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicketBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTicketBooking(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-surface-card/90 text-white flex items-center justify-center hover:bg-surface-elevated border border-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <DigitalTicket booking={selectedTicketBooking} />
          </div>
        </div>
      )}
    </div>
  );
};
