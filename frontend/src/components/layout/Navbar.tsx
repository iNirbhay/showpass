import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../context/LocationContext';
import { 
  Ticket, 
  Search, 
  Plus, 
  LayoutDashboard, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  MapPin
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { currentCity, setIsSelectorOpen } = useUserLocation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const isCategoryActive = (cat?: string) => {
    if (!cat) return location.pathname === '/events' && !location.search;
    return location.search.includes(`category=${cat}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchInput(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-5 sm:gap-7">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-display font-black text-sm tracking-tighter shadow-sm group-hover:scale-105 transition-transform duration-200">
                SP
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl tracking-tight text-slate-950 flex items-center gap-0.5">
                  SHOW<span className="text-amber-500">PASS</span>
                </span>
              </div>
            </Link>

            {/* District Location Selector */}
            <button
              type="button"
              onClick={() => setIsSelectorOpen(true)}
              className="flex items-center gap-2 pl-3 border-l border-slate-200 hover:opacity-80 transition py-1 text-left group cursor-pointer"
              title="Change Detected Location"
            >
              <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                  {currentCity.name}
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-amber-500 transition" />
                </span>
                <span className="text-[10px] text-slate-500 leading-none truncate max-w-[100px]">{currentCity.state}</span>
              </div>
            </button>
          </div>

          {/* District Center Navigation Category Pills */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link
              to="/events"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                location.pathname === '/' || (location.pathname === '/events' && !location.search)
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              For you
            </Link>
            <Link
              to="/events?category=Movies"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isCategoryActive('Movies')
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              Movies
            </Link>
            <Link
              to="/events?category=Concerts"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isCategoryActive('Concerts')
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              Concerts
            </Link>
            <Link
              to="/events?category=Comedy"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isCategoryActive('Comedy')
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              Comedy
            </Link>
            <Link
              to="/events?category=Theatre"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isCategoryActive('Theatre')
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              Theatre
            </Link>
            <Link
              to="/events?category=Sports"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isCategoryActive('Sports')
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              Sports
            </Link>
          </nav>

          {/* Right Actions Area */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Toggle / Input */}
            <div className="relative">
              {showSearchInput ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search movies, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    onBlur={() => !searchQuery && setShowSearchInput(false)}
                    className="w-48 sm:w-60 pl-8 pr-3 py-1.5 rounded-full text-xs bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5" />
                </form>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  title="Search shows"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Host Event Button */}
            <Link
              to="/create-event"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>Host Show</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {/* My Bookings */}
                <Link
                  to="/my-bookings"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    location.pathname === '/my-bookings'
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 text-amber-600" />
                  <span>My Passes</span>
                </Link>

                {/* Organizer Dashboard */}
                {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                  <Link
                    to="/dashboard"
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      location.pathname === '/dashboard'
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition"
                  >
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[11px] font-black">
                        {user?.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="hidden sm:inline text-xs font-semibold text-slate-900 max-w-[80px] truncate">
                      {user?.fullName?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 text-xs z-50 animate-fadeIn"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">{user?.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          ROLE: {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>Profile & Account</span>
                      </Link>

                      <Link
                        to="/my-bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition"
                      >
                        <Ticket className="w-3.5 h-3.5 text-amber-500" />
                        <span>My Admission Passes</span>
                      </Link>

                      {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                          <span>Organizer Analytics</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition text-left font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-xs transition active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 text-xs shadow-lg">
          <div className="flex items-center gap-2 pb-3 mb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-900">Gurugram, Haryana</span>
          </div>

          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl font-semibold text-slate-900 hover:bg-slate-100"
          >
            For you / All Shows
          </Link>
          <Link
            to="/events?category=Movies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-100"
          >
            Movies
          </Link>
          <Link
            to="/events?category=Concerts"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-100"
          >
            Concerts
          </Link>
          <Link
            to="/events?category=Comedy"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-100"
          >
            Comedy
          </Link>
          <Link
            to="/events?category=Theatre"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-100"
          >
            Theatre
          </Link>

          <div className="pt-2 border-t border-slate-200 space-y-2">
            <Link
              to="/create-event"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl font-semibold text-slate-900 bg-slate-100 border border-slate-200"
            >
              + Host an Event
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-900 font-medium"
                >
                  My Admission Passes
                </Link>
                {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-amber-600 font-semibold"
                  >
                    Organizer Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-600"
                >
                  Profile ({user?.fullName})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 font-semibold"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl border border-slate-300 text-slate-800 font-semibold"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl bg-amber-400 text-slate-950 font-bold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
