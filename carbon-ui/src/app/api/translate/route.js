import { NextResponse } from 'next/server';
import http from 'http';

// Direct Ollama chat — bypasses the AI Services translate-service which
// requires a vLLM /tokenize endpoint not available on Ollama.
// The page sends: { text, source_language, target_language }
// We return:      { data: { translation, source_language } }
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const LLM_MODEL  = process.env.LLM_MODEL  || 'granite4:latest';

function nodeRequest(urlStr, method, body) {
  return new Promise((resolve, reject) => {
    const url     = new URL(urlStr);
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: url.hostname,
      port:     url.port || 80,
      path:     url.pathname + url.search,
      method,
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
    const { text, source_language, target_language } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'No text provided.' }, { status: 400 });
    }

    const src = (source_language && source_language !== 'auto')
      ? source_language
      : 'the source language (detect automatically)';
    const tgt = target_language || 'Romanian';

    const systemPrompt =
      'You are a professional translator. ' +
      'Translate the document text provided by the user accurately and completely. ' +
      'Preserve the original formatting, line breaks, and structure as closely as possible. ' +
      'Return ONLY the translated text — no explanations, no preamble, no notes.';

    const userPrompt =
      `Translate the following document from ${src} to ${tgt}.\n\n` +
      `Return only the translated text, preserving the original layout.\n\n` +
      `---\n${text}\n---`;

    const ollamaBody = {
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      stream: false,
    };

    const { status, body: raw } = await nodeRequest(
      `${OLLAMA_URL}/api/chat`,
      'POST',
      ollamaBody
    );

    if (status !== 200) {
      return NextResponse.json(
        { error: `Ollama returned HTTP ${status}`, raw },
        { status: 502 }
      );
    }

    const ollamaResp = JSON.parse(raw);
    const translation = (ollamaResp?.message?.content || '').trim();

    // Return in the same envelope the page expects:
    // { data: { translation, source_language } }
    return NextResponse.json({
      data: {
        translation,
        source_language: source_language === 'auto' ? 'chinese' : source_language,
      }
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

export async function GET() {
  try {
    const { status } = await nodeRequest(`${OLLAMA_URL}/api/tags`, 'GET', null);
    return NextResponse.json({ status: status === 200 ? 'ok' : 'degraded', ollama: status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
