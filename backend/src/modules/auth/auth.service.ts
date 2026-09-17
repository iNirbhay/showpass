import bcrypt from 'bcrypt';
import { getDatabase } from '../../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/token';
import { RegisterInput, LoginInput } from './auth.types';

export class AuthService {
  static async register(input: RegisterInput) {
    const db = getDatabase();

    // Check if email already registered
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [input.email.toLowerCase()]);
    if (existing.rows.length > 0) {
      const error: any = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, avatar_url, created_at`,
      [input.email.toLowerCase(), passwordHash, input.fullName, input.role]
    );

    const user = result.rows[0];

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
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
    };
  }

  static async login(input: LoginInput) {
    const db = getDatabase();

    const result = await db.query(
      'SELECT id, email, password_hash, full_name, role, avatar_url FROM users WHERE email = $1',
      [input.email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      const error: any = new Error('Please login with your Google account linked to this email');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await bcrypt.compare(input.password, user.password_hash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
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
    };
  }

  static async refreshToken(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const db = getDatabase();

    const result = await db.query(
      'SELECT id, email, full_name, role, avatar_url FROM users WHERE id = $1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      const error: any = new Error('User no longer exists');
      error.statusCode = 401;
      throw error;
    }

    const user = result.rows[0];
    const newPayload = {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    const accessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url,
      },
    };
  }

  static async getProfile(userId: string) {
    const db = getDatabase();

    const userRes = await db.query(
      'SELECT id, email, full_name, role, avatar_url, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const user = userRes.rows[0];

    // Stats
    const bookingCountRes = await db.query(
      "SELECT COUNT(*) as count FROM bookings WHERE user_id = $1 AND status = 'CONFIRMED'",
      [userId]
    );

    let eventStats = null;
    if (user.role === 'ORGANIZER' || user.role === 'ADMIN') {
      const eventRes = await db.query(
        'SELECT COUNT(*) as count FROM events WHERE organizer_id = $1',
        [userId]
      );
      eventStats = {
        createdEvents: parseInt(eventRes.rows[0]?.count || '0', 10),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
      },
      stats: {
        confirmedBookings: parseInt(bookingCountRes.rows[0]?.count || '0', 10),
        organizer: eventStats,
      },
    };
  }
}
