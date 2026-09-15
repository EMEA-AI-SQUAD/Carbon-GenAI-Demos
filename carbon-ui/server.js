/**
 * server.js — Custom Next.js HTTP server
 *
 * Wraps the standard `next start` with an explicit Node.js HTTP server so we
 * can attach socket-level error handlers.  This prevents ECONNRESET / EPIPE
 * errors (common on TechZone Power VMs where the network layer aggressively
 * drops idle TCP connections) from propagating as unhandled 'error' events
 * and crashing the process.
 *
 * Usage (pm2):
 *   pm2 start server.js --name genai-nextjs --interpreter node
 *
 * Port is read from PORT env var, defaulting to 3000.
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Swallow ECONNRESET on the response socket — client dropped the connection
    res.on('error', (err) => {
      if (err.code === 'ECONNRESET' || err.code === 'EPIPE') {
        // Client disconnected mid-response — not an application error
        return;
      }
      console.error('[server] res error:', err);
    });

    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Swallow ECONNRESET / EPIPE at the server level too
  server.on('error', (err) => {
    if (err.code === 'ECONNRESET' || err.code === 'EPIPE') {
      return;
    }
    console.error('[server] server error:', err);
    process.exit(1); // only exit on genuine unexpected errors
  });

  // Catch any remaining unhandled rejections / exceptions — log and continue
  process.on('uncaughtException', (err) => {
    if (err.code === 'ECONNRESET' || err.code === 'EPIPE') {
      return;
    }
    console.error('[server] uncaughtException:', err);
    // Do not exit — let pm2 decide via max_memory_restart / cron_restart
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[server] unhandledRejection:', reason);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`✓ Next.js server listening on http://0.0.0.0:${port}`);
    console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  });
});
