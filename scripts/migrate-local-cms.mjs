/** One-time migration from data/cms.json + data/uploads to Supabase.
 * From project root: node --env-file=.env scripts/migrate-local-cms.mjs
 * Refuses to overwrite existing CMS rows unless --force is supplied.
 */
import 'node:process';
import { readFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !serviceKey || !/^https:\/\//.test(url)) {
 console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Load .env with: node --env-file=.env scripts/migrate-local-cms.mjs');
 process.exit(1);
}
const sections=['hero','about','products','partners','leadership','contact','footer'];
const http = async (route, method, body, extra={}) => {
 const resp = await fetch(`${url}${route}`, {
  method, headers:{apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,Accept:'application/json',...extra},
  ...(body===undefined?{}:{body}), signal:AbortSignal.timeout(30000),
 });
 if (!resp.ok) { const msg=await resp.text(); throw Error(`Supabase ${method} ${route.split('?')[0]}: HTTP ${resp.status} (${msg.slice(0,180)})`); }
 const text=await resp.text(); return text?JSON.parse(text):undefined;
};
const original=JSON.parse(await readFile(resolve('data/cms.json'),'utf8'));
const rows=await http('/rest/v1/cms_sections?select=section&limit=1','GET');
if (rows.length && !process.argv.includes('--force')) {
 console.error('Supabase CMS already contains data. Migration stopped to prevent overwriting production edits.');
 console.error('Export/backup the database first. Only use --force if you INTENTIONALLY want to replace live content.');
 process.exit(1);
}
const memo=new Map();
async function convertImage(value){
 if(typeof value !== 'string' || !/^\/uploads\/[a-z0-9-]+\.webp$/i.test(value))return value;
 if(memo.has(value))return memo.get(value);
 const filename=basename(value);
 const buffer=await readFile(resolve('data/uploads',filename));
 // Keep the original basename in a dedicated legacy/ prefix for predictable migration.
 const key=`legacy/${filename}`;
 try {
  await http(`/storage/v1/object/cms-images/${key}`,'POST',buffer,{
   'Content-Type':'image/webp','x-upsert':'false',
  });
  console.log(`Uploaded: ${filename}`);
 } catch (err) {
  // 409 means it already exists from a previous partial run; reuse it.
  if(!String(err).includes('HTTP 409'))throw err;
  console.log(`Already exists: ${filename}`);
 }
 const publicUrl=`${url}/storage/v1/object/public/cms-images/${key}`;
 memo.set(value,publicUrl);
 return publicUrl;
}
if(original.hero)original.hero.image=await convertImage(original.hero.image);
for(const entry of original.products||[])entry.image=await convertImage(entry.image);
for(const entry of original.partners||[])entry.logo=await convertImage(entry.logo);
for(const entry of original.leadership||[])entry.photo=await convertImage(entry.photo);
const body=JSON.stringify(sections.filter(section=>section in original).map(section=>({section,value:original[section]})));
await http('/rest/v1/cms_sections?on_conflict=section','POST',body,{
 'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal',
});
console.log('Migration complete! Images:',memo.size,'Sections:',sections.filter(s=>s in original).length);
console.log('Now set CMS_STORAGE=supabase in local .env and SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in Vercel.');
