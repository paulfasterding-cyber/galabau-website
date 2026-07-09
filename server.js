import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DIST = join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

createServer(async (req, res) => {
  let path = req.url.split('?')[0];
  if (path === '/') path = '/index.html';
  if (!extname(path)) path += '.html';

  try {
    const file = await readFile(join(DIST, path));
    res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'text/plain' });
    res.end(file);
  } catch {
    try {
      const file = await readFile(join(DIST, '404.html'));
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(file);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  }
}).listen(PORT, () => console.log(`Server running on port ${PORT}`));
