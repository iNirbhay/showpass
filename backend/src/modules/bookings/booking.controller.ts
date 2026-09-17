import { Request, Response, NextFunction } from 'express';
import { BookingService } from './booking.service';

export class BookingController {
  static async reserveSeats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BookingService.reserveSeats(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Seats held successfully. Please complete payment within the hold window.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await BookingService.getMyBookings(req.user!.id);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await BookingService.getBookingById(req.params.id, req.user!.id);
      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  static async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BookingService.cancelBooking(req.params.id, req.user!.id);
      res.status(200).json({
        success: true,
        message: 'Booking cancelled and seats released.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
