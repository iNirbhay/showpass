import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../../types';
import { MapPin, Sparkles } from 'lucide-react';

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const occupancy = event.occupancyRate || 0;
  const isFillingFast = occupancy >= 60 && occupancy < 100;
  const isSoldOut = occupancy >= 100;

  // Format certification & language like District screenshot (e.g., "U | Hindi" or "UA16+ | English")
  const certText = event.certification || (event.category === 'Movies' ? 'UA16+' : event.category);
  const langText = event.language || 'Hindi';
  const metaText = `${certText} | ${langText}`;

  // Generate realistic cinematic showtimes based on event.event_time
  const baseHour = parseInt(event.event_time.split(':')[0] || '19', 10);
  const showtimes = [
    `${Math.max(baseHour - 3, 11)}:00`,
    `${Math.max(baseHour - 1, 14)}:30`,
    event.event_time,
    `${Math.min(baseHour + 2, 23)}:15`,
  ];

  return (
    <div className="group flex flex-col space-y-2">
      {/* Poster Image Container */}
      <Link
        to={`/events/${event.id}`}
        className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 group-hover:border-amber-400/80 transition-all duration-300 shadow-xs group-hover:shadow-md group-hover:-translate-y-1 block"
      >
        <img
          src={
            event.cover_image_url ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
          }
          alt={event.title}
          className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-300 ease-out"
          loading="lazy"
        />

        {/* Soft bottom vignette for contrast if text overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

        {/* Category Pill (Top Left) */}
        {event.category !== 'Movies' && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-slate-900 border border-slate-200 shadow-2xs">
              {event.category}
            </span>
          </div>
        )}

        {/* Status Badges */}
        {isSoldOut ? (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
            SOLD OUT
          </div>
        ) : isFillingFast ? (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse"></span>
            FAST FILLING
          </div>
        ) : null}

        {/* Quick Hover Book Overlay */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <span className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 flex items-center justify-center gap-1 shadow-md transition-all active:scale-98">
            Book Tickets
          </span>
        </div>
      </Link>

      {/* District Typography Baseline Directly Under Poster */}
      <div className="pt-1">
        <Link
          to={`/events/${event.id}`}
          className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1 block leading-snug"
        >
          {event.title}
        </Link>
        
        {/* District Certification & Language Line */}
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {metaText}
        </p>

        {/* Venue and Price */}
        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
            {event.venue}
          </span>
          <span className="font-bold text-slate-900 text-xs whitespace-nowrap">
            ₹{Number(event.price).toFixed(0)}
          </span>
        </div>

        {/* Showtimes Pills */}
        <div className="flex items-center gap-1 pt-1.5">
          {showtimes.slice(0, 3).map((st, i) => (
            <Link
              key={st}
              to={`/events/${event.id}`}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition ${
                i === 2
                  ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {st}
            </Link>
          ))}
          {showtimes.length > 3 && (
            <Link
              to={`/events/${event.id}`}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-medium pl-1"
            >
              +{showtimes.length - 3} more
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
