import { createApp } from './app';
import { env } from './config/env';
import { initDatabase, getDatabase } from './config/database';
import { logger } from './utils/logger';

const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const app = createApp();

async function startServer() {
  try {
    // 1. Initialize Database & Run Migrations
    await initDatabase();

    // 2. Start HTTP Server only in persistent server environments
    if (!isServerless) {
      const server = app.listen(env.PORT, () => {
        logger.info(`================================================`);
        logger.info(`🚀 ShowPass Server running on http://localhost:${env.PORT}`);
        logger.info(`💳 Sandstone Merchant: ${env.SANDSTONE_MERCHANT_ID}`);
        logger.info(`🛡️ Concurrency Lock: Database-Level RPC & Partial Unique Index Active`);
        logger.info(`================================================`);
      });

      // 3. Background Job: Cleanup expired seat holds every 30 seconds
      const cleanupInterval = setInterval(async () => {
        try {
          const db = getDatabase();
          const res = await db.query('SELECT release_expired_holds() as released');
          const released = parseInt(res.rows[0]?.released || '0', 10);
          if (released > 0) {
            logger.info(`[Cleanup] Released ${released} expired seat hold(s) back to available pool.`);
          }
        } catch (err: any) {
          logger.error('[Cleanup Job Error]:', err.message);
        }
      }, 30000);

      // Graceful Shutdown
      const shutdown = () => {
        logger.info('Stopping ShowPass server gracefully...');
        clearInterval(cleanupInterval);
        server.close(() => {
          logger.info('Server closed.');
          process.exit(0);
        });
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    }
  } catch (error) {
    logger.error('Fatal error during server startup:', error);
    if (!isServerless) {
      process.exit(1);
    }
  }
}

startServer();

export default app;
