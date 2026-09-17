import { api } from './api';
import { AuthResponse } from '../types';

export const AuthService = {
  async register(data: { email: string; password: string; fullName: string; role?: 'CUSTOMER' | 'ORGANIZER' }): Promise<AuthResponse> {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  },

  async simulateGoogleOAuth(data: { email?: string; fullName?: string; avatarUrl?: string }): Promise<AuthResponse> {
    const res = await api.post('/auth/google/simulate', data);
    return res.data.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};
