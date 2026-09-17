import { Request, Response, NextFunction } from 'express';
import { EventService } from './event.service';

export class EventController {
  static async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await EventService.createEvent(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        message: 'Event created successfully with seating grid',
        data: event,
      });
    } catch (err) {
      next(err);
    }
  }

  static async listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, category, date, minPrice, maxPrice } = req.query;
      const events = await EventService.listEvents({
        search: search as string,
        category: category as string,
        date: date as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });

      res.status(200).json({
        success: true,
        data: events,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await EventService.getEventById(req.params.id);
      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getOrganizerDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dashboard = await EventService.getOrganizerDashboard(req.user!.id);
      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EventService.deleteEvent(req.params.id, req.user!.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
