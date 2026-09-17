import { api } from './api';
import { Event } from '../types';

export interface EventFilters {
  search?: string;
  category?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const EventService = {
  async getEvents(filters: EventFilters = {}): Promise<Event[]> {
    const res = await api.get('/events', { params: filters });
    return res.data.data;
  },

  async getEventById(id: string): Promise<Event> {
    const res = await api.get(`/events/${id}`);
    return res.data.data;
  },

  async createEvent(data: {
    title: string;
    description: string;
    category: string;
    venue: string;
    eventDate: string;
    eventTime: string;
    price: number;
    rows: number;
    cols: number;
    coverImageUrl?: string;
  }): Promise<Event> {
    const res = await api.post('/events', data);
    return res.data.data;
  },

  async getOrganizerDashboard() {
    const res = await api.get('/events/dashboard/analytics');
    return res.data.data;
  },

  async deleteEvent(id: string) {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
};
