import React, { useState } from 'react';
import { X, User, ArrowRight, ShieldCheck, Check, Loader2 } from 'lucide-react';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, fullName: string) => Promise<void>;
  isLoading: boolean;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  isLoading,
}) => {
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const preconfiguredAccounts = [
    {
      name: 'Nirbhay Kaushik',
      email: 'nirbhaykaushik@gmail.com',
      avatarLetter: 'N',
      avatarBg: 'bg-indigo-600',
    },
    {
      name: 'Alex Rivers',
      email: 'alex.rivers@gmail.com',
      avatarLetter: 'A',
      avatarBg: 'bg-emerald-600',
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) return;
    onSelectAccount(customEmail.trim(), customName.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900 animate-scalePop">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Google G Logo */}
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs flex-shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                Sign in with Google
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">to continue to ShowPass</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account Selection */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-600">Choose an account</p>

          {!customMode ? (
            <div className="space-y-2">
              {preconfiguredAccounts.map((acc) => (
                <button
                  key={acc.email}
                  disabled={isLoading}
                  onClick={() => onSelectAccount(acc.email, acc.name)}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-left transition flex items-center justify-between group active:scale-98 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0`}
                    >
                      {acc.avatarLetter}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition truncate">
                        {acc.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2" />
                </button>
              ))}

              {/* Use another account toggle */}
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="w-full p-3 rounded-2xl border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition flex items-center gap-3 text-slate-600 hover:text-slate-900 text-xs font-semibold group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 group-hover:text-amber-700 transition">
                  <User className="w-4 h-4" />
                </div>
                <span>Use another Google account</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Nirbhay Kaushik"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Google Email</label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="w-1/2 py-2 text-xs font-semibold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/2 py-2 text-xs font-bold text-slate-950 rounded-xl bg-amber-400 hover:bg-amber-500 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Continue</span>}
                </button>
              </div>
            </form>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-2 pt-2 text-xs text-amber-700 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              <span>Authenticating Google session...</span>
            </div>
          )}

          {/* Privacy footer */}
          <p className="text-[10px] text-slate-400 text-center leading-relaxed pt-2 border-t border-slate-100">
            To continue, Google will share your name, email address, and profile picture with ShowPass.
          </p>
        </div>
      </div>
    </div>
  );
};
