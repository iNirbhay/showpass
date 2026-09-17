export interface SeatResponse {
  id: string;
  eventId: string;
  rowLabel: string;
  colNumber: number;
  seatNumber: string;
  seatTier: 'STANDARD' | 'PREMIUM' | 'VIP';
  priceMultiplier: number;
  finalPrice: number;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'HELD_BY_ME';
  heldUntil?: string | null;
}

export interface SeatMapResponse {
  eventId: string;
  rows: number;
  cols: number;
  basePrice: number;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  heldSeats: number;
  seatRows: {
    rowLabel: string;
    tier: 'STANDARD' | 'PREMIUM' | 'VIP';
    seats: SeatResponse[];
  }[];
}
