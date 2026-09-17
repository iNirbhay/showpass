import { Pool, PoolClient } from 'pg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { env } from './env';
import { logger } from '../utils/logger';
import {
  MIGRATION_001_SQL,
  MIGRATION_002_SQL,
  MIGRATION_003_SQL,
  MIGRATION_004_SQL,
} from '../db/migrations/migrationQueries';

export interface DatabaseClient {
  query: (text: string, params?: any[]) => Promise<{ rows: any[]; rowCount?: number | null }>;
  getClient?: () => Promise<PoolClient>;
  isPGlite?: boolean;
}

let pool: Pool | null = null;
let pgliteInstance: any = null;

export async function initDatabase(): Promise<DatabaseClient> {
  if (env.DATABASE_URL) {
    logger.info('Connecting to external PostgreSQL/Supabase database...');
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });

    // Test connection
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      logger.info('Connected to PostgreSQL successfully.');
    } finally {
      client.release();
    }
  } else {
    logger.info('Initializing embedded PostgreSQL engine (@electric-sql/pglite)...');
    const { PGlite } = await import('@electric-sql/pglite');
    
    // Store data in a persistent local directory or in-memory /tmp for serverless
    const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
    const dbDir = isServerless
      ? path.join(os.tmpdir(), 'cintel-pgdata')
      : path.resolve(__dirname, '../../pgdata');

    if (!fs.existsSync(dbDir)) {
      try {
        fs.mkdirSync(dbDir, { recursive: true });
      } catch (err: any) {
        logger.warn(`Could not create directory ${dbDir}, PGlite will initialize in memory: ${err.message}`);
      }
    }
    
    try {
      pgliteInstance = new PGlite(dbDir);
    } catch {
      // Fallback to pure in-memory if disk access fails
      pgliteInstance = new PGlite();
    }
    await pgliteInstance.waitReady;
    logger.info('Embedded PostgreSQL engine initialized successfully.');
  }

  const db = getDatabase();
  await runMigrations(db);
  return db;
}

export function getDatabase(): DatabaseClient {
  if (pool) {
    return {
      query: (text: string, params?: any[]) => pool!.query(text, params),
      getClient: () => pool!.connect(),
      isPGlite: false,
    };
  }

  if (pgliteInstance) {
    return {
      query: async (text: string, params?: any[]) => {
        // PGlite query takes (text, params)
        const res = await pgliteInstance.query(text, params);
        return {
          rows: res.rows || [],
          rowCount: res.affectedRows ?? res.rows?.length ?? 0,
        };
      },
      isPGlite: true,
    };
  }

  throw new Error('Database has not been initialized. Call initDatabase() first.');
}

function getMigrationSql(filePath: string, fallbackSql: string): string {
  if (fs.existsSync(filePath)) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch {
      return fallbackSql;
    }
  }
  return fallbackSql;
}

async function runMigrations(db: DatabaseClient) {
  try {
    logger.info('Checking and applying database migrations...');
    const migration1Path = path.resolve(__dirname, '../db/migrations/001_initial_schema.sql');
    const migration2Path = path.resolve(__dirname, '../db/migrations/002_rpc_booking_functions.sql');
    const migration3Path = path.resolve(__dirname, '../db/migrations/003_movie_rich_metadata.sql');
    const migration4Path = path.resolve(__dirname, '../db/migrations/004_booking_show_date.sql');

    const sql1 = getMigrationSql(migration1Path, MIGRATION_001_SQL);
    if (db.isPGlite && pgliteInstance) {
      await pgliteInstance.exec(sql1);
    } else {
      await db.query(sql1);
    }
    logger.info('Migration 001_initial_schema.sql applied.');

    const sql2 = getMigrationSql(migration2Path, MIGRATION_002_SQL);
    if (db.isPGlite && pgliteInstance) {
      await pgliteInstance.exec(sql2);
    } else {
      await db.query(sql2);
    }
    logger.info('Migration 002_rpc_booking_functions.sql applied.');

    const sql3 = getMigrationSql(migration3Path, MIGRATION_003_SQL);
    if (db.isPGlite && pgliteInstance) {
      await pgliteInstance.exec(sql3);
    } else {
      await db.query(sql3);
    }
    logger.info('Migration 003_movie_rich_metadata.sql applied.');

    const sql4 = getMigrationSql(migration4Path, MIGRATION_004_SQL);
    if (db.isPGlite && pgliteInstance) {
      await pgliteInstance.exec(sql4);
    } else {
      await db.query(sql4);
    }
    logger.info('Migration 004_booking_show_date.sql applied.');

    // Auto-seed if empty
    await autoSeedIfEmpty(db);
  } catch (err) {
    logger.error('Error running migrations:', err);
    throw err;
  }
}

async function autoSeedIfEmpty(db: DatabaseClient) {
  const check = await db.query('SELECT COUNT(*) as count FROM events');
  const count = parseInt(check.rows[0]?.count || '0', 10);
  if (count === 0) {
    logger.info('Database has no events. Running initial seed...');
    const { seedData } = await import('../db/seed');
    await seedData(db);
  } else {
    // Ensure headline movies use the exact user-provided high-res posters
    const posterUpdates = [
      { pattern: '%Hanuman Ansh%', url: '/posters/hanuman_ansh.png' },
      { pattern: '%Mirzapur%', url: '/posters/mirzapur.png' },
      { pattern: '%Resident Evil%', url: '/posters/resident_evil.png' },
      { pattern: '%Haiwaan%', url: '/posters/haiwaan.png' },
      { pattern: '%Avengers%', url: '/posters/avengers_endgame.jpg' },
      { pattern: '%Vibe%', url: '/posters/vibe.jpg' },
      { pattern: '%Daayra%', url: '/posters/daayra.png' },
      { pattern: '%Fall 2%', url: '/posters/fall_2.png' },
      { pattern: '%The Odyssey%', url: '/posters/the_odyssey.png' },
      { pattern: '%Spider-Man%', url: '/posters/spiderman.png' },
      { pattern: '%Neon Odyssey%', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80' },
    ];
    for (const p of posterUpdates) {
      await db.query(
        'UPDATE events SET cover_image_url = $1, backdrop_url = $1 WHERE title ILIKE $2',
        [p.url, p.pattern]
      );
    }
  }
}
