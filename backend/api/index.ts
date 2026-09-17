import { createApp } from '../src/app';
import { initDatabase } from '../src/config/database';

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
