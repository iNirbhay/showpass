import React from 'react';
import { useUserLocation } from '../../context/LocationContext';
import { LocationService, CITIES_DATABASE } from '../../services/location.service';
import { MapPin, Navigation, X, Check, Building2, Sparkles, Loader2 } from 'lucide-react';

export const CitySelectorModal: React.FC = () => {
  const { currentCity, setCityId, detectLocation, isDetecting, isSelectorOpen, setIsSelectorOpen } =
    useUserLocation();

  if (!isSelectorOpen) return null;

  const allCities = LocationService.getAllCities();

  const handleSelect = (cityId: string) => {
    setCityId(cityId);
    setIsSelectorOpen(false);
  };

  const handleAutoDetect = async () => {
    await detectLocation();
    setIsSelectorOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900 animate-scalePop">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-xs">
              <MapPin className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Select Your City</h3>
              <p className="text-xs text-slate-400">Discover theaters and showtimes around you</p>
            </div>
          </div>
          <button
            onClick={() => setIsSelectorOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* 1-Click Auto Detect Button */}
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="w-full p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 transition flex items-center justify-between group shadow-xs active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                {isDetecting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                ) : (
                  <Navigation className="w-5 h-5 fill-current" />
                )}
              </div>
              <div className="text-left">
                <span className="font-bold text-sm text-slate-900 block flex items-center gap-1.5">
                  <span>Auto-Detect My Current City</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                </span>
                <span className="text-xs text-slate-500">Using browser GPS & nearest metro network</span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 font-mono">
              {isDetecting ? 'Detecting...' : 'Detect'}
            </span>
          </button>

          {/* Popular Cities Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Major Metros & Cinema Hubs
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {allCities.map((city) => {
                const isSelected = city.id === currentCity.id;
                return (
                  <button
                    key={city.id}
                    onClick={() => handleSelect(city.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 active:scale-98 ${
                      isSelected
                        ? 'bg-amber-500 border-amber-600 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold block truncate">{city.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-slate-950 flex-shrink-0" />}
                    </div>
                    <span
                      className={`text-[10px] block truncate ${
                        isSelected ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {city.state}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-400 font-mono">
            Showing theaters for: <strong className="text-slate-800">{currentCity.name} ({currentCity.state})</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
