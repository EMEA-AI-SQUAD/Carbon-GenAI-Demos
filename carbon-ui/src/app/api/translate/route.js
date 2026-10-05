import { NextResponse } from 'next/server';
import http from 'http';

// Use Node.js http.request rather than undici/fetch — undici has hostname
// resolution issues on ppc64le inside Podman networks.
const TRANSLATE_SERVICE_URL = process.env.TRANSLATE_SERVICE_URL || 'http://localhost:9000';

function nodeRequest(urlStr, options, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: payload
        ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
        : {},
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { status, body: data } = await nodeRequest(
      `${TRANSLATE_SERVICE_URL}/v1/translate`,
      { method: 'POST' },
      body
    );
    return NextResponse.json(JSON.parse(data), { status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

export async function GET() {
  try {
    const { status, body: data } = await nodeRequest(`${TRANSLATE_SERVICE_URL}/health`, {});
    return NextResponse.json(JSON.parse(data), { status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
