import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Lock, Mail, User, Shield, AlertCircle, Loader2, Film, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'ORGANIZER'>('CUSTOMER');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await register(email, password, fullName, role);
      navigate('/');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6 pb-28">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto shadow-xs">
          <Film className="w-7 h-7 text-amber-600" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Your Membership
          </h1>
          <p className="text-xs text-slate-500">
            Join ShowPass for priority seat reservations, instant QR admission passes, and host tools.
          </p>
        </div>
      </div>

      {/* Register Card */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-700 mb-1.5 font-semibold">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Rivers"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-700 mb-1.5 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-700 mb-1.5 font-semibold">Password (Min 6 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Account Type Selection */}
          <div className="pt-1">
            <label className="block text-xs text-slate-700 mb-2 font-semibold">Membership Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  role === 'CUSTOMER'
                    ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-bold text-slate-900">Moviegoer / Attendee</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Book up to 4 seats</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('ORGANIZER')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  role === 'ORGANIZER'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-bold text-slate-900">Screening Host</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Design seat maps & sell</p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-500 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-3 active:scale-95"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <span>Create Account</span>}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-600 font-bold hover:text-amber-700 transition">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
