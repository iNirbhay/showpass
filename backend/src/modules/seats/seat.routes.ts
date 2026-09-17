import { Router } from 'express';
import { SeatController } from './seat.controller';
import { optionalAuth } from '../../middleware/auth.middleware';

export const seatRoutes = Router();

// Get interactive seat grid for an event (with optionalAuth so we can identify current user's held seats)
seatRoutes.get('/events/:eventId/seats', optionalAuth, SeatController.getEventSeats);
