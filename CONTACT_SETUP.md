# JuaraMetaCorp — Secure Contact Form Setup

## What was implemented

- Contact form `POST /api/inquiries` → Express server → Nodemailer → Gmail SMTP over TLS (port 465).
- Recipient **juarametacorp@gmail.com**, fixed on the backend; name/email/project type/details sent as plain text.
- User-provided email is set as `replyTo`, not used as the sending account.
- Client and server input validation, 30-second client timeout, loading + success/error feedback.
- Server-side input length limits, project-type allowlist, honeypot, per-IP rate limit (5 requests / 15 minutes), JSON size limit, fixed recipient and origin restriction option.
- No sensitive environment variables use the `VITE_` prefix and no SMTP secret is sent to browsers.

## Install and run locally

**Requirements**: Node.js 22+, npm, and a Google Account with an App Password.

1. Run `npm install` from the `WEB` directory.
2. Copy `.env.example` to `.env`. Set:
   ```env
   SMTP_USER=juarametacorp@gmail.com
   SMTP_APP_PASSWORD=your_16_character_google_app_password
   PORT=3000
   ```
3. Open Google Account → Security → 2-Step Verification, then create an **App Password** (not the regular Gmail password). Paste it only into your local/server `.env` secret store. Your account must allow App Passwords.
4. Run `npm run dev` and browse to `http://localhost:3000/contact`.
5. Send a test inquiry. Check the JuaraMetaCorp inbox and spam folder. The form shows a success notification only when SMTP accepted the email.

**Never** commit `.env`, paste a password into chat, or configure `VITE_SMTP_*` variables. `.env` is excluded by `.gitignore`.

## Production

1. `npm install`
2. `npm run build`
3. Set `NODE_ENV=production` (handled by `npm start`) and inject `SMTP_USER`, `SMTP_APP_PASSWORD`, `PORT`, optional `PUBLIC_ORIGIN=https://your-domain.com`, and optional `TRUST_PROXY_HOPS=1` when behind a **trusted** single reverse proxy.
4. `npm start` runs **both** the built site and the email API on one Node/Express process.
5. Deploy to a Node-capable host (VPS, Render, Railway, Fly.io, etc.), not static-only hosting. Ensure outbound access to `smtp.gmail.com:465` and persistent process support. For scale-out deployments replace the in-memory rate limit with Redis/shared storage and consider CAPTCHA.
6. Serve the site over HTTPS using a trusted proxy; never terminate TLS inside a static host without an API backend.

## API contract

`POST /api/inquiries` with `Content-Type: application/json`:

```json
{
  "name": "A Client",
  "email": "client@example.com",
  "projectType": "Virtual Tour / 360",
  "details": "We want an interactive tour of our campus and facilities.",
  "website": ""
}
```

Successful response: HTTP 200 `{ "message": "Your project inquiry has been sent successfully. We will be in touch soon." }`.

Bad input: HTTP 400. Flooding: 429. Missing credentials: 503. SMTP error: 502.

Email subject: `New Project Inquiry – Virtual Tour / 360`.

Email text:
```
Name: A Client
Email: client@example.com
Project Type: Virtual Tour / 360
Project Details:
We want an interactive tour of our campus and facilities.
```

## Diagnostics

- If the form responds 503, the server lacks `SMTP_USER` or `SMTP_APP_PASSWORD`.
- If it responds 502, verify the Gmail App Password, 2-Step Verification, SMTP port access, and Google account restrictions.
- Run `npm run test:api` for validation unit tests.
- The included `preview.html` is a **static visual preview only**. It does not run email APIs. Use `npm run dev` or `npm start` for the functional form.

References: https://nodemailer.com/guides/using-gmail and https://support.google.com/accounts/answer/185833
