export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'ORGANIZER' | 'ADMIN';
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface CastMember {
  name: string;
  role: string;
  avatarUrl: string;
}

export interface ReviewItem {
  source: string;
  rating: string;
  comment?: string;
  badge?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: 'Movies' | 'Concerts' | 'Comedy' | 'Theatre' | 'Sports' | string;
  venue: string;
  event_date: string;
  event_time: string;
  price: number | string;
  rows: number;
  cols: number;
  cover_image_url?: string;
  backdrop_url?: string;
  certification?: string;
  language?: string;
  duration?: string;
  genres?: string[];
  release_date?: string;
  cast_members?: CastMember[];
  reviews?: ReviewItem[];
  organizer_id?: string;
  organizer_name?: string;
  organizer_email?: string;
  total_seats?: number;
  booked_seats?: number;
  available_seats?: number;
  held_seats?: number;
  occupancyRate?: number;
  created_at?: string;
}

export interface Seat {
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

export interface SeatRow {
  rowLabel: string;
  tier: 'STANDARD' | 'PREMIUM' | 'VIP';
  seats: Seat[];
}

export interface SeatMap {
  eventId: string;
  rows: number;
  cols: number;
  basePrice: number;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  heldSeats: number;
  seatRows: SeatRow[];
}

export interface BookingSeat {
  id: string;
  seatNumber: string;
  rowLabel: string;
  colNumber: number;
  tier: 'STANDARD' | 'PREMIUM' | 'VIP';
  price: number | string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  event_id: string;
  user_id?: string;
  total_amount: number | string;
  seat_count: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  payment_status: 'UNPAID' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  payment_intent_id?: string;
  expires_at: string;
  created_at: string;
  event_title: string;
  event_venue: string;
  event_date: string;
  event_time: string;
  event_category: string;
  event_cover_image?: string;
  seats: BookingSeat[];
  user_name?: string;
  user_email?: string;
}

export interface SandstoneOrder {
  orderId: string;
  amount: number;
  currency: string;
  merchantId: string;
  clientSecret: string;
  status: string;
  createdAt: number;
}

export interface PaymentIntentResponse {
  order: SandstoneOrder;
  booking: {
    id: string;
    bookingReference: string;
    eventTitle: string;
    totalAmount: number;
    expiresAt: string;
  };
}
