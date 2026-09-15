/**
 * ecosystem.config.js — pm2 process definitions for Carbon GenAI Demo
 *
 * PORT CONFIGURATION
 * ------------------
 * Default ports are committed here (3000 / 3001 / 8080).
 * To override for a specific instance without touching this file, set
 * environment variables before starting pm2, e.g.:
 *
 *   LLAMA_PORT=8181 PROXY_PORT=3101 APP_PORT=3100 pm2 start ecosystem.config.js
 *
 * Or update a running instance in-place:
 *   pm2 restart genai-nextjs --update-env -- (PORT is read from process env)
 *
 * This keeps instance-specific port customisation out of git entirely.
 *
 * HARDENING
 * ---------
 * - max_restarts / restart_delay / exp_backoff_restart_delay: prevents rapid
 *   crash-loops from hammering the system (common with TechZone network resets)
 * - cron_restart: nightly clean restart at 03:00 server time; clears any
 *   accumulated memory and ensures a clean slate each morning
 * - max_memory_restart: safety net if the LLM server leaks memory overnight
 */

const llamaPort = process.env.LLAMA_PORT || '8080';
const proxyPort = process.env.PROXY_PORT || '3001';
const appPort   = process.env.APP_PORT   || '3000';

const llamaModel = process.env.LLAMA_MODEL
  || `${process.env.HOME}/models/granite-4.0-micro-Q4_K_M.gguf`;

module.exports = {
  apps: [
    // -------------------------------------------------------------------------
    // LLM Server (llama.cpp)
    // -------------------------------------------------------------------------
    {
      name: 'genai-llama',
      script: `${process.env.HOME}/llama.cpp/build/bin/llama-server`,
      args: `-m ${llamaModel} --host 0.0.0.0 --port ${llamaPort}`,
      cwd: `${process.env.HOME}/llama.cpp`,
      interpreter: 'none',

      // Restart policy
      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 200,

      // Nightly restart at 03:00 (server local time)
      cron_restart: '0 3 * * *',

      // Safety net — llama-server can grow large under sustained load
      max_memory_restart: '4G',

      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // -------------------------------------------------------------------------
    // Proxy Server (Node / Express)
    // -------------------------------------------------------------------------
    {
      name: 'genai-proxy',
      script: 'server_final.js',
      cwd: `${process.env.HOME}/Carbon-GenAI-Demos/carbon-ui/src/llama-proxy`,
      interpreter: 'node',

      env: {
        PORT: proxyPort,
        LLAMA_URL: `http://localhost:${llamaPort}`,
        PASSPORTEYE_URL: 'http://localhost:5000',
        NODE_ENV: 'production',
      },

      // Restart policy
      max_restarts: 20,
      restart_delay: 2000,
      exp_backoff_restart_delay: 100,

      cron_restart: '5 3 * * *',

      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // -------------------------------------------------------------------------
    // Next.js UI
    // Uses server.js (custom wrapper) instead of `yarn start` so that
    // ECONNRESET / EPIPE errors are caught and do not kill the process.
    // -------------------------------------------------------------------------
    {
      name: 'genai-nextjs',
      script: 'server.js',
      cwd: `${process.env.HOME}/Carbon-GenAI-Demos/carbon-ui`,
      interpreter: 'node',

      env: {
        PORT: appPort,
        NODE_ENV: 'production',
      },

      // Restart policy — more restarts allowed since ECONNRESET should no
      // longer cause crashes, but keep a limit as a safety net
      max_restarts: 20,
      restart_delay: 2000,
      exp_backoff_restart_delay: 100,

      // Nightly restart slightly after proxy (10 3 vs 5 3) to avoid race
      cron_restart: '10 3 * * *',

      max_memory_restart: '512M',

      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // -------------------------------------------------------------------------
    // PassportEye OCR Service (Python / Flask)
    // -------------------------------------------------------------------------
    {
      name: 'passporteye',
      script: 'deployment/passport_service.py',
      cwd: `${process.env.HOME}/Carbon-GenAI-Demos`,
      interpreter: `${process.env.HOME}/.passporteye-venv/bin/python3`,

      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 200,

      cron_restart: '15 3 * * *',

      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
