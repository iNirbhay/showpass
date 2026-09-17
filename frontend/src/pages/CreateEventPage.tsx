import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EventService } from '../services/event.service';
import { SeatGridPreview } from '../components/events/SeatGridPreview';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  PlusCircle, 
  DollarSign, 
  Grid3X3, 
  ImageIcon, 
  Loader2, 
  Sparkles,
  AlertCircle,
  Sliders
} from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['Movies', 'Concerts', 'Comedy', 'Theatre', 'Sports']),
  venue: z.string().min(1, 'Venue address is required'),
  eventDate: z.string().refine((val) => {
    const today = new Date().toISOString().split('T')[0];
    return val >= today;
  }, { message: 'Date must be today or in the future' }),
  eventTime: z.string().min(1, 'Time is required'),
  price: z.number().min(0, 'Ticket price must be >= 0'),
  rows: z.number().int().min(1, 'Rows must be at least 1').max(20, 'Max 20 rows allowed'),
  cols: z.number().int().min(1, 'Columns must be at least 1').max(20, 'Max 20 columns allowed'),
  coverImageUrl: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: 'Movies',
      rows: 8,
      cols: 12,
      price: 450,
      eventDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days ahead
      eventTime: '19:30',
      coverImageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    },
  });

  const watchedRows = watch('rows');
  const watchedCols = watch('cols');
  const watchedPrice = watch('price');

  const createMutation = useMutation({
    mutationFn: (data: FormData) => EventService.createEvent(data),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events-list'] });
      navigate(`/events/${newEvent.id}`);
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const presetImages = [
    { label: 'Sci-Fi Cinema', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Arena Concert', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Comedy Club', url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Broadway Theatre', url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-28">
      {/* Studio Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sliders className="w-3.5 h-3.5 text-amber-600" />
          <span>Auditorium Studio & Screening Publisher</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
          Create & Schedule Screening
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Configure venue layout parameters, base tier pricing, and showtimes. The high-concurrency database seat engine will generate all individual seat records automatically.
        </p>
      </div>

      {createMutation.isError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{(createMutation.error as any)?.response?.data?.message || 'Failed to create event. Please verify inputs.'}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Basic Info */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[11px] font-mono">1</span>
              <span>Screening Overview</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Screening / Event Title *</label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Interstellar: 10th Anniversary IMAX 70mm"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
              />
              {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Category *</label>
                <select
                  {...register('category')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
                >
                  <option value="Movies">Movies</option>
                  <option value="Concerts">Concerts</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Theatre">Theatre</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Base Ticket Price (₹) *</label>
                <input
                  type="number"
                  step="10"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="450"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 transition"
                />
                {errors.price && <p className="text-rose-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Description & Screening Notes *</label>
              <textarea
                rows={3}
                {...register('description')}
                placeholder="Details on the screening format, duration, audio mix, and admission guidelines..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
              />
              {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* Section 2: Venue & Schedule */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[11px] font-mono">2</span>
              <span>Auditorium & Showtime</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Auditorium / Venue Name *</label>
              <input
                type="text"
                {...register('venue')}
                placeholder="e.g. CINTEL Cinema 01, Bandra West, Mumbai"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
              />
              {errors.venue && <p className="text-rose-500 text-xs mt-1">{errors.venue.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Date *</label>
                <input
                  type="date"
                  {...register('eventDate')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
                />
                {errors.eventDate && <p className="text-rose-500 text-xs mt-1">{errors.eventDate.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Showtime *</label>
                <input
                  type="time"
                  {...register('eventTime')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 transition"
                />
                {errors.eventTime && <p className="text-rose-500 text-xs mt-1">{errors.eventTime.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Seating Dimensions */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[11px] font-mono">3</span>
                <span>Auditorium Seating Matrix (1-20)</span>
              </h3>
              <span className="text-xs font-mono font-bold text-amber-600">
                {Number(watchedRows || 0) * Number(watchedCols || 0)} Total Seats
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Rows (1 - 20)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  {...register('rows', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 transition"
                />
                {errors.rows && <p className="text-rose-500 text-xs mt-1">{errors.rows.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Columns per Row (1 - 20)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  {...register('cols', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 transition"
                />
                {errors.cols && <p className="text-rose-500 text-xs mt-1">{errors.cols.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 4: Cover Image */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[11px] font-mono">4</span>
              <span>Screening Poster Visual</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Custom Image URL</label>
              <input
                type="url"
                {...register('coverImageUrl')}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
              />
              {errors.coverImageUrl && <p className="text-rose-500 text-xs mt-1">{errors.coverImageUrl.message}</p>}
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-2 font-medium">Quick cinematic presets:</span>
              <div className="flex flex-wrap gap-2">
                {presetImages.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setValue('coverImageUrl', p.url)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-medium text-slate-700 transition active:scale-[0.98]"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-4 rounded-xl font-bold text-sm text-slate-950 bg-amber-500 hover:bg-amber-400 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Seating Matrix & Publishing...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Publish Screening & Seat Grid</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Interactive Seat Grid Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 space-y-6">
            <SeatGridPreview
              rows={watchedRows || 1}
              cols={watchedCols || 1}
              basePrice={watchedPrice || 0}
            />

            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-xs text-slate-500 space-y-2.5 shadow-xs">
              <span className="font-bold text-slate-900 block text-xs">Automatic Tier Assignment:</span>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Rows A & B: <strong className="text-amber-800">VIP Recliners</strong> (1.5x Base Price)</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Rows C to {String.fromCharCode(65 + Math.min(Math.ceil((watchedRows || 1) / 2), 20))}: <strong className="text-amber-700">Premium Club</strong> (1.25x Base Price)</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Remaining rows: <strong className="text-slate-700">Standard</strong> (1.0x Base Price)</span>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
