import React from 'react';
import { Search, Calendar, X, SlidersHorizontal } from 'lucide-react';
import { EventFilters as FilterState } from '../../services/event.service';

interface EventFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
}

const CATEGORIES = ['All', 'Movies', 'Concerts', 'Comedy', 'Theatre', 'Sports'];

export const EventFiltersBar: React.FC<EventFiltersProps> = ({ filters, onChange }) => {
  const currentCategory = filters.category || 'All';

  const handleCategoryClick = (cat: string) => {
    onChange({
      ...filters,
      category: cat === 'All' ? undefined : cat,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      search: e.target.value || undefined,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      date: e.target.value || undefined,
    });
  };

  const handleClear = () => {
    onChange({});
  };

  const hasActiveFilters = Boolean(filters.search || (filters.category && filters.category !== 'All') || filters.date);

  return (
    <div className="space-y-4">
      {/* Top Filter Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = (cat === 'All' && !filters.category) || filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search & Date Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={handleSearchChange}
              placeholder="Search movies, venues..."
              className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
            />
          </div>

          {/* Date Picker */}
          <div className="relative">
            <input
              type="date"
              value={filters.date || ''}
              onChange={handleDateChange}
              className="bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
            />
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-full text-xs text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1 font-medium"
              title="Reset filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
