// instrumentation.ts — runs once in the Next.js server process on startup.
// Adds a global handler for unhandled errors/rejections so that transient
// socket errors from external scanners (ECONNRESET, EPIPE, ECONNABORTED)
// do not crash the process.

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.on('uncaughtException', (err: NodeJS.ErrnoException) => {
      const ignoredCodes = ['ECONNRESET', 'EPIPE', 'ECONNABORTED'];
      if (err.code && ignoredCodes.includes(err.code)) {
        console.warn(`[instrumentation] Suppressed transient socket error: ${err.code}`);
        return;
      }
      // Re-throw anything else so genuine bugs still surface
      console.error('[instrumentation] Uncaught exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('[instrumentation] Unhandled rejection:', reason);
    });
  }
}
