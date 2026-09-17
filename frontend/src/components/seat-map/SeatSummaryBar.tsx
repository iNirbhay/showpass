import React from 'react';
import { Seat } from '../../types';
import { Ticket, ArrowRight, X, Loader2 } from 'lucide-react';

interface SeatSummaryBarProps {
  selectedSeats: Seat[];
  onRemoveSeat: (seatId: string) => void;
  onProceed: () => void;
  isLoading?: boolean;
}

export const SeatSummaryBar: React.FC<SeatSummaryBarProps> = ({
  selectedSeats,
  onRemoveSeat,
  onProceed,
  isLoading = false,
}) => {
  if (selectedSeats.length === 0) return null;

  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.finalPrice, 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200 shadow-2xl py-4 px-4 sm:px-8 animate-slideUp">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Selected Seats Chips */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
            <Ticket className="w-4 h-4 text-amber-500" />
            <span className="font-mono text-xs font-bold text-slate-900">
              {selectedSeats.length}/4
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {selectedSeats.map((seat) => (
              <span
                key={seat.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-50 border border-amber-200 text-slate-900"
              >
                <span className="font-bold">{seat.seatNumber}</span>
                <span className="text-[10px] text-amber-700 font-bold">₹{seat.finalPrice}</span>
                <button
                  onClick={() => onRemoveSeat(seat.id)}
                  className="text-slate-400 hover:text-rose-600 transition ml-0.5"
                  title="Remove seat"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Total Price & Proceed CTA */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-6">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Amount</span>
            <p className="font-mono font-bold text-xl text-slate-900">
              ₹{totalAmount.toFixed(2)}
            </p>
          </div>

          <button
            onClick={onProceed}
            disabled={isLoading}
            className="btn-primary py-3 px-6 text-xs uppercase tracking-wider font-bold disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Locking Seats...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Continue to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
