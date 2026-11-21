/** Express API shared between local Node and the Vercel Node.js Function. */
import 'dotenv/config';
import express, { type ErrorRequestHandler, type NextFunction, type Request, type Response } from 'express';
import nodemailer from 'nodemailer';
import { validateInquiry } from './validation.js';
import { cmsRouter, cmsPublic, uploadsRouter, readContent } from './cms.js';
import { getSections, useSupabase, validateSupabaseConfig } from './supabase.js';

const app = express();
const defaultDestination = 'juarametacorp@gmail.com';
// Vercel supplies the trusted edge proxy. On other infrastructure, default to zero.
app.set('trust proxy', process.env.VERCEL === '1' ? 1 : Number(process.env.TRUST_PROXY_HOPS || 0));
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
// No wildcard CORS: frontend & CMS use the same Vercel origin.
app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
app.use('/api', express.json({ limit: '256kb', type: 'application/json' }));
app.get('/api/content', cmsPublic);
app.use('/api/admin', cmsRouter);
app.use('/uploads', uploadsRouter);

// Per-instance inquiry limiter, supplemental to spam honeypot; for high volume use a shared store.
const attempts = new Map<string, { count: number; resetAt: number }>();
function inquiryLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const ip = req.ip || 'unknown';
  const item = attempts.get(ip);
  const current = !item || item.resetAt < now ? {count: 0, resetAt: now + 15 * 60_000} : item;
  if (current.count >= 5) {
    res.setHeader('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)));
    res.status(429).json({ message: 'Too many inquiries. Please try again later.' }); return;
  }
  current.count++; attempts.set(ip, current); next();
}
const inquiryCleanup = setInterval(() => {
  for (const [ip, value] of attempts) if (value.resetAt < Date.now()) attempts.delete(ip);
}, 15 * 60_000);
inquiryCleanup.unref();

app.post('/api/inquiries', inquiryLimit, async (req: Request, res: Response) => {
  const origin = req.get('Origin');
  const expected = process.env.PUBLIC_ORIGIN?.trim().replace(/\/$/, '') || `https://${req.get('host')}`;
  if ((origin && origin !== expected) || req.get('sec-fetch-site') === 'cross-site') {
    res.status(403).json({ message: 'Origin not allowed.' }); return;
  }
  if (!req.is('application/json')) {
    res.status(415).json({ message: 'Please submit the form as JSON.' }); return;
  }
  if (req.body && typeof req.body.website === 'string' && req.body.website.trim()) {
    res.json({ message: 'Your message was sent successfully.' }); return;
  }
  const inquiry = validateInquiry(req.body);
  if (!inquiry) {
    res.status(400).json({ message: 'Please enter a valid name, email, project type, and project details (20–5000 characters).' }); return;
  }
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, '');
  if (!smtpUser || !smtpPassword) {
    res.status(503).json({ message: 'Email service is not configured. Please contact us directly.' }); return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: smtpUser, pass: smtpPassword },
      connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000,
      disableFileAccess: true, disableUrlAccess: true,
    });
    await transporter.sendMail({
      from: { name: 'JuaraMetaCorp Website', address: smtpUser },
      to: (await readContent()).contact.email || defaultDestination,
      replyTo: { name: inquiry.name, address: inquiry.email },
      subject: `New Project Inquiry – ${inquiry.projectType}`,
      text: [
        `Name: ${inquiry.name}`, `Email: ${inquiry.email}`,
        `Project Type: ${inquiry.projectType}`, 'Project Details:', inquiry.details,
      ].join('\n'),
    });
    res.status(200).json({ message: 'Your project inquiry has been sent successfully. We will be in touch soon.' });
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'UNKNOWN';
    console.error('Inquiry delivery failed:', code);
    res.status(502).json({ message: 'We could not send your message. Please try again later or email us directly.' });
  }
});

// Liveness check: does not require Supabase or CMS credentials.
app.get('/api/ping', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'juarametacorp-api' });
});

app.get('/api/health', async (_req, res) => {
  try {
    if (useSupabase) { validateSupabaseConfig(); await getSections(); }
    if (!process.env.CMS_ADMIN_PASSWORD_HASH) throw new Error('CMS_ADMIN_PASSWORD_HASH missing.');
    res.json({ status: 'ok', storage: useSupabase ? 'supabase' : 'local' });
  } catch (error) {
    console.error('API readiness failed:', error instanceof Error ? error.message : 'Unknown error');
    res.status(503).json({ status: 'error', message: 'CMS storage unavailable. Check server environment and Supabase schema.' });
  }
});

// API never falls through into Vite or a browser HTML error page.
app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found.' }));
const apiErrorHandler: ErrorRequestHandler = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) return _next(error);
  const e = error as { type?: string; status?: number; message?: string } | null;
  const isBodyError = !!e && (
    e.type === 'entity.parse.failed' || e.type === 'entity.too.large' || e.type === 'encoding.unsupported'
  );
  const status = isBodyError ? (e?.type === 'entity.too.large' ? 413 : 400) : 500;
  if (status === 500) console.error('API unhandled error:', req.method, req.path, error instanceof Error ? error.message : 'unknown');
  res.status(status).json({ message: status === 413 ? 'Request body too large.' : status === 400 ? 'Invalid JSON request body.' : 'An unexpected server error occurred.' });
};
app.use(apiErrorHandler);
export default app;
