/** JuaraMetaCorp — server-owned inquiry API. Secrets never enter the Vite client bundle. */
import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import nodemailer from 'nodemailer';
import { validateInquiry } from './validation';
import { cmsRouter, cmsPublic, uploadsRouter, readContent } from './cms';

const app = express();
const defaultDestination = 'juarametacorp@gmail.com';
// Configure TRUST_PROXY_HOPS (typically 1) only when deployed behind a trusted proxy.
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 0));
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
app.use('/api', express.json({ limit: '256kb', type: 'application/json' }));
// CMS APIs and persisted uploads run before the SPA/Vite fallback.
app.get('/api/content', cmsPublic);
app.use('/api/admin', cmsRouter);
app.use('/uploads', uploadsRouter);

// Lightweight per-IP protection. In multi-instance production use a shared rate-limit store.
const requestsByIp = new Map<string, { count: number; resetAt: number }>();
const intervalMs = 15 * 60_000;
const allowedAttempts = 5;
function rateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = req.ip || 'unknown';
  let entry = requestsByIp.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + intervalMs };
    requestsByIp.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > allowedAttempts) {
    res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    res.status(429).json({ message: 'Too many inquiries. Please try again later.' });
    return;
  }
  next();
}
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestsByIp) if (now > value.resetAt) requestsByIp.delete(key);
}, intervalMs).unref();

app.post('/api/inquiries', rateLimit, async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  // A browser-site-only endpoint: reject cross-site submission and non-JSON posts.
  const origin = req.get('Origin');
  const expectedOrigin = process.env.PUBLIC_ORIGIN?.replace(/\/$/, '');
  if (expectedOrigin && origin && origin !== expectedOrigin) {
    res.status(403).json({ message: 'Origin not allowed.' });
    return;
  }
  if (!req.is('application/json')) {
    res.status(415).json({ message: 'Please submit the form as JSON.' });
    return;
  }
  // Hidden honeypot input: bots get an inconspicuous OK without sending email.
  if (req.body && typeof req.body.website === 'string' && req.body.website.trim()) {
    res.status(200).json({ message: 'Your message was sent successfully.' });
    return;
  }
  const inquiry = validateInquiry(req.body);
  if (!inquiry) {
    res.status(400).json({ message: 'Please enter a valid name, email, project type, and project details (20–5000 characters).' });
    return;
  }
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, '');
  if (!smtpUser || !smtpPassword) {
    res.status(503).json({ message: 'Email service is not configured yet. Please try again later.' });
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpPassword },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    await transporter.sendMail({
      from: { name: 'JuaraMetaCorp Website', address: smtpUser },
      to: (await readContent()).contact.email || defaultDestination,
      replyTo: { name: inquiry.name, address: inquiry.email },
      subject: `New Project Inquiry – ${inquiry.projectType}`,
      text: [
        `Name: ${inquiry.name}`,
        `Email: ${inquiry.email}`,
        `Project Type: ${inquiry.projectType}`,
        'Project Details:',
        inquiry.details,
      ].join('\n'),
    });
    res.status(200).json({ message: 'Your project inquiry has been sent successfully. We will be in touch soon.' });
  } catch (error) {
    // Log only the SMTP error class/code; never log secrets or inquiry PII.
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'UNKNOWN';
    console.error('Inquiry mail delivery failed:', code);
    res.status(502).json({ message: 'We could not send your message. Please try again later or email us directly.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found.' }));

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof SyntaxError || (typeof error === 'object' && error !== null && 'type' in error)) {
    res.status(400).json({ message: 'Invalid or oversized request body.' });
    return;
  }
  console.error('Unexpected server error');
  res.status(500).json({ message: 'An unexpected error occurred.' });
});

export default app;
