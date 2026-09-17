import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EventService } from '../services/event.service';
import { EventCard } from '../components/events/EventCard';
import { EventFiltersBar } from '../components/events/EventFilters';
import { Compass, Loader2, Calendar, Film, Sparkles, FilterX } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || undefined;
  const searchParam = searchParams.get('search') || undefined;
  const dateParam = searchParams.get('date') || undefined;

  const filters = {
    category: categoryParam,
    search: searchParam,
    date: dateParam,
  };

  const { data: events, isLoading } = useQuery({
    queryKey: ['events-list', filters],
    queryFn: () => EventService.getEvents(filters),
  });

  const handleFiltersChange = (newFilters: { category?: string; search?: string; date?: string }) => {
    const params: Record<string, string> = {};
    if (newFilters.category && newFilters.category !== 'All') {
      params.category = newFilters.category;
    }
    if (newFilters.search) {
      params.search = newFilters.search;
    }
    if (newFilters.date) {
      params.date = newFilters.date;
    }
    setSearchParams(params);
  };

  const hasActiveFilters = Boolean(categoryParam || searchParam || dateParam);

  const displayTitle = categoryParam || 'Movies';
  const displaySubtitle = categoryParam === 'Movies' || !categoryParam
    ? 'Grab best seats at theatres around you'
    : `Discover premier ${categoryParam.toLowerCase()} and live auditorium seats`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      {/* District Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {displayTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {displaySubtitle}
          </p>
        </div>

        {events && (
          <span className="text-xs font-semibold text-slate-500">
            {events.length} {events.length === 1 ? 'Show' : 'Shows'} Available
          </span>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <EventFiltersBar filters={filters} onChange={handleFiltersChange} />
        
        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-400">Filtered:</span>
              {categoryParam && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">
                  {categoryParam}
                </span>
              )}
              {searchParam && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-medium">
                  "{searchParam}"
                </span>
              )}
              {dateParam && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-medium">
                  {dateParam}
                </span>
              )}
            </div>

            <button
              onClick={() => setSearchParams({})}
              className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition font-semibold"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Events Grid (District 5-6 Column Style) */}
      {isLoading ? (
        <div className="py-28 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          </div>
          <p className="text-xs text-slate-500 font-mono tracking-wide">Syncing cinema catalogue...</p>
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 sm:gap-6">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-3xl bg-white border border-slate-200 space-y-4 max-w-md mx-auto p-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Matching Shows Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We couldn't find any scheduled titles matching your parameters.
            </p>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition shadow-xs active:scale-95"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
