# ShowPass (CINTEL) — Full-Stack Seat Booking & Event Management Platform

A production-quality full-stack Seat Booking & Event Management platform inspired by BookMyShow, featuring an interactive curved-screen seat map, strict max-4 seat selection, a dedicated **Sandstone Payment Gateway** integration with server-side HMAC-SHA256 signature verification, Passport.js OAuth + custom JWT authentication, and an **unbreakable database-level concurrency lock** preventing any possibility of double-booking.

---

## Key Features

1. **Unbreakable Zero Double-Booking Guarantee**:
   - **PostgreSQL Row Locks**: `SELECT ... FOR UPDATE` ordered by ID prevents race conditions and deadlocks.
   - **Database-Level Partial Unique Index**: `CREATE UNIQUE INDEX idx_unique_active_seat_booking ON booking_seats (seat_id) WHERE status IN ('HELD', 'BOOKED')` guarantees hardware-level refusal (`23505`) of any concurrent duplicate booking attempt.
   - **10-Minute Hold Window**: Held seats automatically expire if payment is abandoned, releasing seats back to the available pool.

2. **Dedicated Sandstone Payment Gateway Module**:
   - Structured strictly under `backend/src/modules/payments/`:
     - `payment.controller.ts`
     - `payment.service.ts`
     - `payment.routes.ts`
     - `payment.types.ts`
     - `sandstone.service.ts`
   - **Server-Side Verification**: Never trusts client claims. Verifies cryptographic HMAC-SHA256 signatures before confirming reservations via atomic database RPC.
   - **Secure Webhooks**: Supports webhook verification with `x-sandstone-signature`.
   - **Interactive Modal**: Sleek modern checkout modal supporting Cards, UPI QR codes, and Net Banking.

3. **Event Management & Seating Matrix Engine**:
   - Any authenticated user can host an event.
   - Configurable rows (1-20) and columns (1-20) with live interactive venue preview.
   - Automatic tier generation: VIP (Front 2 rows, 1.5x), Premium (Middle rows, 1.25x), and Standard (Rear rows, 1.0x).
   - Organizer Dashboard with real-time occupancy rates, sales metrics, and attendee booking records.

4. **Modern UI & Digital Passes**:
   - Curated BookMyShow-style dark cinema aesthetic with glowing curved screen simulation.
   - Maximum 4 seats per booking rule enforced on both client and database level.
   - Boarding-pass styled printable digital admission tickets with high-contrast QR codes and ticket tear lines.

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v7, TanStack Query, Axios, Lucide React, React Hook Form, Zod, Canvas Confetti.
- **Backend**: Node.js, Express, TypeScript, Passport.js, Bcrypt, JsonWebToken, Zod.
- **Database**: PostgreSQL (via Supabase or embedded PostgreSQL `@electric-sql/pglite` with full PL/pgSQL RPC support).
- **Payments**: Sandstone Payment Gateway.

---

## Directory Structure

```
CINTEL/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts                   # Validated environment configuration (Zod)
│   │   │   ├── database.ts              # PostgreSQL / Supabase pool & PGlite fallback
│   │   │   └── passport.ts              # Passport.js Google OAuth configuration
│   │   ├── db/
│   │   │   ├── migrations/
│   │   │   │   ├── 001_initial_schema.sql         # Schema with partial unique index
│   │   │   │   └── 002_rpc_booking_functions.sql  # reserve_seats & confirm_booking_payment RPC
│   │   │   ├── seed.ts                  # Demo events, categories, and seating layouts
│   │   │   └── supabase.ts              # Supabase client wrapper
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts       # JWT verify, extract req.user, role guards
│   │   │   ├── error.middleware.ts      # Centralized error handler
│   │   │   └── validate.middleware.ts   # Zod request validator
│   │   ├── modules/
│   │   │   ├── auth/                    # Registration, Login, Refresh, Google OAuth
│   │   │   ├── events/                  # Event CRUD, live matrix generation, discovery
│   │   │   ├── seats/                   # Seat grid map, real-time availability
│   │   │   ├── bookings/                # RPC reservation, hold management, my bookings
│   │   │   └── payments/                # Dedicated Sandstone Payment Gateway module
│   │   │       ├── payment.controller.ts
│   │   │       ├── payment.service.ts
│   │   │       ├── payment.routes.ts
│   │   │       ├── payment.types.ts
│   │   │       └── sandstone.service.ts
│   │   ├── utils/
│   │   ├── app.ts                       # Express setup, CORS, Webhook raw body
│   │   └── server.ts                    # HTTP server & automatic hold cleanup daemon
│   ├── test/
│   │   ├── concurrency_test.ts          # 50-request simultaneous stress test
│   │   └── e2e_integration_test.ts      # Complete 12-step lifecycle integration test
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                  # Navbar, Footer, ProtectedRoute
│   │   │   ├── seat-map/                # InteractiveSeatGrid, SeatLegend, SeatSummaryBar
│   │   │   ├── events/                  # EventCard, EventFilters, SeatGridPreview
│   │   │   ├── payment/                 # SandstoneModal, HoldCountdownTimer
│   │   │   └── ticket/                  # DigitalTicket with QR code
│   │   ├── context/
│   │   │   └── AuthContext.tsx          # User state, JWT persistence, auto-refresh
│   │   ├── pages/                       # Home, Events, EventDetail, SeatSelection, Checkout, Confirmation, MyBookings, CreateEvent, Dashboard, Login, Register, Profile
│   │   ├── services/                    # Axios API client, Auth, Events, Bookings, Payments
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── package.json                         # Root orchestration scripts
└── README.md
```

---

## Environment Variables

Check `backend/.env.example` for all configurable variables:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=super_secret_jwt_key_cintel_showpass_2025_secure
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=super_secret_refresh_jwt_key_cintel_showpass_2025
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration (Supabase / PostgreSQL)
# Leave blank to use local embedded PostgreSQL engine, or provide standard Supabase/PG connection string:
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Passport.js Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Sandstone Payment Gateway Configuration
SANDSTONE_API_KEY=sandstone_live_key_99382173918237
SANDSTONE_SECRET_KEY=sandstone_sec_884920481029481920
SANDSTONE_MERCHANT_ID=MID_SANDSTONE_SHOWPASS_01
SANDSTONE_WEBHOOK_SECRET=whsec_sandstone_83921094820194820
SANDSTONE_GATEWAY_URL=https://api.sandstonepay.io/v1
```

---

## Running the Application

### 1. Install Dependencies
```bash
# In backend:
cd backend && npm install

# In frontend:
cd frontend && npm install
```

### 2. Run Tests (Concurrency & Integration)
```bash
# Run 50-request simultaneous double-booking stress test
npm run test:concurrency --prefix backend

# Run complete 12-step end-to-end integration test
npm run test:e2e --prefix backend
```

### 3. Start Development Servers
```bash
# In separate terminals:
npm run dev --prefix backend     # Runs on http://localhost:5000
npm run dev --prefix frontend    # Runs on http://localhost:5173
```

---

## Demo Accounts

Pre-seeded for instant testing:
- **Organizer**: `organizer@showpass.com` / `password123`
- **Customer**: `john@example.com` / `password123`
- **Google 1-Click Simulation**: Available on the login page for zero-credential testing.
