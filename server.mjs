import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml' };
const port = Number(process.env.PORT || 4173);
http.createServer(async (req,res) => {
  try {
    const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, `.${requestPath === '/' ? '/index.html' : requestPath}`);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
    const contents = await fs.readFile(file);
    res.setHeader('Content-Type',mime[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control',file.includes('/assets/atlases/')?'public, max-age=31536000, immutable':'no-cache');
    res.writeHead(200).end(contents);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port,'0.0.0.0',() => console.log(`Mascot demo: http://localhost:${port}`));
