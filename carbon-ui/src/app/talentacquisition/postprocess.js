import { NORMALIZE_KEYS, toJsonKey } from "./messages";

export function getExpectedKeys(values) {
  return (values.entities || [])
    .map((e) => (e.label || "").trim())
    .filter((label) => label.length > 0)
    .map((label) => (NORMALIZE_KEYS ? toJsonKey(label) : label));
}

export function parseModelJson(text) {
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
  } catch (_) {}

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Model did not return JSON.");
  const obj = JSON.parse(match[0]);
  if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
  throw new Error("Parsed JSON is not an object.");
}

export function reconcileOutput(modelObj, expectedKeys, opts = {}) {
  const fill = opts.fillValue ?? "Not provided";
  const discardExtras = !!opts.discardExtras;

  const out = {};

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

  if (!discardExtras) {
    for (const [k, v] of Object.entries(modelObj)) {
      if (!expectedKeys.includes(k)) {
        out[k] = typeof v === "string" ? v : v == null ? fill : String(v);
      }
    }
  }

  return out;
}

export function buildKeyLabelMap(values) {
  const map = new Map();
  for (const e of values.entities || []) {
    const label = (e.label || "").trim();
    if (!label) continue;
    const key = NORMALIZE_KEYS ? toJsonKey(label) : label;
    if (!map.has(key)) map.set(key, label);
  }
  return map;
}

// Made with Bob