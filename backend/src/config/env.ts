import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  JWT_SECRET: z.string().default('super_secret_jwt_key_cintel_showpass_2025_secure'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_SECRET: z.string().default('super_secret_refresh_jwt_key_cintel_showpass_2025'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  DATABASE_URL: z.string().optional().default(''),
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),

  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5001/api/auth/google/callback'),

  SANDSTONE_API_KEY: z.string().default('sandstone_live_key_99382173918237'),
  SANDSTONE_SECRET_KEY: z.string().default('sandstone_sec_884920481029481920'),
  SANDSTONE_MERCHANT_ID: z.string().default('MID_SANDSTONE_SHOWPASS_01'),
  SANDSTONE_WEBHOOK_SECRET: z.string().default('whsec_sandstone_83921094820194820'),
  SANDSTONE_GATEWAY_URL: z.string().default('https://api.sandstonepay.io/v1'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
