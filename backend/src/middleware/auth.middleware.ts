import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/token';
import { getDatabase } from '../config/database';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'ORGANIZER' | 'ADMIN';
  avatarUrl?: string;
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      fullName: string;
      role: 'CUSTOMER' | 'ORGANIZER' | 'ADMIN';
      avatarUrl?: string;
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access denied. Bearer token missing.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    const db = getDatabase();
    const result = await db.query(
      'SELECT id, email, full_name, role, avatar_url FROM users WHERE id = $1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.',
      });
      return;
    }

    const row = result.rows[0];
    req.user = {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      avatarUrl: row.avatar_url,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token expired or invalid.',
      error: error.message,
    });
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    const db = getDatabase();
    const result = await db.query(
      'SELECT id, email, full_name, role, avatar_url FROM users WHERE id = $1',
      [payload.userId]
    );
    if (result.rows.length > 0) {
      const row = result.rows[0];
      req.user = {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        avatarUrl: row.avatar_url,
      };
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }

  next();
}

export function requireRole(...allowedRoles: Array<'CUSTOMER' | 'ORGANIZER' | 'ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: `Forbidden. Requires one of roles: [${allowedRoles.join(', ')}]`,
      });
      return;
    }

    next();
  };
}

export async function requireEventOwnership(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const eventId = req.params.id || req.params.eventId;
  if (!eventId) {
    res.status(400).json({ success: false, message: 'Event ID required' });
    return;
  }

  try {
    const db = getDatabase();
    const result = await db.query('SELECT organizer_id FROM events WHERE id = $1', [eventId]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    const event = result.rows[0];
    if (event.organizer_id !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You are not the organizer of this event' });
      return;
    }

    next();
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to verify event ownership', error: err.message });
  }
}
