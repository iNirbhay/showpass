import React, { useState } from 'react';
import { SeatMap, Seat } from '../../types';
import { AlertCircle, Info, Crown, Star, X } from 'lucide-react';

interface InteractiveSeatGridProps {
  seatMap: SeatMap;
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  maxSeats?: number;
}

export const InteractiveSeatGrid: React.FC<InteractiveSeatGridProps> = ({
  seatMap,
  selectedSeats,
  onSeatSelect,
  maxSeats = 4,
}) => {
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

  // Generate fallback layout if seatRows is somehow empty
  const activeRows = (seatMap?.seatRows && seatMap.seatRows.length > 0)
    ? seatMap.seatRows
    : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((rowLabel, rIdx) => {
        const isVIP = rIdx < 2;
        const isPremium = !isVIP && rIdx < 5;
        const tier: 'VIP' | 'PREMIUM' | 'STANDARD' = isVIP ? 'VIP' : isPremium ? 'PREMIUM' : 'STANDARD';
        const multiplier = isVIP ? 1.5 : isPremium ? 1.25 : 1.0;
        const base = seatMap?.basePrice || 260;
        const finalPrice = Math.round(base * multiplier);
        const seats: Seat[] = Array.from({ length: 14 }, (_, cIdx) => {
          const colNumber = cIdx + 1;
          return {
            id: `seat-${rowLabel}-${colNumber}`,
            eventId: seatMap?.eventId || 'default',
            rowLabel,
            colNumber,
            seatNumber: `${rowLabel}${colNumber}`,
            seatTier: tier,
            priceMultiplier: multiplier,
            finalPrice,
            status: 'AVAILABLE',
          };
        });
        return { rowLabel, tier, seats };
      });

  const isSelected = (seat: Seat) => selectedSeats.some((s) => s.id === seat.id || s.seatNumber === seat.seatNumber);

  const handleSeatClick = (seat: Seat) => {
    setWarningMessage(null);

    if (seat.status === 'BOOKED') return;
    if (seat.status === 'HELD') {
      setWarningMessage(`Seat ${seat.seatNumber} is currently held in checkout by another guest.`);
      return;
    }

    const alreadySelected = isSelected(seat);

    if (!alreadySelected && selectedSeats.length >= maxSeats) {
      setWarningMessage(`Maximum ${maxSeats} seats allowed per booking.`);
      return;
    }

    onSeatSelect(seat);
  };

  const getSeatStyle = (seat: Seat) => {
    if (isSelected(seat)) {
      return 'bg-[#F59E0B] text-slate-950 border-[#FBBF24] font-black shadow-lg shadow-amber-500/30 scale-105 z-10';
    }

    if (seat.status === 'BOOKED') {
      return 'bg-[#121622]/80 text-slate-600 border-slate-800/80 cursor-not-allowed opacity-40';
    }

    if (seat.status === 'HELD') {
      return 'bg-amber-950/70 text-amber-200 border-amber-600/60 animate-gentlePulse cursor-not-allowed font-bold';
    }

    if (seat.status === 'HELD_BY_ME') {
      return 'bg-[#F59E0B] text-slate-950 border-[#FBBF24] font-black shadow-lg shadow-amber-500/30';
    }

    // Available Tiers
    switch (seat.seatTier) {
      case 'VIP':
        return 'bg-[#161B28] text-amber-300 border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/40 hover:scale-105';
      case 'PREMIUM':
        return 'bg-[#141926] text-amber-200/90 border-amber-400/20 hover:border-amber-400 hover:bg-[#1C2336] hover:scale-105';
      default:
        return 'bg-[#121624] text-slate-400 border-slate-700/50 hover:border-slate-400 hover:bg-[#1A2032] hover:text-white hover:scale-105';
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. Curved Glowing Cinema Screen Arc (Image 3 Reference) */}
      <div className="w-full max-w-xl text-center mb-8 relative">
        {/* Soft luminous projection beam background */}
        <div className="absolute -top-4 inset-x-4 h-16 bg-gradient-to-b from-amber-500/20 via-amber-500/5 to-transparent blur-xl pointer-events-none" />

        {/* Screen Curved Arc Line */}
        <div className="relative mx-auto w-4/5 h-6 overflow-hidden">
          <div className="w-full h-24 border-t-2 border-amber-400/90 rounded-[50%] shadow-[0_0_25px_rgba(251,191,36,0.5)]" />
        </div>

        {/* Screen Label */}
        <p className="text-[11px] font-mono tracking-[0.25em] text-amber-300/90 font-bold uppercase mt-1">
          A L L &nbsp; E Y E S &nbsp; T H I S &nbsp; W A Y
        </p>
      </div>

      {/* Warning Notice */}
      {warningMessage && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Hover Info Tooltip Bar */}
      <div className="h-7 mb-3 flex items-center justify-center">
        {hoveredSeat ? (
          <div className="text-xs flex items-center gap-2 font-medium px-3.5 py-1 rounded-full bg-[#161C2A] border border-slate-700 text-white animate-fadeIn shadow-md">
            <span className="font-bold text-amber-400">Seat {hoveredSeat.seatNumber}</span>
            <span className="text-slate-500">•</span>
            <span className={hoveredSeat.seatTier === 'VIP' ? 'text-amber-300 font-semibold' : hoveredSeat.seatTier === 'PREMIUM' ? 'text-amber-200' : 'text-slate-400'}>
              {hoveredSeat.seatTier} Tier
            </span>
            <span className="text-slate-500">•</span>
            <span className="font-mono font-bold text-white">₹{hoveredSeat.finalPrice}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
            <Info className="w-3.5 h-3.5 text-amber-400" /> Tap or hover any seat to check tier and live pricing
          </span>
        )}
      </div>

      {/* 2. Seating Grid with Crown & Star Tier Indicators */}
      <div className="w-full overflow-x-auto pb-4 flex justify-center scrollbar-none">
        <div className="min-w-fit px-2 sm:px-4 space-y-2.5">
          {activeRows.map((row, rIdx) => {
            return (
              <div key={row.rowLabel} className="space-y-1">
                {/* Crown markers above columns 5, 7, 10 for row 0 */}
                {rIdx === 0 && (
                  <div className="flex justify-center items-center gap-12 py-0.5 text-amber-400 text-xs select-none">
                    <Crown className="w-3.5 h-3.5 opacity-80" />
                    <Crown className="w-3.5 h-3.5 opacity-80" />
                    <Crown className="w-3.5 h-3.5 opacity-80" />
                  </div>
                )}
                {/* Star markers above columns 5, 7, 10 for row 2 */}
                {rIdx === 2 && (
                  <div className="flex justify-center items-center gap-12 py-0.5 text-amber-300/70 text-xs select-none">
                    <Star className="w-3.5 h-3.5 opacity-70" />
                    <Star className="w-3.5 h-3.5 opacity-70" />
                    <Star className="w-3.5 h-3.5 opacity-70" />
                  </div>
                )}

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Left Row Letter */}
                  <div className="w-4 sm:w-5 text-center font-mono text-xs font-bold text-slate-400 select-none">
                    {row.rowLabel}
                  </div>

                  {/* Row Seats */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {row.seats.map((seat) => {
                      const selected = isSelected(seat);
                      const isBlocked = seat.status === 'BOOKED' || (seat.status === 'HELD' && !selected);

                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          disabled={isBlocked}
                          className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg text-[9px] sm:text-[10px] font-mono font-medium flex items-center justify-center border transition-all duration-150 relative cursor-pointer ${getSeatStyle(
                            seat
                          )}`}
                        >
                          {seat.status === 'BOOKED' ? (
                            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-600" />
                          ) : (
                            seat.colNumber
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Row Letter */}
                  <div className="w-4 sm:w-5 text-center font-mono text-xs font-bold text-slate-400 select-none">
                    {row.rowLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Cinema Audience Foreground Silhouette & Quote */}
      <div className="w-full mt-8 pt-5 border-t border-slate-800/80 flex flex-col items-center justify-center text-center">
        {/* Decorative audience seats row */}
        <div className="flex items-center gap-1.5 opacity-20 mb-2.5 text-slate-400">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-4 sm:w-5 h-2.5 rounded-t-md bg-slate-600 border border-slate-500" />
          ))}
        </div>

        <p className="font-serif italic text-xs tracking-wider text-amber-200/70 uppercase">
          &ldquo;Good cinema brings people together&rdquo;
        </p>
        <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mt-1">
          See you at the movies!
        </p>
      </div>
    </div>
  );
};
