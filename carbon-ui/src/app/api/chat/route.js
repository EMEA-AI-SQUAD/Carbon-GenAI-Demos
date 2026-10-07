import { NextResponse } from 'next/server';
import http from 'http';
import https from 'https';

/**
 * /api/chat — unified LLM proxy for the TechXChange Lab 1127 demo.
 *
 * Accepts the standard OpenAI-compatible chat completions body, plus one
 * extra field: { useSpyre: boolean }  (stripped before forwarding).
 *
 * useSpyre = false  →  local llama.cpp at LLAMA_URL  (default: http://localhost:8080)
 * useSpyre = true   →  IBM Spyre endpoint at SPYRE_URL (default: http://9.8.70.146:8080)
 *
 * Both endpoints expose the llama.cpp / OpenAI-compatible API, so the
 * forwarded payload is identical — only the target URL changes.
 *
 * Environment variables (set in pm2 ecosystem or shell before start):
 *   LLAMA_URL    llama.cpp base URL  (default: http://localhost:8080)
 *   SPYRE_URL    Spyre base URL      (default: http://9.8.70.146:8080)
 */

const LLAMA_URL = process.env.LLAMA_URL || 'http://localhost:8080';
const SPYRE_URL = process.env.SPYRE_URL || 'http://9.8.70.146:8001';

function nodeRequest(baseUrl, path, body) {
  return new Promise((resolve, reject) => {
    const url     = new URL(baseUrl);
    const isHttps = url.protocol === 'https:';
    const lib     = isHttps ? https : http;
    const payload = JSON.stringify(body);

    const options = {
      hostname: url.hostname,
      port:     url.port || (isHttps ? 443 : 80),
      path,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

export async function POST(request) {
  try {
    const payload = await request.json();

    // Extract and remove our custom field — don't send it upstream
    const { useSpyre, ...llmBody } = payload;

    const targetBase = useSpyre ? SPYRE_URL : LLAMA_URL;
    const backendLabel = useSpyre ? 'spyre' : 'llama';

    // Forward to /v1/chat/completions (OpenAI-compatible endpoint)
    const { status, body: raw, headers } = await nodeRequest(
      targetBase,
      '/v1/chat/completions',
      llmBody
    );

    // Attach a header so the client can confirm which backend answered
    const resp = NextResponse.json(
      status === 200 ? JSON.parse(raw) : { error: `Backend returned HTTP ${status}`, raw },
      { status: status === 200 ? 200 : 502 }
    );
    resp.headers.set('X-LLM-Backend', backendLabel);
    return resp;

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

export async function GET() {
  // Health-check both endpoints so the UI can show their live status
  const check = async (url, label) => {
    try {
      const { status } = await new Promise((resolve, reject) => {
        const u = new URL(url);
        const lib = u.protocol === 'https:' ? https : http;
        const req = lib.get(`${url}/health`, (res) => {
          res.resume();
          resolve({ status: res.statusCode });
        });
        req.on('error', reject);
        req.setTimeout(3000, () => { req.destroy(); reject(new Error('timeout')); });
      });
      return { label, url, status: status === 200 ? 'ok' : `http-${status}` };
    } catch (e) {
      return { label, url, status: 'unreachable', error: e.message };
    }
  };

  const [llama, spyre] = await Promise.all([
    check(LLAMA_URL, 'llama'),
    check(SPYRE_URL, 'spyre'),
  ]);

  return NextResponse.json({ llama, spyre });
}
