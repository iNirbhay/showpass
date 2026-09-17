import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateSelectorBarProps {
  selectedDate: string; // e.g. "2026-09-17" or formatted string
  onSelectDate: (dateStr: string, displayLabel: string) => void;
}

export const DateSelectorBar: React.FC<DateSelectorBarProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    if (calendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [calendarOpen]);

  // Generate next 7 days for quick pills
  const quickDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const dayName = isToday
      ? 'Today'
      : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const displayLabel = `${dayName}, ${dayNum} ${monthName} ${d.getFullYear()}`;
    return {
      dateKey,
      dayName,
      dayNum,
      monthName,
      displayLabel,
      isToday,
    };
  });

  // Check if selectedDate matches one of the quick dates
  const isSelectedQuickDate = quickDates.some((qd) => qd.dateKey === selectedDate || qd.displayLabel === selectedDate);

  // Calendar view calculations
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    const now = new Date();
    if (prev.getFullYear() < now.getFullYear() || (prev.getFullYear() === now.getFullYear() && prev.getMonth() < now.getMonth())) {
      return;
    }
    setCalendarMonth(prev);
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(year, month + 1, 1));
  };

  const handleCalendarPick = (day: number) => {
    const chosen = new Date(year, month, day);
    const dateKey = chosen.toISOString().split('T')[0];
    const dayName = chosen.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = chosen.toLocaleDateString('en-US', { month: 'short' });
    const displayLabel = `${dayName}, ${day} ${monthName} ${chosen.getFullYear()}`;
    onSelectDate(dateKey, displayLabel);
    setCalendarOpen(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {/* Quick Date Pills */}
        {quickDates.map((item) => {
          const isCurrentSelected =
            selectedDate === item.dateKey || selectedDate === item.displayLabel;

          return (
            <button
              key={item.dateKey}
              onClick={() => onSelectDate(item.dateKey, item.displayLabel)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border transition-all duration-150 flex flex-col items-center min-w-[76px] sm:min-w-[84px] text-center ${
                isCurrentSelected
                  ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold shadow-sm scale-102 ring-2 ring-amber-400/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                isCurrentSelected ? 'text-slate-900 font-extrabold' : 'text-slate-400'
              }`}>
                {item.dayName}
              </span>
              <span className="text-base sm:text-lg font-extrabold leading-tight mt-0.5">
                {item.dayNum}
              </span>
              <span className={`text-[10px] font-medium ${
                isCurrentSelected ? 'text-slate-900' : 'text-slate-500'
              }`}>
                {item.monthName}
              </span>
            </button>
          );
        })}

        {/* Custom Date Pick Calendar Button */}
        <div className="relative flex-shrink-0" ref={popoverRef}>
          <button
            onClick={() => setCalendarOpen(!calendarOpen)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border transition-all duration-150 flex flex-col items-center justify-center min-w-[84px] h-full ${
              !isSelectedQuickDate
                ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold shadow-sm ring-2 ring-amber-400/20'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
            title="Pick a custom future date"
          >
            <CalendarIcon className={`w-4 h-4 mb-1 ${!isSelectedQuickDate ? 'text-slate-950' : 'text-amber-500'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {!isSelectedQuickDate ? 'Custom' : 'More'}
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              Calendar
            </span>
          </button>

          {/* Popover Calendar Modal */}
          {calendarOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 max-w-[calc(100vw-32px)] bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xl animate-scalePop">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-display font-bold text-sm text-slate-900">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCalendarOpen(false)}
                    className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mt-3 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span key={d} className="text-[10px] font-bold uppercase text-slate-400 py-1">
                    {d}
                  </span>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1 mt-1 text-center">
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <div key={`empty-${i}`} className="w-8 h-8"></div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(year, month, day);
                  dateObj.setHours(0, 0, 0, 0);
                  const isPast = dateObj < today;
                  const dateKey = dateObj.toISOString().split('T')[0];
                  const isDaySelected = selectedDate.includes(dateKey);

                  return (
                    <button
                      key={day}
                      disabled={isPast}
                      onClick={() => handleCalendarPick(day)}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition ${
                        isPast
                          ? 'text-slate-300 cursor-not-allowed'
                          : isDaySelected
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                          : 'text-slate-700 hover:bg-amber-50 hover:text-amber-900'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
