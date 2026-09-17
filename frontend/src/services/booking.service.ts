import { api } from './api';
import { SeatMap, Booking } from '../types';

export const BookingService = {
  async getEventSeats(eventId: string): Promise<SeatMap> {
    const res = await api.get(`/seats/events/${eventId}/seats`);
    return res.data.data;
  },

  async reserveSeats(data: {
    eventId: string;
    seatIds: string[];
    holdDurationSeconds?: number;
    showDate?: string;
    showTime?: string;
    cinemaName?: string;
  }) {
    const res = await api.post('/bookings/reserve', data);
    return res.data.data;
  },

  async getMyBookings(): Promise<Booking[]> {
    const res = await api.get('/bookings/my-bookings');
    return res.data.data;
  },

  async getBookingById(bookingId: string): Promise<Booking> {
    const res = await api.get(`/bookings/${bookingId}`);
    return res.data.data;
  },

  async cancelBooking(bookingId: string) {
    const res = await api.post(`/bookings/${bookingId}/cancel`);
    return res.data;
  },
};
