/** Persistent Supabase CMS on Vercel; optional local file CMS in development. */
import { Router, type Request, type Response, type NextFunction } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import express from 'express';
import sharp from 'sharp';
import sanitizeHtml from 'sanitize-html';
import { defaultContent } from '../src/cms/defaultContent.js';
import type { CMSContent, SectionKey } from '../src/cms/schema.js';
import { useSupabase, getSections, putSection, getSession, putSession, deleteSession, uploadCmsImage, publicCmsImageUrl, getLoginFailures, recordLoginFailure, clearLoginFailures } from './supabase.js';

export const dataDir = path.resolve(process.env.CMS_DATA_DIR || path.join(process.cwd(), 'data'));
const imageDir = path.join(dataDir, 'uploads');
const contentFile = path.join(dataDir, 'cms.json');
// Existing /uploads paths are served locally or redirected to their migrated Supabase legacy objects.
export const uploadsRouter = Router();
if (!useSupabase) uploadsRouter.use(express.static(imageDir, { index:false, immutable:true, maxAge:'30d', dotfiles:'deny', fallthrough:true }));
if (useSupabase) uploadsRouter.get('/:filename', (req, res) => {
 const file=req.params.filename;
 if (!/^[a-f0-9-]{36}\.webp$/i.test(file)) {res.status(404).json({message:'Image not found.'});return;}
 res.redirect(302, publicCmsImageUrl(`legacy/${file}`));
});
uploadsRouter.use((_req, res) => res.status(404).json({message:'Image not found.'}));
const admin = Router();
const sessions = new Map<string,{csrf:string;expires:number}>();
const loginAttempts = new Map<string,{count:number;reset:number}>(); // local mode only
const sessionDuration = 12*60*60*1000;
const sections:SectionKey[]=['hero','about','products','partners','leadership','contact','footer'];
const validSectionValue=(key:SectionKey,v:unknown)=>['products','partners','leadership'].includes(key) ? Array.isArray(v) : !!v && typeof v==='object' && !Array.isArray(v);
const cleanText=(v:unknown,max=1500)=>typeof v==='string'?v.trim().slice(0,max):'';
const url=(v:unknown, allowInternal=false)=>{
 if(typeof v!=='string'||!v.trim())return '';
 const value=v.trim().slice(0,2000);
 if(allowInternal && /^\/(?!\/)[a-zA-Z0-9_./%?=&-]*$/.test(value) && !value.includes('..'))return value;
 try { const parsed=new URL(value); return (parsed.protocol==='https:' || parsed.protocol==='http:')?parsed.href:''; } catch { return ''; }
};
const html=(v:unknown)=>sanitizeHtml(cleanText(v,10000),{
 allowedTags:['p','br','strong','b','em','i','ul','ol','li','a','h3','h4','blockquote'],
 allowedAttributes:{a:['href','target','rel']},allowedSchemes:['https','http','mailto'],transformTags:{a:(_tag,attrs)=>({tagName:'a',attribs:{href:attrs.href||'',target:'_blank',rel:'noopener noreferrer'}})},
});
const safeId=(v:unknown)=>typeof v==='string'&&/^[a-z0-9][a-z0-9-]{0,75}$/.test(v)?v:crypto.randomUUID();
const list=(v:unknown,max=60)=>Array.isArray(v)?v.slice(0,max):[];
const normalize = (section:SectionKey, v:unknown): CMSContent[SectionKey] => {
 const o=v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
 if(section==='hero')return {
  eyebrow:cleanText(o.eyebrow,100),headline:cleanText(o.headline,100),tagline:cleanText(o.tagline,180),description:cleanText(o.description,2000),
  primaryLabel:cleanText(o.primaryLabel,80),primaryHref:url(o.primaryHref,true),secondaryLabel:cleanText(o.secondaryLabel,80),secondaryHref:url(o.secondaryHref,true),image:url(o.image,true)
 } as CMSContent['hero'];
 if(section==='about')return {description:html(o.description),vision:html(o.vision),mission:html(o.mission)} as CMSContent['about'];
 if(section==='products')return list(v).map((item,i)=>{
  const p=item&&typeof item==='object'?item as Record<string,unknown>:{};
  return {id:safeId(p.id),title:cleanText(p.title,150),subtitle:cleanText(p.subtitle,200),category:cleanText(p.category,80),description:html(p.description),image:url(p.image,true),link:url(p.link),technologies:list(p.technologies,20).map(x=>cleanText(x,60)).filter(Boolean),order:i};
 }) as CMSContent['products'];
 if(section==='partners')return list(v).map((item,i)=>{
  const p=item&&typeof item==='object'?item as Record<string,unknown>:{};
  return {id:safeId(p.id),name:cleanText(p.name,150),logo:url(p.logo,true),category:cleanText(p.category,80),website:url(p.website),order:i};
 }) as CMSContent['partners'];
 if(section==='leadership')return list(v).map((item,i)=>{
  const p=item&&typeof item==='object'?item as Record<string,unknown>:{};
  return {id:safeId(p.id),name:cleanText(p.name,150),role:cleanText(p.role,120),bio:html(p.bio),photo:url(p.photo,true),group:['board','ceo','management'].includes(String(p.group))?p.group:'management',order:i};
 }) as CMSContent['leadership'];
 if(section==='contact')return {email:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(o.email,254))?cleanText(o.email,254):defaultContent.contact.email,phone:cleanText(o.phone,50),address:cleanText(o.address,600),mapsUrl:url(o.mapsUrl),instagram:url(o.instagram),linkedin:url(o.linkedin),website:url(o.website)} as CMSContent['contact'];
 return {description:html(o.description),copyright:cleanText(o.copyright,240),tagline:cleanText(o.tagline,120),socialLinks:list(o.socialLinks,15).map(item=>{
  const p=item&&typeof item==='object'?item as Record<string,unknown>:{};
  return {label:cleanText(p.label,60),url:url(p.url)};
 })} as CMSContent['footer'];
};
/** On the first launch, respect JPEG/PNG and live-link edits made in earlier versions. */
async function migrateLegacyManifests(content:CMSContent){
 const folder=path.join(process.cwd(),'public','images','projects');
 try {
  const manifest=JSON.parse(await fs.readFile(path.join(folder,'project-images.json'),'utf8')) as Record<string,unknown>;
  for(const product of content.products){
   const file=manifest[product.id];
   if(typeof file!=='string' || !/^[a-z0-9][a-z0-9 _().-]*\.(?:jpe?g|png|webp|avif|gif|svg)$/i.test(file) || file.includes('..'))continue;
   try{await fs.access(path.join(folder,file));product.image=`/images/projects/${encodeURIComponent(file)}`;}catch{/* keep built-in SVG */}
  }
 }catch{/* no legacy image manifest */}
 try {
  const links=JSON.parse(await fs.readFile(path.join(folder,'project-links.json'),'utf8')) as Record<string,unknown>;
  for(const product of content.products)if(Object.prototype.hasOwnProperty.call(links,product.id))product.link=url(links[product.id]);
 }catch{/* no legacy project links */}
}
let cache:CMSContent|null=null;
export async function readContent():Promise<CMSContent> {
 if(useSupabase) {
  // No process cache: every Vercel instance reads the same permanent database.
  const rows=await getSections();
  const content=structuredClone(defaultContent);
  for(const row of rows) if(sections.includes(row.section)) (content as any)[row.section]=normalize(row.section,row.value);
  return content;
 }
 if(cache)return cache;
 await fs.mkdir(dataDir,{recursive:true});
 try {
  const parsed=JSON.parse(await fs.readFile(contentFile,'utf8')) as CMSContent;
  const data={...defaultContent};
  for(const s of sections) if(Object.prototype.hasOwnProperty.call(parsed,s)) (data as any)[s]=normalize(s,parsed[s]);
  cache=data;return data;
 } catch(err) {
  if((err as NodeJS.ErrnoException).code!=='ENOENT') console.warn('CMS content unreadable; using defaults. Preserve data/cms.json for recovery.');
  cache=structuredClone(defaultContent);
  if((err as NodeJS.ErrnoException).code==='ENOENT'){await migrateLegacyManifests(cache);await atomicWrite(cache);}
  return cache;
 }
}
async function atomicWrite(value:CMSContent){
 await fs.mkdir(dataDir,{recursive:true});
 const temp=path.join(dataDir,`.cms-${crypto.randomUUID()}.tmp`);
 try {await fs.writeFile(temp,JSON.stringify(value,null,2)+'\n',{mode:0o600});await fs.rename(temp,contentFile);}finally {await fs.rm(temp,{force:true}).catch(()=>{});}
}
let writeQueue=Promise.resolve();
function updateSection(key:SectionKey,payload:unknown){
 if(useSupabase) {
  const value=normalize(key,payload);
  // Sections live in separate rows: concurrent edits to distinct sections do not overwrite each other.
  return putSection(key,value).then(()=>value);
 }
 const operation=writeQueue.then(async()=>{
  const current=await readContent();
  const updated={...current,[key]:normalize(key,payload)} as CMSContent;
  await atomicWrite(updated);cache=updated;
  return updated[key];
 });
 writeQueue=operation.then(()=>undefined,()=>undefined);
 return operation;
}
function parseCookies(req:Request){return Object.fromEntries((req.headers.cookie||'').split(';').map(part=>{const i=part.indexOf('=');return i<0?['','']:[part.slice(0,i).trim(),part.slice(i+1).trim()]}));}
async function currentSession(req:Request){
 const raw=parseCookies(req).jmc_cms_sid;
 if(!raw || !/^[a-f0-9]{64}$/.test(raw))return null;
 if(useSupabase){
  const row=await getSession(crypto.createHash('sha256').update(raw).digest('hex'));
  return row && Date.parse(row.expires_at)>Date.now()?{csrf:row.csrf,expires:Date.parse(row.expires_at)}:null;
 }
 const session=sessions.get(raw);
 if(!session)return null;
 if(session.expires<Date.now()){sessions.delete(raw);return null}
 return session;
}
async function requireSession(req:Request,res:Response,next:NextFunction){
 try {
  const sess=await currentSession(req);
  if(!sess){res.status(401).json({message:'Please sign in.'});return;}
  res.locals.session=sess;next();
 }catch(err){next(err)}
}
function sameOrigin(req:Request,res:Response,next:NextFunction){
 const origin=req.get('origin');const expected=process.env.PUBLIC_ORIGIN?.replace(/\/$/,'')||`${process.env.VERCEL==='1'?'https':req.protocol}://${req.get('host')}`;
 if((origin && origin!==expected)||req.get('sec-fetch-site')==='cross-site'){res.status(403).json({message:'Cross-site requests are blocked.'});return;}next();
}
function csrf(req:Request,res:Response,next:NextFunction){
 const token=req.get('x-cms-csrf')||'';
 const sess=res.locals.session as {csrf:string};
 const left=Buffer.from(token);const right=Buffer.from(sess.csrf);
 if(left.length!==right.length||!crypto.timingSafeEqual(left,right)){res.status(403).json({message:'CSRF token invalid. Refresh the admin dashboard.'});return;}
 next();
}
function verifyPassword(pass:string){
 const stored=process.env.CMS_ADMIN_PASSWORD_HASH||'';
 const match=/^scrypt\$([a-f0-9]{32})\$([a-f0-9]{128})$/.exec(stored);
 if(!match)return false;
 const actual=crypto.scryptSync(pass,Buffer.from(match[1],'hex'),64,{N:16384,r:8,p:1});
 const expected=Buffer.from(match[2],'hex');return crypto.timingSafeEqual(actual,expected);
}
const noStore=(_req:Request,res:Response,next:NextFunction)=>{res.setHeader('Cache-Control','no-store');next();};
function cookie(req:Request,value:string,maxAge:number){
 const secure = process.env.VERCEL==='1' || req.secure ? '; Secure' : '';
 return `jmc_cms_sid=${value}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${maxAge}${secure}`;
}
admin.use(noStore);
admin.get('/session',async(req,res,next)=>{try{const sess=await currentSession(req);if(!sess){res.status(401).json({authenticated:false});return;}res.json({authenticated:true,csrfToken:sess.csrf});}catch(err){next(err)}});
admin.post('/login',sameOrigin,async(req,res,next)=>{
 try {
  if(!process.env.CMS_ADMIN_PASSWORD_HASH){res.status(503).json({message:'CMS password hash missing in Vercel Environment Variables. Run npm run cms:setup.'});return;}
  const key=crypto.createHmac('sha256',process.env.CMS_ADMIN_PASSWORD_HASH||'local').update(req.ip||'unknown').digest('hex');
  const now=Date.now();
  const local=loginAttempts.get(key);
  const failures=useSupabase?await getLoginFailures(key):(local&&local.reset>now?local.count:0);
  if(failures>=8){res.setHeader('Retry-After','900');res.status(429).json({message:'Too many login attempts. Try again in 15 minutes.'});return;}
  const password=typeof req.body?.password==='string'?req.body.password:'';
  if(!password || password.length>1024 || !verifyPassword(password)){
   if(useSupabase)await recordLoginFailure(key);
   else loginAttempts.set(key,{count:failures+1,reset:now+15*60_000});
   res.status(401).json({message:'Incorrect password.'});return;
  }
  const sid=crypto.randomBytes(32).toString('hex');
  const session={csrf:crypto.randomBytes(32).toString('hex'),expires:now+sessionDuration};
  if(useSupabase){await putSession(crypto.createHash('sha256').update(sid).digest('hex'),session.csrf,new Date(session.expires).toISOString());await clearLoginFailures(key);}
  else{sessions.set(sid,session);loginAttempts.delete(key);}
  res.setHeader('Set-Cookie',cookie(req,sid,sessionDuration/1000));
  res.status(200).json({authenticated:true,csrfToken:session.csrf});
 }catch(err){next(err)}
});
admin.post('/logout',sameOrigin,requireSession,csrf,async(req,res,next)=>{
 try {
  const sid=parseCookies(req).jmc_cms_sid;
  if(useSupabase) await deleteSession(crypto.createHash('sha256').update(sid).digest('hex'));
  else sessions.delete(sid);
  res.setHeader('Set-Cookie',cookie(req,'',0));res.json({success:true});
 }catch(err){next(err)}
});
admin.put('/content/:section',sameOrigin,requireSession,csrf,async(req,res)=>{
 const section=req.params.section as SectionKey;
 if(!sections.includes(section)){res.status(404).json({message:'Unknown section.'});return;}
 if(!req.body||typeof req.body!=='object'||Array.isArray(req.body)||!validSectionValue(section,req.body.value)){res.status(400).json({message:'Invalid content section or value.'});return;}
 try {const result=await updateSection(section,req.body.value);res.json({saved:true,value:result});}catch(err){console.error('CMS save failed:',(err as Error).message);res.status(503).json({message:'Unable to save CMS data. Check Supabase configuration/table and function logs.'});}
});
admin.post('/upload',sameOrigin,requireSession,csrf,express.raw({type:['image/png','image/jpeg','image/webp','image/avif'],limit:'4mb'}),async(req,res)=>{
 const body=req.body;
 if(!Buffer.isBuffer(body)||!body.length){res.status(400).json({message:'Choose a JPG, PNG, WebP, or AVIF image below 4 MB (browser auto-compresses larger images).'});return;}
 try {
  const processed=await sharp(body,{limitInputPixels:30_000_000,failOn:'error'}).rotate().resize({width:1920,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:82,effort:4}).toBuffer();
  const id=crypto.randomUUID();
  if(useSupabase){
   try {
    const imageUrl=await uploadCmsImage(`${id}.webp`,processed);
    res.status(201).json({url:imageUrl,bytes:processed.length});
   }catch(err){console.error('CMS image storage failed:',(err as Error).message);res.status(503).json({message:'Unable to save image in Supabase Storage.'});}
  }else{
   await fs.mkdir(imageDir,{recursive:true});await fs.writeFile(path.join(imageDir,`${id}.webp`),processed,{flag:'wx',mode:0o644});
   res.status(201).json({url:`/uploads/${id}.webp`,bytes:processed.length});
  }
 }catch{res.status(415).json({message:'Image could not be processed. Upload a valid image file.'});}
});
export const cmsRouter=admin;
export async function cmsPublic(_req:Request,res:Response){
 try {res.json(await readContent());}
 catch(err){console.error('CMS content read failed:',err instanceof Error?err.message:'unknown');res.status(503).json({message:'CMS content unavailable. Check Supabase environment and schema.'});}
}
setInterval(()=>{const now=Date.now();for(const [key,v] of sessions)if(v.expires<=now)sessions.delete(key);for(const [key,v] of loginAttempts)if(v.reset<=now)loginAttempts.delete(key);},15*60*1000).unref();
