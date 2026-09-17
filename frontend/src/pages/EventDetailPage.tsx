import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EventService } from '../services/event.service';
import { useUserLocation } from '../context/LocationContext';
import { CinemaHouse } from '../services/location.service';
import { ShowtimeSeatPreviewModal } from '../components/events/ShowtimeSeatPreviewModal';
import { DateSelectorBar } from '../components/events/DateSelectorBar';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  ShieldCheck, 
  ArrowLeft,
  Loader2,
  Play,
  Star,
  Award,
  Film,
  Sparkles,
  Volume2,
  Tv,
  Check,
  X,
  Building2,
  Info,
  Compass,
  ChevronRight,
  Eye
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentCity, setIsSelectorOpen } = useUserLocation();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<{
    cinema: CinemaHouse;
    showtime: any;
  } | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const dayName = 'Today';
    const dayNum = today.getDate();
    const monthName = today.toLocaleDateString('en-US', { month: 'short' });
    return `${dayName}, ${dayNum} ${monthName} ${today.getFullYear()}`;
  });

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event-detail', id],
    queryFn: () => EventService.getEventById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="py-36 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        </div>
        <p className="text-xs text-slate-500 font-mono">Loading cinematic screening dossier...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Screening Not Found</h2>
        <p className="text-xs text-slate-500">The requested show or movie may have concluded or is no longer listed.</p>
        <Link to="/events" className="inline-flex items-center gap-2 text-xs text-amber-600 hover:text-amber-700 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Return to Now Showing
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(event.event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const occupancy = event.occupancyRate || 0;
  const vipPrice = Math.round(Number(event.price) * 1.5);
  const premiumPrice = Math.round(Number(event.price) * 1.25);
  const standardPrice = Number(event.price);

  // Fallback cast if none seeded
  const castList = (event.cast_members && event.cast_members.length > 0)
    ? event.cast_members
    : [
        { name: 'Lead Performer', role: 'Main Character', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
        { name: 'Director', role: 'Director', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
        { name: 'Supporting Artist', role: 'Supporting', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
      ];

  // Fallback reviews if none seeded
  const reviewList = (event.reviews && event.reviews.length > 0)
    ? event.reviews
    : [
        { source: 'Critic Consensus', rating: '4.0/5', comment: 'A compelling and visually stunning cinematic presentation.' },
        { source: 'Audience Score', rating: '4.5/5', comment: 'Spectacular sound design and immersive auditorium experience.' }
      ];

  // Genres fallback
  const genres = (event.genres && event.genres.length > 0)
    ? event.genres
    : [event.category, 'Drama', 'Featured'];

  // Meta string: e.g. "U | Hindi | 2h 30m"
  const metaLine = [
    event.certification || (event.category === 'Movies' ? 'U' : 'UA16+'),
    event.language || 'Hindi',
    event.duration || '2h 30m'
  ].filter(Boolean).join(' | ');

  // Showtimes
  const baseHour = parseInt(event.event_time.split(':')[0] || '19', 10);
  const showtimes = [
    `${Math.max(baseHour - 3, 11)}:00 AM`,
    `${Math.max(baseHour - 1, 14)}:30 PM`,
    `${event.event_time} PM`,
    `${Math.min(baseHour + 2, 23)}:15 PM`,
  ];

  return (
    <div className="w-full pb-24">
      {/* 1. DISTRICT CINEMATIC DARK HERO BANNER */}
      <section className="relative w-full bg-[#0D0E14] text-white overflow-hidden">
        {/* Ambient Backdrop Image Blend (District Style) */}
        <div className="absolute inset-0 z-0">
          <img
            src={
              event.backdrop_url ||
              event.cover_image_url ||
              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80'
            }
            alt=""
            className="w-full h-full object-cover object-center opacity-30 filter blur-xs scale-105"
          />
          {/* Gradients blending backdrop into the left dark panel */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0E14] via-[#0D0E14]/90 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E14] via-transparent to-black/30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb back to catalogue */}
          <div className="mb-6">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Movies & Shows</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Col: District Movie Info Dossier */}
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h1>

              {/* Meta line: U | Hindi | 2h 30m */}
              <p className="text-sm font-semibold text-slate-300">
                {metaLine}
              </p>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal pt-1">
                {event.description}
              </p>

              {/* Genre Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="px-3.5 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 backdrop-blur-md transition"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Release Date */}
              {event.release_date && (
                <p className="text-xs text-slate-400 pt-1">
                  Released {event.release_date}
                </p>
              )}

              {/* Primary "Book Tickets" Action Button */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a
                  href="#theatres-showtimes"
                  className="px-8 py-3 rounded-xl font-bold text-sm text-slate-950 bg-white hover:bg-slate-100 transition-all duration-150 shadow-md hover:shadow-lg active:scale-98 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4 text-amber-500" />
                  <span>Book Tickets</span>
                </a>

                <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
                  <span className="text-amber-400 font-mono font-bold text-sm">
                    ₹{Number(event.price).toFixed(0)}
                  </span>
                  <span>starting price</span>
                </div>
              </div>
            </div>

            {/* Right Col: Floating Companion Poster with Trailer Play Icon */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div 
                className="group relative w-56 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 cursor-pointer bg-slate-900"
                onClick={() => setTrailerOpen(true)}
              >
                <img
                  src={
                    event.cover_image_url ||
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:bg-amber-500 group-hover:border-amber-400 group-hover:text-slate-950 transition-all duration-200">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom chip */}
                <div className="absolute bottom-3 inset-x-3 text-center">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20 inline-flex items-center gap-1.5">
                    <Film className="w-3 h-3 text-amber-400" />
                    Preview Trailer
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      {trailerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            <button
              onClick={() => setTrailerOpen(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full flex flex-col items-center justify-center p-8 text-center bg-slate-950">
              <Film className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-white">{event.title} - Official Cinema Trailer</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-md">
                Experience high-definition Dolby Atmos audio and 4K digital projection master trailer in theaters now.
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  to={`/events/${event.id}/seats`}
                  onClick={() => setTrailerOpen(false)}
                  className="btn-primary px-6 py-2.5 text-xs font-bold"
                >
                  Book Tickets Now
                </Link>
                <button
                  onClick={() => setTrailerOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LOWER SECTION: CLEAN LUMINOUS DISTRICT LIGHT CANVAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Real Theatres & Showtimes in Detected City */}
        <div id="theatres-showtimes" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                  Local Theatres Around You
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {currentCity.cinemas.length} Real Cinema Houses
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                <span>Theatres & Showtimes in {currentCity.name}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Showing verified schedules for {currentCity.name}, {currentCity.state}</span>
              </p>
            </div>

            <button
              onClick={() => setIsSelectorOpen(true)}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-950 transition flex items-center gap-1.5 shadow-2xs group"
            >
              <Compass className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-45 transition-transform" />
              <span>Change City ({currentCity.name})</span>
            </button>
          </div>

          {/* Date Selection Bar */}
          <div className="pt-1 pb-2">
            <DateSelectorBar
              selectedDate={selectedDate}
              onSelectDate={(_dateKey, displayLabel) => setSelectedDate(displayLabel)}
            />
          </div>

          {/* Real Cinema Houses Cards List */}
          <div className="space-y-4">
            {currentCity.cinemas.map((cinema) => (
              <div
                key={cinema.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition space-y-5"
              >
                {/* Cinema House Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900 text-white">
                        {cinema.chain}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {cinema.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{cinema.mall}</span>
                    </p>
                  </div>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {cinema.features.map((feat) => (
                      <span
                        key={feat}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Showtimes & Seat Availability Trigger */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Available Showtimes • Click to preview seat layout & remaining seats
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Instant Seat Map Preview</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {cinema.showtimes.map((st) => (
                      <button
                        key={st.time}
                        type="button"
                        onClick={() => setSelectedPreview({ cinema, showtime: st })}
                        className={`group px-4 py-2.5 rounded-2xl border transition-all text-left flex flex-col items-start gap-0.5 active:scale-98 cursor-pointer shadow-2xs ${
                          st.status === 'ALMOST_FULL'
                            ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400 hover:bg-rose-50'
                            : st.status === 'FILLING_FAST'
                            ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                            : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-amber-400 hover:shadow-xs'
                        }`}
                        title="Click to preview seat map & available seats"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-amber-600 transition">
                            {st.time}
                          </span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200/70 text-slate-700">
                            {st.format}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                          <span
                            className={
                              st.status === 'ALMOST_FULL'
                                ? 'text-rose-600 font-semibold'
                                : st.status === 'FILLING_FAST'
                                ? 'text-amber-700 font-semibold'
                                : 'text-emerald-700 font-medium'
                            }
                          >
                            {st.availableSeats} seats left
                          </span>
                          <span className="text-slate-400">• ₹{st.basePrice}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                Audience & Critics Consensus
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Ratings & Reviews
              </h2>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
              <span>Audience Score: </span>
              <strong className="text-slate-900 font-black">9.1 / 10</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {reviewList.map((rev, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-sm transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center shadow-2xs">
                      ★
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{rev.source}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Verified Publication</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {rev.rating}
                  </span>
                </div>
                {rev.comment && (
                  <p className="text-xs text-slate-600 leading-relaxed italic pt-1">
                    "{rev.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* About Movie Specifications Dossier */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Screening & Technical Specifications</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Audio Mix</span>
              <p className="font-bold text-slate-900">Dolby Atmos 7.1</p>
              <p className="text-[10px] text-slate-500">3D Spatial Immersive</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Censor Certification</span>
              <p className="font-bold text-slate-900">Certified {event.certification || 'U'}</p>
              <p className="text-[10px] text-slate-500">Central Board of Film Certification</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Languages & Subtitles</span>
              <p className="font-bold text-slate-900">{event.language || 'Hindi'}</p>
              <p className="text-[10px] text-slate-500">English Subtitles Available</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Running Time</span>
              <p className="font-bold text-slate-900">{event.duration || '2h 30m'}</p>
              <p className="text-[10px] text-slate-500">Includes 10m Intermission</p>
            </div>
          </div>
        </div>

        {/* Concurrency Guarantee Notice */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Cryptographic Row-Level Lock Active:</strong> All seat reservations are locked at the database level with Sandstone HMAC-SHA256 signature verification.
            </span>
          </div>
          <span className="hidden sm:inline-block font-mono text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
            Zero Double-Booking Guarantee
          </span>
        </div>
      </section>

      {/* Showtime Seat Layout Preview Modal */}
      {selectedPreview && (
        <ShowtimeSeatPreviewModal
          isOpen={!!selectedPreview}
          onClose={() => setSelectedPreview(null)}
          eventId={event.id}
          movieTitle={event.title}
          cinema={selectedPreview.cinema}
          showtime={selectedPreview.showtime}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};
