import React from 'react';
import { Crown, Star, Circle, Headphones, X } from 'lucide-react';

export const SeatLegend: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-5 rounded-3xl bg-[#10141E]/90 border border-slate-800/80 text-white backdrop-blur-md space-y-4 shadow-xl ${className}`}>
      <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
        Seat Legend
      </h3>

      {/* Seat Status Items */}
      <div className="space-y-2.5 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-[#161B28] border border-slate-700 shadow-2xs" />
          <span>Available</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-amber-400 border border-amber-300 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-xs">
            ✓
          </div>
          <span className="font-semibold text-white">Selected</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-amber-950/60 border border-amber-500/60 animate-pulse" />
          <span className="text-amber-200/80">In Checkout</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-slate-900/90 border border-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold">
            ✕
          </div>
          <span className="text-slate-500">Sold Out</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-slate-800" />

      {/* Tier Multipliers */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center gap-2.5 text-amber-300 font-medium">
          <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>VIP (1.5x)</span>
        </div>

        <div className="flex items-center gap-2.5 text-amber-200/90 font-medium">
          <Star className="w-4 h-4 text-[#FDE68A] flex-shrink-0" />
          <span>Premium (1.25x)</span>
        </div>

        <div className="flex items-center gap-2.5 text-slate-400 font-medium">
          <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
          <span>Standard</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-slate-800" />

      {/* Support Card */}
      <div className="pt-1 flex items-start gap-3 text-slate-400">
        <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center text-amber-400 flex-shrink-0">
          <Headphones className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-white leading-tight">Need Help?</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Our team is here for you</p>
        </div>
      </div>
    </div>
  );
};
