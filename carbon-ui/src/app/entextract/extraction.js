/**
 * DGPCI Romania — Entity Extraction via direct Ollama call.
 *
 * The Next.js route at /api/extract builds the LLM prompt from the UI's
 * entity labels + definitions, calls Ollama /api/chat, and returns:
 *   { data: { extraction: { <label>: <value>, ... } } }
 *
 * Keys in the extraction object match the UI label strings exactly —
 * no normalisation needed.
 */
import { reconcileOutput } from "./postprocess";

export async function runExtraction(values) {
  const text = (values.free_form_text || '').trim();
  if (!text) throw new Error('Nu există text de analizat.');

  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      entities: (values.entities || []).filter(e => (e.label || '').trim()),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || `Serviciul de extracție a returnat eroarea ${response.status}`);
  }

  const result = await response.json();

  // Route returns { data: { extraction: {...} } }
  const extraction = result?.data?.extraction ?? result?.extraction ?? result;

  // Expected keys are the raw label strings (as typed in the UI)
  const expected = (values.entities || [])
    .map(e => (e.label || '').trim())
    .filter(l => l.length > 0);

  const finalObj = reconcileOutput(extraction, expected, {
    discardExtras: true,
    fillValue: 'Date indisponibile',
  });

  const rows = expected.map((label, i) => ({
    id: String(i),
    label,
    value: finalObj[label],
  }));

  return { json: finalObj, rows };
}
