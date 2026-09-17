import React from 'react';
import { Eye } from 'lucide-react';

interface SeatGridPreviewProps {
  rows: number;
  cols: number;
  basePrice: number;
}

export const SeatGridPreview: React.FC<SeatGridPreviewProps> = ({ rows, cols, basePrice }) => {
  const safeRows = Math.min(Math.max(Number(rows) || 1, 1), 20);
  const safeCols = Math.min(Math.max(Number(cols) || 1, 1), 20);
  const safePrice = Math.max(Number(basePrice) || 0, 0);

  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const totalSeats = safeRows * safeCols;

  let potentialRevenue = 0;
  for (let r = 0; r < safeRows; r++) {
    let multiplier = 1.0;
    if (r < 2) multiplier = 1.5;
    else if (r < Math.ceil(safeRows / 2) + 1) multiplier = 1.25;
    potentialRevenue += safeCols * (safePrice * multiplier);
  }

  return (
    <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            Auditorium Seating Matrix Preview
          </h4>
        </div>
        <span className="font-mono text-xs font-bold text-amber-700 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
          {totalSeats} SEATS
        </span>
      </div>

      {/* Screen Arc */}
      <div className="w-full text-center py-1">
        <div className="h-1.5 w-3/4 mx-auto rounded-t-full bg-amber-400 shadow-sm"></div>
        <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase mt-1 block">SCREEN / STAGE</span>
      </div>

      {/* Matrix Display */}
      <div className="max-h-56 overflow-y-auto overflow-x-auto p-3 rounded-xl bg-[#0C0F17] border border-white/5 flex flex-col items-center gap-1.5 scrollbar-none">
        {Array.from({ length: safeRows }).map((_, r) => {
          const rowLabel = rowLetters[r];
          let tierStyle = 'bg-[#171E2E] border-white/10';
          if (r < 2) tierStyle = 'bg-amber-500/30 border-amber-500/50';
          else if (r < Math.ceil(safeRows / 2) + 1) tierStyle = 'bg-[#FACC15]/30 border-[#FACC15]/50';

          return (
            <div key={r} className="flex items-center gap-1">
              <span className="w-4 text-[9px] font-mono font-bold text-[#585e70] text-right">
                {rowLabel}
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: safeCols }).map((_, c) => (
                  <div
                    key={c}
                    className={`w-3.5 h-3.5 rounded-sm border ${tierStyle}`}
                    title={`Row ${rowLabel}, Seat ${c + 1}`}
                  ></div>
                ))}
              </div>
              <span className="w-4 text-[9px] font-mono font-bold text-[#585e70] text-left">
                {rowLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Revenue & Tier Projections */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-slate-600">VIP (Rows A-B • ₹{(safePrice * 1.5).toFixed(0)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-300"></span>
            <span className="text-slate-600">Premium (Middle • ₹{(safePrice * 1.25).toFixed(0)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            <span className="text-slate-500">Standard (Rear • ₹{safePrice.toFixed(0)})</span>
          </div>
        </div>

        <div className="text-right flex flex-col justify-center">
          <span className="text-[10px] font-mono uppercase text-slate-400">Projected Full House</span>
          <p className="font-mono font-black text-base text-amber-600">
            ₹{potentialRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
};
