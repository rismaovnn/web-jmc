/** Read-only verification of a deployed Vercel website: npm run test:smoke -- https://your-domain */
const raw = process.argv[2] || process.env.SMOKE_BASE_URL;
if (!raw || !/^https?:\/\//.test(raw)) {
 console.error('Usage: npm run test:smoke -- https://YOUR-VERCEL-URL'); process.exit(2);
}
const base = raw.replace(/\/+$/, '');
let problems = 0;
async function check(p, expectedCode, expectedType, inspect) {
 try {
  const response = await fetch(base + p, {redirect:'manual',signal:AbortSignal.timeout(15000)});
  const type=response.headers.get('content-type')||'';
  const passed=response.status===expectedCode && type.includes(expectedType);
  const content=type.includes('application/json') ? await response.json() : await response.text();
  const valid=passed && (!inspect || inspect(content));
  console.log(`${valid?'PASS':'FAIL'} ${p} → ${response.status} ${type}`);
  if(!valid)problems++;
 }catch(e){console.error(`FAIL ${p}: ${e instanceof Error ? e.message : 'request failed'}`);problems++}
}
await check('/api/health',200,'application/json',data=>data?.status==='ok');
await check('/api/content',200,'application/json',data=>!!data?.hero && Array.isArray(data?.products));
await check('/api/does-not-exist',404,'application/json',data=>typeof data?.message==='string');
await check('/api/admin/session',401,'application/json',data=>data?.authenticated===false);
await check('/admin',200,'text/html');
await check('/about',200,'text/html');
await check('/product',200,'text/html');
await check('/contact',200,'text/html');
if(problems){console.error(`${problems} smoke tests failed. Check Vercel logs, env and Supabase schema.`);process.exitCode=1;}
else console.log('Smoke tests passed. Next verify login, save and upload manually in /admin.');
