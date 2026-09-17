import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist!');
  process.exit(1);
}

const indexHtmlPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.error('dist/index.html does not exist!');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Always ensure 404.html and 200.html exist for static hosting platforms
fs.writeFileSync(path.join(distDir, '404.html'), indexHtml);
fs.writeFileSync(path.join(distDir, '200.html'), indexHtml);

// Essential client-side SPA routes
const routes = [
  'events',
  'events/new',
  'login',
  'register',
  'checkout',
  'my-bookings',
  'profile',
  'dashboard',
  'confirmation',
  'oauth',
  'oauth/callback',
];

for (const route of routes) {
  const targetDir = path.join(distDir, route);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), indexHtml);

  // Write route.html for cleanUrls mapping (e.g. dist/events.html)
  if (!route.includes('/')) {
    fs.writeFileSync(path.join(distDir, `${route}.html`), indexHtml);
  }
}

console.log(`✅ Generated ${routes.length} static SPA route entry points (both directories and .html files) in frontend/dist/`);
