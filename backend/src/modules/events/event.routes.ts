import { Router } from 'express';
import { EventController } from './event.controller';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { createEventSchema } from './event.types';

export const eventRoutes = Router();

// Public routes
eventRoutes.get('/', EventController.listEvents);

// Protected Organizer Dashboard route (must be before /:id)
eventRoutes.get('/dashboard/analytics', authenticateToken, EventController.getOrganizerDashboard);

// Public single event detail
eventRoutes.get('/:id', EventController.getEventById);

// Protected event management (Any authenticated user or organizer can create events as requested)
eventRoutes.post(
  '/',
  authenticateToken,
  validateRequest({ body: createEventSchema }),
  EventController.createEvent
);

// Delete event
eventRoutes.delete('/:id', authenticateToken, EventController.deleteEvent);
