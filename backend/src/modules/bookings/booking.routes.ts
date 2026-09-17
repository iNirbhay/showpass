import { Router } from 'express';
import { BookingController } from './booking.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { reserveSeatsSchema } from './booking.types';

export const bookingRoutes = Router();

// All booking routes require authentication
bookingRoutes.use(authenticateToken);

// Hold/reserve seats (Max 4 seats, DB-level row locks & partial unique index)
bookingRoutes.post('/reserve', validateRequest({ body: reserveSeatsSchema }), BookingController.reserveSeats);

// Get authenticated user's bookings
bookingRoutes.get('/my-bookings', BookingController.getMyBookings);

// Get single booking by ID
bookingRoutes.get('/:id', BookingController.getBookingById);

// Cancel booking
bookingRoutes.post('/:id/cancel', BookingController.cancelBooking);
