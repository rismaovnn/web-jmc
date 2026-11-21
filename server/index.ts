/** Local-only Express + Vite launcher. Vercel uses api/index.ts -> server/app.ts. */
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './app.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||3000);
if (process.env.NODE_ENV === 'production') {
 app.use(express.static(path.join(root,'dist'),{index:false,maxAge:'1h'}));
 app.get(/.*/,(_req,res)=>res.sendFile(path.join(root,'dist','index.html')));
} else {
 const {createServer}=await import('vite');
 const vite=await createServer({root,configFile:path.join(root,'vite.config.ts'),server:{middlewareMode:true},appType:'spa'});
 app.use(vite.middlewares);
}
app.listen(port,'0.0.0.0',()=>{
 console.log(`JuaraMetaCorp website & contact API: http://localhost:${port}`);
 if (!process.env.SMTP_APP_PASSWORD || !process.env.SMTP_USER) console.warn('SMTP is not configured; set SMTP_USER and SMTP_APP_PASSWORD in .env.');
});
