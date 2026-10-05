import { NextResponse } from 'next/server';
import http from 'http';

// Two-step RAG:
//   1. POST /api/search on the RAG backend — retrieves relevant chunks from
//      the DGPCI regulations knowledge base in OpenSearch.
//   2. POST /api/chat on Ollama — generates an answer grounded in the chunks.
//
// The rag-backend image is the RAG-with-Notebook app. Its /api/generate endpoint
// is coupled to the IBM Power server sales-manual use case (MTM lookups, Watson
// intent detection), so we use /api/search for retrieval and call Ollama directly
// for generation — same Option C approach as translation and extraction.

const RAG_BACKEND_URL = process.env.RAG_BACKEND_URL  || 'http://localhost:8080';
const OLLAMA_URL      = process.env.OLLAMA_URL        || 'http://localhost:11434';
const LLM_MODEL       = process.env.LLM_MODEL         || 'granite4:latest';
const COLLECTION      = 'dgpci-regulations';

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
    const { query, top_k = 3 } = await request.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'No query provided.' }, { status: 400 });
    }

    // ── Step 1: Retrieve relevant chunks from OpenSearch ──────────────────
    const { status: searchStatus, body: searchRaw } = await nodeRequest(
      `${RAG_BACKEND_URL}/api/search`,
      'POST',
      { question: query, collection_name: COLLECTION, n_results: top_k }
    );

    let chunks = [];
    let sources = [];
    if (searchStatus === 200) {
      const searchResp = JSON.parse(searchRaw);
      const results = searchResp?.results ?? [];
      chunks = results.map(r => r?.content ?? r?.text ?? '').filter(Boolean);
      sources = results.map(r => r?.metadata?.source ?? r?.source ?? '').filter(Boolean);
    }
    // If search failed or returned nothing, proceed with empty context
    // (Ollama will answer from its own knowledge — better than a hard error)

    // ── Step 2: Generate answer with Ollama ───────────────────────────────
    const context = chunks.length > 0
      ? chunks.map((c, i) => `[${i + 1}] ${c}`).join('\n\n')
      : '(No relevant documents found in the knowledge base.)';

    const systemPrompt =
      'You are a helpful assistant for DGPCI (Direcția Generală de Prevenire și Combatere a Infracționalității), ' +
      'the Romanian customs investigative authority. ' +
      'Answer questions about vehicle import regulations, customs procedures, and related Romanian/EU law. ' +
      'Base your answer strictly on the provided context. ' +
      'If the context does not contain enough information, say so clearly. ' +
      'Answer in the same language as the question.';

    const userPrompt =
      `Context from the DGPCI knowledge base:\n\n${context}\n\n` +
      `Question: ${query}\n\n` +
      `Answer concisely and accurately based on the context above.`;

    const ollamaBody = {
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      stream: false,
    };

    const { status: ollamaStatus, body: ollamaRaw } = await nodeRequest(
      `${OLLAMA_URL}/api/chat`,
      'POST',
      ollamaBody
    );

    if (ollamaStatus !== 200) {
      return NextResponse.json(
        { error: `Ollama returned HTTP ${ollamaStatus}` },
        { status: 502 }
      );
    }

    const ollamaResp = JSON.parse(ollamaRaw);
    const answer = (ollamaResp?.message?.content || '').trim();

    return NextResponse.json({ answer, sources }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

export async function GET() {
  try {
    const { status } = await nodeRequest(`${RAG_BACKEND_URL}/health`, 'GET', null);
    return NextResponse.json({ status: status === 200 ? 'ok' : 'degraded', rag_backend: status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
