import { createApp } from '../backend/src/app';
import { initDatabase } from '../backend/src/config/database';

let isInitialized = false;
let app: any = null;

export default async function handler(req: any, res: any) {
  if (!isInitialized) {
    await initDatabase();
    app = createApp();
    isInitialized = true;
  }
  return app(req, res);
}
