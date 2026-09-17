import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { getDatabase } from './database';
import { logger } from '../utils/logger';

export interface OAuthUserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  provider: string;
}

export function configurePassport(): void {
  // Serialize & Deserialize for session-based handshakes if needed
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const db = getDatabase();
      const res = await db.query('SELECT id, email, full_name, role, avatar_url FROM users WHERE id = $1', [id]);
      if (res.rows.length === 0) return done(null, false);
      done(null, res.rows[0]);
    } catch (err) {
      done(err, null);
    }
  });

  // Strategy Registry: Google OAuth 2.0
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    logger.info('Registering Passport Google OAuth strategy...');
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL,
          scope: ['profile', 'email'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email found in Google profile'), undefined);
            }

            const fullName = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'Google User';
            const avatarUrl = profile.photos?.[0]?.value;
            const googleId = profile.id;

            const user = await findOrCreateOAuthUser({
              id: googleId,
              email,
              fullName,
              avatarUrl,
              provider: 'google',
            });

            return done(null, user);
          } catch (error) {
            logger.error('Google OAuth verify error:', error);
            return done(error as Error, undefined);
          }
        }
      )
    );
  } else {
    logger.warn('Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) not set. Standard local auth & simulated OAuth available.');
  }

  // Extensible Strategy Hook: Future providers (GitHub, Apple, etc.) can be registered here:
  // registerAdditionalStrategies(passport);
}

export async function findOrCreateOAuthUser(profile: OAuthUserProfile) {
  const db = getDatabase();

  // 1. Check if user with this google_id already exists
  const existingByGoogleId = await db.query(
    'SELECT id, email, full_name, role, avatar_url FROM users WHERE google_id = $1',
    [profile.id]
  );

  if (existingByGoogleId.rows.length > 0) {
    return existingByGoogleId.rows[0];
  }

  // 2. Check if user with same email exists (e.g. registered via local email)
  const existingByEmail = await db.query(
    'SELECT id, email, full_name, role, avatar_url FROM users WHERE email = $1',
    [profile.email.toLowerCase()]
  );

  if (existingByEmail.rows.length > 0) {
    // Link Google ID to existing user account
    const updated = await db.query(
      `UPDATE users 
       SET google_id = $1, 
           avatar_url = COALESCE(avatar_url, $2), 
           updated_at = NOW() 
       WHERE id = $3 
       RETURNING id, email, full_name, role, avatar_url`,
      [profile.id, profile.avatarUrl || null, existingByEmail.rows[0].id]
    );
    return updated.rows[0];
  }

  // 3. Create new user
  const newUser = await db.query(
    `INSERT INTO users (email, full_name, avatar_url, role, google_id)
     VALUES ($1, $2, $3, 'CUSTOMER', $4)
     RETURNING id, email, full_name, role, avatar_url`,
    [profile.email.toLowerCase(), profile.fullName, profile.avatarUrl || null, profile.id]
  );

  return newUser.rows[0];
}
