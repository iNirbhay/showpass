import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Ticket, MapPin, Clock, ShieldCheck, Sparkles, AlertCircle, Calendar } from 'lucide-react';
import { CinemaHouse } from '../../services/location.service';

interface ShowtimeSeatPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  movieTitle: string;
  cinema: CinemaHouse;
  selectedDate?: string;
  showtime: {
    time: string;
    format: string;
    totalSeats: number;
    availableSeats: number;
    basePrice: number;
    status: 'AVAILABLE' | 'ALMOST_FULL' | 'FILLING_FAST';
  };
}

export const ShowtimeSeatPreviewModal: React.FC<ShowtimeSeatPreviewModalProps> = ({
  isOpen,
  onClose,
  eventId,
  movieTitle,
  cinema,
  selectedDate,
  showtime,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const rows = 8;
  const cols = 12;
  const total = rows * cols; // 96
  const bookedCount = total - showtime.availableSeats;

  // Deterministic seat status distribution based on showtime to show a realistic layout
  const seatLayout = useMemo(() => {
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const grid: { row: string; col: number; tier: 'VIP' | 'PREMIUM' | 'STANDARD'; isBooked: boolean }[][] = [];

    // Hash seed from cinema + time
    const seed = (cinema.name + showtime.time).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

    let bookedAssigned = 0;

    for (let r = 0; r < rows; r++) {
      const rowArr = [];
      const rowLetter = rowLetters[r];
      let tier: 'VIP' | 'PREMIUM' | 'STANDARD' = 'STANDARD';
      if (r < 2) tier = 'VIP';
      else if (r < 5) tier = 'PREMIUM';

      for (let c = 1; c <= cols; c++) {
        // Pseudo-random deterministic booked check favoring center seats
        const centerDistance = Math.abs(c - 6.5) + Math.abs(r - 3.5);
        const shouldBook =
          bookedAssigned < bookedCount &&
          ((seed + r * cols + c * 7) % 10 < (showtime.status === 'ALMOST_FULL' ? 8 : showtime.status === 'FILLING_FAST' ? 5 : 2));

        if (shouldBook) bookedAssigned++;

        rowArr.push({
          row: rowLetter,
          col: c,
          tier,
          isBooked: shouldBook,
        });
      }
      grid.push(rowArr);
    }
    return grid;
  }, [cinema.name, showtime.time, showtime.status, bookedCount]);

  const vipPrice = Math.round(showtime.basePrice * 1.5);
  const premiumPrice = Math.round(showtime.basePrice * 1.25);
  const standardPrice = showtime.basePrice;

  const handleProceed = () => {
    onClose();
    const dateQuery = selectedDate ? `&date=${encodeURIComponent(selectedDate)}` : '';
    navigate(`/events/${eventId}/seats?cinema=${encodeURIComponent(cinema.name)}&time=${encodeURIComponent(showtime.time)}${dateQuery}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900 animate-scalePop max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800 flex-shrink-0">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950">
                Seat Layout Preview
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {showtime.format}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {movieTitle}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 pt-0.5">
              <span className="flex items-center gap-1 font-semibold text-amber-400">
                <MapPin className="w-3.5 h-3.5" />
                {cinema.name}
              </span>
              <span>•</span>
              {selectedDate && (
                <>
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedDate}
                  </span>
                  <span>•</span>
                </>
              )}
              <span className="text-slate-400">{cinema.screenName}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono font-bold text-white">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {showtime.time}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-700 transition flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Availability Counter Ribbon */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-amber-900">
                  Seat Availability Status
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                <span className="text-emerald-600 font-mono text-base">{showtime.availableSeats}</span> Seats Left available of {total} total
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  showtime.status === 'ALMOST_FULL'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : showtime.status === 'FILLING_FAST'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {showtime.status === 'ALMOST_FULL'
                  ? 'Almost Full'
                  : showtime.status === 'FILLING_FAST'
                  ? 'Filling Fast'
                  : 'Available'}
              </span>
            </div>
          </div>

          {/* Tier Prices */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-medium block">VIP Recliner</span>
              <p className="font-mono font-bold text-amber-700 text-sm mt-0.5">₹{vipPrice}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-medium block">Premium Club</span>
              <p className="font-mono font-bold text-amber-700 text-sm mt-0.5">₹{premiumPrice}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-medium block">Standard</span>
              <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">₹{standardPrice}</p>
            </div>
          </div>

          {/* Miniature Auditorium Chamber Layout Preview */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
            {/* Screen Arc */}
            <div className="w-full text-center">
              <div className="h-1.5 w-3/5 mx-auto rounded-t-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]"></div>
              <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase mt-1.5 block">
                AUDITORIUM SCREEN • ALL EYES THIS WAY
              </span>
            </div>

            {/* Seat Grid Layout */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-none touch-pan-x">
              <div className="w-max mx-auto space-y-1.5">
                {seatLayout.map((row, rIdx) => (
                <div key={rIdx} className="flex items-center gap-1">
                  <span className="w-4 text-[9px] font-mono font-bold text-slate-500 text-right">
                    {row[0].row}
                  </span>
                  <div className="flex items-center gap-1">
                    {row.map((s) => {
                      let tileClass = 'bg-slate-800 border-slate-700 hover:border-amber-400';
                      if (s.isBooked) {
                        tileClass = 'bg-rose-950/60 border-rose-900/40 opacity-40 cursor-not-allowed';
                      } else if (s.tier === 'VIP') {
                        tileClass = 'bg-amber-500/30 border-amber-500/60';
                      } else if (s.tier === 'PREMIUM') {
                        tileClass = 'bg-amber-400/20 border-amber-400/40';
                      }

                      return (
                        <div
                          key={s.col}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs border text-[7px] font-mono flex items-center justify-center transition ${tileClass}`}
                          title={`Row ${s.row}${s.col} (${s.tier}) - ${s.isBooked ? 'Booked' : 'Available'}`}
                        />
                      );
                    })}
                  </div>
                  <span className="w-4 text-[9px] font-mono font-bold text-slate-500 text-left">
                    {row[0].row}
                  </span>
                </div>
              ))}
              </div>
            </div>

            {/* Matrix Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-xs bg-slate-800 border border-slate-700" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-xs bg-amber-500/40 border border-amber-500/70" />
                <span>VIP Recliner</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-xs bg-amber-400/20 border border-amber-400/50" />
                <span>Premium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-xs bg-rose-950/60 border border-rose-900/40 opacity-50" />
                <span>Occupied</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer CTA */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Select up to 4 seats with guaranteed concurrency locks</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              Back
            </button>
            <button
              onClick={handleProceed}
              className="w-1/2 sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Ticket className="w-4 h-4" />
              <span>Select Your Seats</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
