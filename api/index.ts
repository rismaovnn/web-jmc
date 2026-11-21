/**
 * Vercel Node.js Function for all /api/* routes.
 *
 * IMPORTANT: use a STATIC ESM import. A lazy dynamic import of
 * '../server/app' previously became an unresolved runtime path
 * (/var/task/server/app) and caused HTTP 500 before Express could start.
 *
 * A static import lets the Vercel builder discover and include the entire
 * Express dependency tree. The .js specifier matches emitted ESM output.
 */

import app from '../server/app.js';

export default app;
