import { z } from 'zod';

export const reserveSeatsSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  seatIds: z.array(z.string().uuid('Invalid seat ID'))
    .min(1, 'Please select at least 1 seat')
    .max(4, 'You cannot book more than 4 seats per booking'),
  holdDurationSeconds: z.number().int().min(60).max(1800).default(600), // Default 10 minutes
  showDate: z.string().optional(),
  showTime: z.string().optional(),
  cinemaName: z.string().optional(),
});

export type ReserveSeatsInput = z.infer<typeof reserveSeatsSchema>;
