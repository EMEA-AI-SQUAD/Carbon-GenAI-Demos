import { NextResponse } from 'next/server';

const TRANSLATE_SERVICE_URL = process.env.TRANSLATE_SERVICE_URL || 'http://localhost:9000';

export async function POST(request) {
  try {
    const body = await request.json();
    const response = await fetch(`${TRANSLATE_SERVICE_URL}/v1/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

export async function GET() {
  try {
    const response = await fetch(`${TRANSLATE_SERVICE_URL}/health`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
