import { createApp } from './app';
import { initDatabase } from './config/database';

let isInitialized = false;
const app = createApp();

if (!isInitialized) {
  isInitialized = true;
  initDatabase().catch((err) => {
    console.error('Error initializing database in Express:', err);
  });
}

export default app;
