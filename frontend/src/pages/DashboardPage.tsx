import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EventService } from '../services/event.service';
import { 
  LayoutDashboard, 
  PlusCircle, 
  DollarSign, 
  Ticket, 
  Users, 
  Calendar, 
  TrendingUp, 
  ExternalLink, 
  Trash2, 
  Loader2,
  AlertCircle,
  Tv,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['organizer-dashboard'],
    queryFn: () => EventService.getOrganizerDashboard(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => EventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-dashboard'] });
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This will cancel all associated seats and bookings.`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="py-36 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#FACC15]" />
        </div>
        <p className="text-xs text-slate-400 font-mono">Aggregating auditorium performance metrics...</p>
      </div>
    );
  }

  const summary = dashboard?.summary || { totalEvents: 0, totalRevenue: 0, totalTicketsSold: 0 };
  const events = dashboard?.events || [];
  const recentBookings = dashboard?.recentBookings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
            <span>Executive Command Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
            Auditorium & Sales Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real-time occupancy rates, verified Sandstone gateway settlements, and attendee seat allocation records.
          </p>
        </div>

        <Link
          to="/create-event"
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-slate-950 bg-amber-500 hover:bg-amber-400 transition shadow-md self-start sm:self-auto active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Schedule New Screening</span>
        </Link>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Verified Sandstone Gross</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
            ₹{summary.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cryptographically Verified Settlements</span>
          </span>
        </div>

        {/* Tickets Sold */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Admission Tickets Sold</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Ticket className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
            {summary.totalTicketsSold}
          </p>
          <span className="text-[11px] text-slate-500 pt-1 block">
            Across all active auditoriums
          </span>
        </div>

        {/* Events Managed */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Scheduled Screenings</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
            {summary.totalEvents}
          </p>
          <span className="text-[11px] text-slate-500 pt-1 block">
            Equipped with row-level locks
          </span>
        </div>
      </div>

      {/* Events Managed Table / List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-bold text-slate-900 tracking-wide">
            Managed Screenings & Occupancy
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {events.length} Active Shows
          </span>
        </div>

        {events.length > 0 ? (
          <div className="space-y-3.5">
            {events.map((ev: any) => (
              <div
                key={ev.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                      {ev.category}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(ev.event_date).toLocaleDateString()} at {ev.event_time} IST
                    </span>
                  </div>

                  <h4 className="text-base font-display font-bold text-slate-900">{ev.title}</h4>
                  <p className="text-xs text-slate-500 truncate">{ev.venue}</p>

                  {/* Occupancy meter */}
                  <div className="pt-2 flex items-center gap-3.5 max-w-md">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${ev.occupancyRate}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">{ev.occupancyRate}% Occupied</span>
                    <span className="text-xs text-slate-400 font-mono">({ev.booked_seats} / {ev.total_seats} seats)</span>
                  </div>
                </div>

                {/* Sales & Actions */}
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 border-t border-slate-100 md:border-t-0 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Screening Revenue</span>
                    <p className="text-xl font-black text-amber-600 font-mono">
                      ₹{ev.total_revenue.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/events/${ev.id}/seats`}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition shadow-xs active:scale-[0.98]"
                      title="View Live Seat Grid"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(ev.id, ev.title)}
                      className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition shadow-xs active:scale-[0.98]"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3 max-w-md mx-auto shadow-xs">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">You haven't scheduled any screenings or events yet.</p>
            <Link
              to="/create-event"
              className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 transition shadow-sm active:scale-[0.98]"
            >
              Launch First Event
            </Link>
          </div>
        )}
      </div>

      {/* Recent Bookings Audit Table */}
      {recentBookings.length > 0 ? (
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-display font-bold text-slate-900 tracking-wide">
            Recent Attendee Bookings Log
          </h3>

          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-5">Ref Code</th>
                    <th className="py-3 px-5">Screening</th>
                    <th className="py-3 px-5">Customer</th>
                    <th className="py-3 px-5">Seats</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((b: any) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5 font-mono text-slate-600 font-semibold">{b.booking_reference}</td>
                      <td className="py-3.5 px-5 text-slate-900 font-medium">{b.event_title}</td>
                      <td className="py-3.5 px-5 text-slate-500">{b.customer_name || b.user_name || b.customer_email || 'Customer'}</td>
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-700">
                        <div className="flex flex-wrap gap-1">
                          {b.seats?.map((st: string) => (
                            <span key={st} className="px-1.5 py-0.5 rounded bg-amber-50 text-[10px] font-bold text-amber-800 border border-amber-200">
                              {st}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-amber-600">
                        ₹{Number(b.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
