import { NORMALIZE_KEYS, toJsonKey } from "./messages";

/** Build expected keys (in UI order) from current entities */
export function getExpectedKeys(values) {
  return (values.entities || [])
    .map((e) => (e.label || "").trim())
    .filter((label) => label.length > 0)
    .map((label) => (NORMALIZE_KEYS ? toJsonKey(label) : label));
}

/** Parse model output robustly (JSON object only) */
export function parseModelJson(text) {
  // Fast path
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
  } catch (_) {}

  // Fallback: try to extract the first {...} block
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Model did not return JSON.");
  const obj = JSON.parse(match[0]);
  if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
  throw new Error("Parsed JSON is not an object.");
}

/**
 * Reconcile model JSON with expected keys.
 * - Ensures every expected key exists (fill missing with "Data not available").
 * - Preserves UI order.
 * - Optionally drops extra keys (set discardExtras: true).
 */
export function reconcileOutput(modelObj, expectedKeys, opts = {}) {
  const fill = opts.fillValue ?? "Data not available";
  const discardExtras = !!opts.discardExtras;

  const out = {};

  // 1) Ensure all expected keys exist, preserving order
  for (const key of expectedKeys) {
    const raw = modelObj[key];
    const val =
      raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")
        ? fill
        : typeof raw === "string"
          ? raw
          : String(raw);
    out[key] = val;
  }

  // 2) Optionally keep extras from the model
  if (!discardExtras) {
    for (const [k, v] of Object.entries(modelObj)) {
      if (!expectedKeys.includes(k)) {
        out[k] = typeof v === "string" ? v : v == null ? fill : String(v);
      }
    }
  }

  return out;
}

/** Optional: map normalized keys back to original labels for display */
export function buildKeyLabelMap(values) {
  const map = new Map();
  for (const e of values.entities || []) {
    const label = (e.label || "").trim();
    if (!label) continue;
    const key = NORMALIZE_KEYS ? toJsonKey(label) : label;
    if (!map.has(key)) map.set(key, label); // keep first occurrence
  }
  return map;
}
