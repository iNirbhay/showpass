import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { generateAccessToken, generateRefreshToken } from '../../utils/token';
import { env } from '../../config/env';
import { findOrCreateOAuthUser } from '../../config/passport';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await AuthService.getProfile(req.user!.id);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

  static async googleCallback(req: Request, res: Response): Promise<void> {
    const user = req.user as any;
    if (!user) {
      res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
      return;
    }

    const payload = {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Redirect to frontend with tokens in URL parameters
    const redirectUrl = `${env.FRONTEND_URL}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&role=${user.role}`;
    res.redirect(redirectUrl);
  }

  // Developer simulation for Google OAuth when client credentials are not configured in environment
  static async simulateGoogleOAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mockEmail = (req.body.email || 'alex.google@example.com').toLowerCase();
      const mockName = req.body.fullName || 'Alex Rivers (Google)';
      const mockPhoto = req.body.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
      const mockGoogleId = 'google_sim_' + Math.abs(mockEmail.split('').reduce((a: number, b: string) => ((a << 5) - a) + b.charCodeAt(0), 0));

      const user = await findOrCreateOAuthUser({
        id: mockGoogleId,
        email: mockEmail,
        fullName: mockName,
        avatarUrl: mockPhoto,
        provider: 'google',
      });

      const payload = {
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      res.status(200).json({
        success: true,
        message: 'Simulated Google OAuth successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            avatarUrl: user.avatar_url,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
