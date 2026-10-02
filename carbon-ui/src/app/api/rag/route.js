import { NextResponse } from 'next/server';

const RAG_BACKEND_URL = process.env.RAG_BACKEND_URL || 'http://localhost:8080';

export async function POST(request) {
  try {
    const body = await request.json();
    // RAG backend /query endpoint: { "query": "...", "top_k": 3 }
    const response = await fetch(`${RAG_BACKEND_URL}/query`, {
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
    const response = await fetch(`${RAG_BACKEND_URL}/health`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
