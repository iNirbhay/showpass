import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 pt-14 pb-12 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4 pr-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-display font-black text-xs tracking-tighter shadow-sm">
                SP
              </div>
              <span className="font-display font-black text-lg tracking-tight text-white">
                SHOW<span className="text-amber-400">PASS</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Premium seat reservation & cinema ticketing platform. Engineered with row-level PostgreSQL transactions to eliminate double-booking at the database level.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SANDSTONE GATEWAY & HIGH-CONCURRENCY LOCKS OPERATIONAL</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-slate-200 font-bold">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/events?category=Movies" className="hover:text-amber-400 transition">Movies & IMAX</Link></li>
              <li><Link to="/events?category=Concerts" className="hover:text-amber-400 transition">Stadium Concerts</Link></li>
              <li><Link to="/events?category=Comedy" className="hover:text-amber-400 transition">Stand-Up Specials</Link></li>
              <li><Link to="/events?category=Theatre" className="hover:text-amber-400 transition">Theatre & Musicals</Link></li>
              <li><Link to="/events?category=Sports" className="hover:text-amber-400 transition">Arena Sports</Link></li>
            </ul>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-slate-200 font-bold">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/events" className="hover:text-amber-400 transition">All Live Shows</Link></li>
              <li><Link to="/create-event" className="hover:text-amber-400 transition">Host an Auditorium</Link></li>
              <li><Link to="/dashboard" className="hover:text-amber-400 transition">Organizer Analytics</Link></li>
              <li><Link to="/my-bookings" className="hover:text-amber-400 transition">My Passes & QR</Link></li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-slate-200 font-bold">Security</h4>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-white font-semibold text-xs">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Sandstone Gateway</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                HMAC-SHA256 verified payments with 256-bit transaction encryption.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-300">CARD</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-300">UPI</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-300">NETBANKING</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ShowPass. Built with React, Vite, Node, and PostgreSQL.</p>
          <p className="font-mono text-[11px]">
            CONCURRENCY ENGINE: <span className="text-amber-400">POSTGRESQL ROW-LEVEL LOCKS</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
