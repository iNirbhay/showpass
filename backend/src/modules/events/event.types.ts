import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['Movies', 'Concerts', 'Comedy', 'Theatre', 'Sports']).default('Movies'),
  venue: z.string().min(1, 'Venue is required'),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').refine((val) => {
    const today = new Date().toISOString().split('T')[0];
    return val >= today;
  }, { message: 'Event date must be in the future or today' }),
  eventTime: z.string().min(1, 'Event time is required'),
  price: z.number().min(0, 'Ticket price must be >= 0'),
  rows: z.number().int().min(1, 'Rows must be at least 1').max(20, 'Rows cannot exceed 20'),
  cols: z.number().int().min(1, 'Columns must be at least 1').max(20, 'Columns cannot exceed 20'),
  coverImageUrl: z.string().url('Invalid cover image URL').optional().or(z.literal('')),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
