import { NextResponse } from 'next/server';
import http from 'http';

// Direct Ollama chat — no dependency on the AI Services extract-service schema.
// The UI sends { text, entities: [{label, definition}] } and we build the prompt
// here, call Ollama, parse the JSON response, and return it.
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

/** Build the JSON schema description from entity list */
function buildSchema(entities) {
  const obj = {};
  for (const e of (entities || [])) {
    const label = (e.label || '').trim();
    if (!label) continue;
    obj[label] = (e.definition || '').trim() || 'No definition supplied.';
  }
  return JSON.stringify(obj, null, 2);
}

export async function POST(request) {
  try {
    const { text, entities } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'No text provided.' }, { status: 400 });
    }

    const schemaJson = buildSchema(entities);

    const systemPrompt =
      'You are a precise document entity extractor for Romanian customs documents. ' +
      'Extract the requested fields from the document text. ' +
      'Return ONLY a valid JSON object with the field labels as keys and extracted values as strings. ' +
      'If a field is not present in the document, use the string "Date indisponibile". ' +
      'Do not include any explanation, markdown, or text outside the JSON object.';

    const userPrompt =
      `Extract the following fields from the document below.\n\n` +
      `Fields to extract (label: description):\n${schemaJson}\n\n` +
      `Rules:\n` +
      `- Output must be a valid JSON object only — no markdown, no explanation.\n` +
      `- Keys must exactly match the field labels above.\n` +
      `- If a field is absent from the document, set its value to "Date indisponibile".\n\n` +
      `Document:\n${text}`;

    const ollamaBody = {
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      stream: false,
      format: 'json',
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
    // Ollama /api/chat response: { message: { content: "..." }, ... }
    const content = ollamaResp?.message?.content || '';

    // Parse the JSON the model returned
    let extraction = {};
    try {
      extraction = JSON.parse(content);
    } catch (_) {
      // Try to extract first {...} block as fallback
      const match = content.match(/\{[\s\S]*\}/);
      if (match) extraction = JSON.parse(match[0]);
    }

    // Wrap in the same envelope the UI's extraction.js expects:
    // { data: { extraction: {...} } }
    return NextResponse.json({ data: { extraction } }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

export async function GET() {
  // Health check — ping Ollama
  try {
    const { status } = await nodeRequest(`${OLLAMA_URL}/api/tags`, 'GET', null);
    return NextResponse.json({ status: status === 200 ? 'ok' : 'degraded', ollama: status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
