import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Lock, Mail, ArrowRight, Sparkles, AlertCircle, Loader2, Film, ShieldCheck } from 'lucide-react';

import { GoogleSignInModal } from '../components/auth/GoogleSignInModal';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogleSimulated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      navigate(redirect);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAccountSelect = async (selectedEmail: string, selectedName: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogleSimulated(selectedEmail, selectedName);
      setIsGoogleModalOpen(false);
      navigate(redirect);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Google sign-in failed');
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
            Welcome to ShowPass
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your admission passes, live seat locks, or organizer studio.
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={() => setIsGoogleModalOpen(true)}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-3 shadow-2xs disabled:opacity-50 group active:scale-95 cursor-pointer"
        >
          {/* Google Color G SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.54 0 2.92.53 4.01 1.58l3-3A11.96 11.96 0 0 0 12 0C7.39 0 3.42 2.61 1.47 6.42l3.66 2.84C6.01 6.64 8.76 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.69 2.86c2.16-1.99 3.41-4.92 3.41-8.68z"
            />
            <path
              fill="#FBBC05"
              d="M5.13 14.74A7.2 7.2 0 0 1 4.75 12c0-.96.16-1.9.44-2.74L1.53 6.42A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.37l3.88-2.63z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.69-2.86c-1.08.72-2.45 1.16-4.24 1.16-3.24 0-5.99-2.14-6.87-5.02L1.47 17.58C3.42 21.39 7.39 24 12 24z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200"></div>
          <span className="bg-white px-3 text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
            Or continue with email
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-xs text-slate-700 mb-1.5 font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-500 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <span>Sign In</span>}
          </button>
        </form>

        <GoogleSignInModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          onSelectAccount={handleGoogleAccountSelect}
          isLoading={isLoading}
        />

        {/* Bottom register link */}
        <div className="text-center pt-1 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-600 font-bold hover:underline hover:text-amber-700">
              Create account now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
