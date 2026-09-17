import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { AuthService } from '../services/auth.service';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Ticket, 
  LayoutDashboard, 
  LogOut, 
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => AuthService.getMe(),
  });

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="py-36 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center shadow-golden-sm">
          <Loader2 className="w-6 h-6 animate-spin text-[#FACC15]" />
        </div>
        <p className="text-xs text-[#9ba1b0] font-mono">Loading profile identity...</p>
      </div>
    );
  }

  const stats = profile?.stats || { confirmedBookings: 0, organizer: null };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 px-4 pb-28">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account & Membership
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your credentials, admission passes, and auditorium host privileges.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4 sm:gap-5">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center text-xl font-display font-black text-slate-950 shadow-xs">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Account Activity Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">Confirmed Bookings</span>
            <p className="text-2xl font-black text-slate-900 font-mono">{stats.confirmedBookings}</p>
            <Link to="/my-bookings" className="text-xs text-amber-600 hover:text-amber-700 transition font-semibold block pt-1">
              View passes →
            </Link>
          </div>

          {stats.organizer && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">Shows Hosted</span>
              <p className="text-2xl font-black text-amber-600 font-mono">{stats.organizer.createdEvents}</p>
              <Link to="/dashboard" className="text-xs text-amber-600 hover:underline transition font-semibold block pt-1">
                Open dashboard →
              </Link>
            </div>
          )}
        </div>

        {/* Quick Nav Options */}
        <div className="pt-2 space-y-2">
          <Link
            to="/my-bookings"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-xs font-semibold text-slate-800 group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Ticket className="w-4 h-4" />
              </div>
              <span>My Passes & QR Tickets</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
          </Link>

          {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
            <Link
              to="/dashboard"
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-xs font-semibold text-slate-800 group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span>Organizer Analytics & Seat Matrix</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
            </Link>
          )}

          <Link
            to="/create-event"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-xs font-semibold text-slate-800 group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Calendar className="w-4 h-4" />
              </div>
              <span>Host & Schedule a New Event</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
};
