/**
 * DGPCI Romania — Entity Extraction via IBM AI Services extract endpoint.
 *
 * Calls the Next.js proxy at /api/extract which forwards to the
 * AI Services extract-service running on the LPAR (port 6000).
 *
 * The AI Services /v1/extract endpoint expects:
 *   POST { "text": "...", "schema_name": "vehicle_import" }
 * and returns:
 *   { "data": { "extraction": { <field>: <value>, ... } }, "meta": {...}, "usage": {...} }
 *
 * Falls back to a simple key-for-key pass-through if the extraction field
 * structure doesn't exactly match the expected keys (uses the same
 * reconcileOutput logic as before so the table always renders).
 */
import { getExpectedKeys, parseModelJson, reconcileOutput, buildKeyLabelMap } from "./postprocess";

export async function runExtraction(values) {
  const text = (values.free_form_text || "").trim();
  if (!text) throw new Error("Nu există text de analizat.");

  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      schema_name: 'vehicle_import',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || err?.detail || `Serviciul de extracție a returnat eroarea ${response.status}`);
  }

  const result = await response.json();

  // AI Services returns: { data: { extraction: { ... } }, meta: {}, usage: {} }
  const extraction = result?.data?.extraction ?? result?.extraction ?? result;

  const expected = getExpectedKeys(values);
  const finalObj = reconcileOutput(extraction, expected, {
    discardExtras: true,
    fillValue: "Date indisponibile",
  });

  const keyLabelMap = buildKeyLabelMap(values);
  const rows = expected.map((k, i) => ({
    id: String(i),
    label: keyLabelMap.get(k) || k,
    value: finalObj[k],
  }));

  return { json: finalObj, rows };
}
