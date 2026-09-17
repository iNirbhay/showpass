import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocationService, CityLocation, CITIES_DATABASE } from '../services/location.service';

interface LocationContextType {
  currentCity: CityLocation;
  setCityId: (id: string) => void;
  detectLocation: () => Promise<void>;
  isDetecting: boolean;
  isSelectorOpen: boolean;
  setIsSelectorOpen: (open: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentCity, setCurrentCity] = useState<CityLocation>(LocationService.getDefaultCity());
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);

  useEffect(() => {
    // Initial boot: check saved city or auto-detect once
    const saved = LocationService.getSavedCityId();
    if (saved && CITIES_DATABASE[saved]) {
      setCurrentCity(CITIES_DATABASE[saved]);
    } else {
      detectLocation();
    }
  }, []);

  const detectLocation = async () => {
    setIsDetecting(true);
    try {
      const detected = await LocationService.autoDetectLocation();
      setCurrentCity(detected);
    } catch (err) {
      console.warn('Location detection fallback used', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const setCityId = (id: string) => {
    const city = LocationService.getCityById(id);
    LocationService.saveCityId(id);
    setCurrentCity(city);
  };

  return (
    <LocationContext.Provider
      value={{
        currentCity,
        setCityId,
        detectLocation,
        isDetecting,
        isSelectorOpen,
        setIsSelectorOpen,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
};
