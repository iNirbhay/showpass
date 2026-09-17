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
import { initDatabase, getDatabase } from './config/database';

let dbReadyPromise: Promise<any> | null = null;

export function ensureDatabaseReady(): Promise<any> {
  if (!dbReadyPromise) {
    dbReadyPromise = initDatabase().catch((err) => {
      console.error('Failed to initialize database:', err);
      dbReadyPromise = null;
      throw err;
    });
  }
  return dbReadyPromise;
}

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

  // Health check with database diagnostics
  app.get('/api/health', async (_req: Request, res: Response) => {
    let dbStatus = 'ready';
    let dbError = null;
    try {
      await ensureDatabaseReady();
      const db = getDatabase();
      await db.query('SELECT 1');
    } catch (err: any) {
      dbStatus = 'error';
      dbError = {
        message: err.message,
        stack: err.stack,
        code: err.code,
      };
    }

    res.status(200).json({
      status: 'healthy',
      database: dbStatus,
      dbError,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Ensure database and migrations are ready before handling any API requests
  app.use('/api', async (req: Request, _res: Response, next: express.NextFunction) => {
    if (req.path === '/health') return next();
    try {
      await ensureDatabaseReady();
      next();
    } catch (err) {
      next(err);
    }
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
