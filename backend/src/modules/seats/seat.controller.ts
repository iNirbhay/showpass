import { Request, Response, NextFunction } from 'express';
import { SeatService } from './seat.service';

export class SeatController {
  static async getEventSeats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = req.params.eventId;
      const currentUserId = req.user?.id;
      const seatMap = await SeatService.getEventSeatMap(eventId, currentUserId);

      res.status(200).json({
        success: true,
        data: seatMap,
      });
    } catch (err) {
      next(err);
    }
  }
}
