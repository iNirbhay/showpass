import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface HoldCountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export const HoldCountdownTimer: React.FC<HoldCountdownTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number; totalSeconds: number }>({
    minutes: 10,
    seconds: 0,
    totalSeconds: 600,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const expiry = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, totalSeconds: 0 });
        if (onExpire) onExpire();
        return;
      }

      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setTimeLeft({ minutes, seconds, totalSeconds: diff });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const isUrgent = timeLeft.totalSeconds < 120;
  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div
      className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors shadow-xs ${
        isUrgent
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : 'bg-amber-50/80 border-amber-200/80 text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        {isUrgent ? (
          <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
        ) : (
          <Clock className="w-4 h-4 text-amber-600" />
        )}
        <div>
          <p className="text-xs font-bold text-slate-900">Seats Held Exclusively for You</p>
          <p className="text-[11px] text-slate-500">
            Complete Sandstone Payment before hold window expires.
          </p>
        </div>
      </div>

      <div className="font-mono font-bold text-sm px-3 py-1 rounded-xl bg-white border border-amber-200 text-amber-800 shadow-xs">
        <span>{formatNumber(timeLeft.minutes)}</span>
        <span className="text-amber-500 font-bold mx-0.5">:</span>
        <span>{formatNumber(timeLeft.seconds)}</span>
      </div>
    </div>
  );
};
