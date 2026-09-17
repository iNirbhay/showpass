import { Router } from 'express';
import passport from 'passport';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.types';
import { env } from '../../config/env';

export const authRoutes = Router();

// Local Registration & Login
authRoutes.post('/register', validateRequest({ body: registerSchema }), AuthController.register);
authRoutes.post('/login', validateRequest({ body: loginSchema }), AuthController.login);
authRoutes.post('/refresh', validateRequest({ body: refreshTokenSchema }), AuthController.refreshToken);
authRoutes.get('/me', authenticateToken, AuthController.getMe);

// Google OAuth endpoints via Passport.js
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  authRoutes.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
  );

  authRoutes.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${env.FRONTEND_URL}/login?error=oauth_failed` }),
    AuthController.googleCallback
  );
} else {
  // If credentials are not configured, provide friendly message or simulation hook
  authRoutes.get('/google', (_req, res) => {
    res.status(501).json({
      success: false,
      message: 'Google OAuth client ID/secret are not configured in .env. Use simulated OAuth or email login.',
    });
  });
}

// Development simulated OAuth endpoint
authRoutes.post('/google/simulate', AuthController.simulateGoogleOAuth);
