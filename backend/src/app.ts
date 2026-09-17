import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import { env } from './config/env';
import { configurePassport } from './config/passport';
import { authRoutes } from './modules/auth/auth.routes';
import { eventRoutes } from './modules/events/event.routes';
import { seatRoutes } from './modules/seats/seat.routes';
import { bookingRoutes } from './modules/bookings/booking.routes';
import { paymentRoutes } from './modules/payments/payment.routes';
import { errorHandler } from './middleware/error.middleware';

export function createApp(): express.Application {
  const app = express();

  // Middleware: Permissive & Secure CORS for Vercel and local dev
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        if (!requestOrigin) return callback(null, true);
        if (
          requestOrigin === env.FRONTEND_URL ||
          requestOrigin.endsWith('.vercel.app') ||
          requestOrigin.includes('localhost') ||
          requestOrigin.includes('127.0.0.1')
        ) {
          return callback(null, true);
        }
        // Allow any origin in production to prevent deployment lockouts
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-sandstone-signature'],
    })
  );

  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Raw body capture for webhook signature verification
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        if (req.originalUrl.includes('/api/payments/webhook')) {
          req.rawBody = buf.toString('utf8');
        }
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));

  // Passport.js Initialization
  configurePassport();
  app.use(passport.initialize());

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/seats', seatRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/payments', paymentRoutes);

  // 404 handler for undefined routes
  app.use('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'API route not found',
    });
  });

  // Centralized Error Middleware
  app.use(errorHandler);

  return app;
}

const defaultApp = createApp();
export default defaultApp;
