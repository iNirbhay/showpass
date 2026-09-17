import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EventService } from '../services/event.service';
import { EventCard } from '../components/events/EventCard';
import { 
  Play, 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  QrCode, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Search,
  Sparkles
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ['trending-events'],
    queryFn: () => EventService.getEvents(),
  });

  // Selected quick-date & quick-time bar state
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Generate next 5 days for the date selector ribbon
  const today = new Date();
  const dateOptions = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dateNum = `${d.getDate()}/${d.getMonth() + 1}`;
    const isoDate = d.toISOString().split('T')[0];
    return { dayName, dateNum, isoDate };
  });

  const timeOptions = ['15:00', '17:00', '19:00', '21:00'];

  // Spotlight featured event
  const featuredEvent = events && events.length > 0 ? events[0] : null;

  // Filtered list
  const filteredEvents = events?.filter((ev) => {
    if (selectedCategory !== 'All' && ev.category !== selectedCategory) return false;
    if (searchKeyword && !ev.title.toLowerCase().includes(searchKeyword.toLowerCase()) && !ev.venue.toLowerCase().includes(searchKeyword.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleQuickBook = () => {
    if (featuredEvent) {
      navigate(`/events/${featuredEvent.id}/seats`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* 1. CINEMATIC SPOTLIGHT HERO SECTION */}
      {featuredEvent ? (
        <section className="relative rounded-3xl overflow-hidden bg-[#0D0E14] text-white shadow-lg">
          {/* Backdrop Image Layer */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredEvent.backdrop_url || featuredEvent.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80'}
              alt={featuredEvent.title}
              className="w-full h-full object-cover object-center opacity-35 filter blur-xs"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D0E14] via-[#0D0E14]/85 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E14] via-transparent to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Col */}
            <div className="lg:col-span-8 space-y-4 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
                  SPOTLIGHT PREMIERE
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-white border border-white/20">
                  {featuredEvent.certification || 'U'} • {featuredEvent.language || 'Hindi'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {featuredEvent.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                {featuredEvent.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/events/${featuredEvent.id}/seats`}
                  className="px-6 py-3 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-500 transition shadow-sm active:scale-95 inline-flex items-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Tickets</span>
                </Link>

                <Link
                  to={`/events/${featuredEvent.id}`}
                  className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 transition active:scale-95 inline-flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Trailer & Details</span>
                </Link>
              </div>
            </div>

            {/* Right Col: Companion Poster */}
            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <Link
                to={`/events/${featuredEvent.id}`}
                className="group relative w-56 aspect-[2/3] rounded-2xl overflow-hidden border border-white/20 shadow-2xl block hover:-translate-y-1 transition duration-300"
              >
                <img
                  src={featuredEvent.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'}
                  alt={featuredEvent.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 inset-x-3 text-center">
                  <p className="font-bold text-xs text-white line-clamp-1">{featuredEvent.title}</p>
                  <p className="text-[10px] text-slate-300 truncate">{featuredEvent.venue}</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* 2. DEDICATED QUICK-DATE & SHOWTIME RIBBON */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        {/* Date Selector */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            CHOOSE DATE
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {dateOptions.map((opt, i) => (
              <button
                key={opt.isoDate}
                onClick={() => setSelectedDateIndex(i)}
                className={`px-3 py-2 rounded-xl text-center transition flex flex-col items-center min-w-[62px] active:scale-95 ${
                  selectedDateIndex === i
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span className="text-[10px] font-mono opacity-80">{opt.dateNum}</span>
                <span className="text-xs font-bold font-mono">{opt.dayName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selector */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            CHOOSE TIME
          </span>
          <div className="flex items-center gap-2">
            {timeOptions.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedTime(st)}
                className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-semibold transition active:scale-95 ${
                  selectedTime === st
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Ticket Action */}
        <div className="flex items-end">
          <button
            onClick={handleQuickBook}
            className="w-full md:w-auto py-3 px-8 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-500 transition shadow-xs active:scale-95"
          >
            Buy Tickets
          </button>
        </div>
      </section>

      {/* 3. SHOWS SUB-NAVIGATION FILTER BAR */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        {/* Category switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {['All', 'Movies', 'Concerts', 'Comedy', 'Theatre', 'Sports'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full font-semibold transition active:scale-95 whitespace-nowrap ${
                selectedCategory === cat
                  ? 'text-slate-950 bg-amber-400 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'All' ? 'All Shows' : cat}
            </button>
          ))}
        </div>

        {/* Search inside catalog */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search movies, venues..."
            className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>
      </section>

      {/* 4. NOW SHOWING DISTRICT POSTER GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Now Showing
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Grab best seats at theatres around you
            </p>
          </div>

          <Link
            to="/events"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition"
          >
            <span>VIEW ALL</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-xs text-slate-500 font-mono">Loading movie inventory...</p>
          </div>
        ) : filteredEvents && filteredEvents.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
            <p className="text-xs text-slate-500">No shows found matching your filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchKeyword('');
              }}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 5. ARCHITECTURAL CONFIDENCE & SECURITY BAR */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900">Row-Level PostgreSQL Locks</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every seat selection executes transactional RPC row locks, guaranteeing zero double-booking at the database level.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900">Sandstone Payment Gateway</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cryptographic HMAC-SHA256 signature verification. Confirmed seats only issue upon verified settlement.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900">Digital Admission Passes</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Printable cinema tickets generated with turnstile QR codes, seat coordinates, and instant admission.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
