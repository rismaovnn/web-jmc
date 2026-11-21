/** Check that the Vercel entrypoint and backend relative imports are Node-ESM safe. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'api/index.ts',
  'server/app.ts',
  'server/cms.ts',
  'server/supabase.ts',
  'server/index.ts',
  'src/cms/defaultContent.ts',
];
const failures = [];
for (const file of files) {
  const full = path.join(root, file);
  const code = fs.readFileSync(full, 'utf8');
  // Check relative import specifiers (both static imports and type-only imports).
  const matches = code.matchAll(/(?:\bfrom\s*|\bimport\s*\(|\bimport\s*)(['"])(\.{1,2}\/[^'"\n]+)\1/g);
  for (const match of matches) {
    const specifier = match[2];
    const ext = path.extname(specifier);
    if (ext !== '.js') {
      failures.push(`${file}: relative ESM specifier ${specifier} must end in .js`);
      continue;
    }
    const source = path.resolve(path.dirname(full), specifier.replace(/\.js$/, '.ts'));
    const jsSource = path.resolve(path.dirname(full), specifier);
    if (!fs.existsSync(source) && !fs.existsSync(jsSource)) {
      failures.push(`${file}: ${specifier} has no matching .ts or .js source`);
    }
  }
}
const entry = fs.readFileSync(path.join(root, 'api/index.ts'), 'utf8');
if (!/import\s+app\s+from\s+['"]\.\.\/server\/app\.js['"]/.test(entry)) {
  failures.push('api/index.ts must statically import ../server/app.js');
}
if (/await\s+import\s*\(\s*['"]\.\.\/server\/app/.test(entry)) {
  failures.push('api/index.ts must not dynamically import Express');
}
const app = fs.readFileSync(path.join(root, 'server/app.ts'), 'utf8');
if (!app.includes("app.get('/api/ping'")) failures.push('server/app.ts must expose /api/ping');
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
if (vercel.framework !== 'vite' || vercel.outputDirectory !== 'dist') {
  failures.push('vercel.json must target Vite and dist');
}
const rewrites = vercel.rewrites || [];
const apiRewrite = rewrites.findIndex(r => r.source === '/api/:path*' && r.destination === '/api/index');
const spaRewrite = rewrites.findIndex(r => r.source === '/(.*)' && r.destination === '/index.html');
if (apiRewrite < 0 || spaRewrite < 0 || apiRewrite >= spaRewrite) {
  failures.push('Vercel API rewrite must precede SPA fallback');
}
if (failures.length) {
  console.error('FAILED ESM/deployment checks:\n' + failures.map(x => ` - ${x}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS: ESM imports (${files.length} files), static Vercel API entry, /api/ping and SPA routing`);
}
