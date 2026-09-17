import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: 'CUSTOMER' | 'ORGANIZER') => Promise<void>;
  loginWithGoogleSimulated: (email?: string, fullName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setAuthSession: (accessToken: string, refreshToken: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      const token = localStorage.getItem('showpass_access_token');
      const storedUser = localStorage.getItem('showpass_user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify & refresh profile with backend
          const profile = await AuthService.getMe();
          setUser(profile.user);
          localStorage.setItem('showpass_user', JSON.stringify(profile.user));
        } catch (err) {
          console.error('Session validation error:', err);
          // Don't log out immediately if offline, but if 401 interceptor handles it
        }
      }
      setIsLoading(false);
    };

    loadStoredAuth();
  }, []);

  const setAuthSession = (accessToken: string, refreshToken: string, newUser: User) => {
    localStorage.setItem('showpass_access_token', accessToken);
    localStorage.setItem('showpass_refresh_token', refreshToken);
    localStorage.setItem('showpass_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    const data = await AuthService.login({ email, password });
    setAuthSession(data.tokens.accessToken, data.tokens.refreshToken, data.user);
  };

  const register = async (email: string, password: string, fullName: string, role?: 'CUSTOMER' | 'ORGANIZER') => {
    const data = await AuthService.register({ email, password, fullName, role });
    setAuthSession(data.tokens.accessToken, data.tokens.refreshToken, data.user);
  };

  const loginWithGoogleSimulated = async (email?: string, fullName?: string) => {
    const data = await AuthService.simulateGoogleOAuth({ email, fullName });
    setAuthSession(data.tokens.accessToken, data.tokens.refreshToken, data.user);
  };

  const logout = () => {
    localStorage.removeItem('showpass_access_token');
    localStorage.removeItem('showpass_refresh_token');
    localStorage.removeItem('showpass_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await AuthService.getMe();
      setUser(profile.user);
      localStorage.setItem('showpass_user', JSON.stringify(profile.user));
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogleSimulated,
        logout,
        refreshUser,
        setAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
