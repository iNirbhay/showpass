import React from 'react';
import { Booking } from '../../types';
import { Calendar, Clock, MapPin, Printer, CheckCircle2, Ticket } from 'lucide-react';

interface DigitalTicketProps {
  booking: Booking;
}

export const DigitalTicket: React.FC<DigitalTicketProps> = ({ booking }) => {
  const handlePrint = () => {
    window.print();
  };

  const rawDate = booking.event_date;
  const parsedDate = new Date(rawDate);
  const formattedDate = !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : rawDate;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Ticket Pass Envelope */}
      <div className="relative rounded-3xl bg-white border border-slate-200 shadow-md overflow-hidden text-left print:border-black print:bg-white print:text-black">
        {/* Top Pass Header */}
        <div className="p-6 pb-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-display font-black text-xs shadow-sm">
              SP
            </div>
            <div>
              <span className="font-display font-black text-sm text-white tracking-tight">
                SHOW<span className="text-amber-400">PASS</span> ADMISSION TICKET
              </span>
              <p className="font-mono text-[10px] text-slate-400">
                REF: {booking.booking_reference}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>CONFIRMED</span>
          </div>
        </div>

        {/* Ticket Body Content */}
        <div className="p-6 space-y-5 bg-white">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 mb-2">
              {booking.event_category}
            </span>
            <h3 className="font-display font-black text-2xl text-slate-900 leading-tight">
              {booking.event_title}
            </h3>
          </div>

          {/* Timing & Venue */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Date</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{formattedDate}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Showtime</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{booking.event_time}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Auditorium / Venue</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{booking.event_venue}</p>
            </div>
          </div>

          {/* Seats Chips */}
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">Reserved Seat(s)</span>
            <div className="flex flex-wrap gap-2">
              {booking.seats?.map((seat, index) => (
                <div
                  key={index}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs font-mono font-bold text-slate-900"
                >
                  <span>SEAT {seat.seatNumber}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-amber-800 border border-amber-200">
                    {seat.tier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Perforated Tear Line Cutout (cutout matches luminous base #F8FAFC) */}
        <div className="relative flex items-center justify-between my-0.5">
          <div className="w-5 h-5 rounded-full bg-[#F8FAFC] -ml-2.5 border-r border-slate-200"></div>
          <div className="w-full border-b-2 border-dashed border-slate-200 mx-2"></div>
          <div className="w-5 h-5 rounded-full bg-[#F8FAFC] -mr-2.5 border-l border-slate-200"></div>
        </div>

        {/* Bottom Ticket Stub (QR & Amount) */}
        <div className="p-6 pt-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Paid via Sandstone</span>
            <p className="font-mono font-black text-2xl text-slate-900">
              ₹{Number(booking.total_amount).toFixed(2)}
            </p>
            <p className="font-mono text-[9px] text-slate-400">
              TRANS: {booking.payment_intent_id || 'SANDSTONE-GATEWAY'}
            </p>
          </div>

          {/* High-Contrast QR Code for Scanner */}
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-950 rounded p-1 flex items-center justify-center">
              <div className="grid grid-cols-4 gap-0.5 w-full h-full bg-white p-0.5">
                <div className="bg-slate-950"></div>
                <div className="bg-slate-950"></div>
                <div className="bg-white"></div>
                <div className="bg-slate-950"></div>
                <div className="bg-white"></div>
                <div className="bg-slate-950"></div>
                <div className="bg-slate-950"></div>
                <div className="bg-white"></div>
                <div className="bg-slate-950"></div>
                <div className="bg-white"></div>
                <div className="bg-slate-950"></div>
                <div className="bg-slate-950"></div>
                <div className="bg-slate-950"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-slate-950"></div>
              </div>
            </div>
            <span className="text-[8px] font-mono font-bold mt-1 text-slate-600">GATE SCANNER</span>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-center print:hidden">
        <button
          onClick={handlePrint}
          className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5 text-[#9ba1b0]" />
          <span>Print / Save Admission Pass</span>
        </button>
      </div>
    </div>
  );
};
