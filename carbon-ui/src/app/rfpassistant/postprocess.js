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

  // Helper function to convert snake_case or camelCase to Title Case
  const toTitleCase = (str) => {
    return str
      .replace(/_/g, ' ')  // Replace underscores with spaces
      .replace(/([A-Z])/g, ' $1')  // Add space before capital letters
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  };

  // Helper function to convert any value to a readable string
  const valueToString = (raw) => {
    if (raw === undefined || raw === null) return fill;
    if (typeof raw === "string") {
      return raw.trim() === "" ? fill : raw;
    }
    if (Array.isArray(raw)) {
      // Convert arrays to bullet points
      return raw.map((item, idx) => `${idx + 1}. ${valueToString(item)}`).join('\n');
    }
    if (typeof raw === "object") {
      // Convert objects to formatted text with title-cased keys
      return Object.entries(raw)
        .map(([k, v]) => `${toTitleCase(k)}: ${valueToString(v)}`)
        .join('\n');
    }
    return String(raw);
  };

  for (const key of expectedKeys) {
    out[key] = valueToString(modelObj[key]);
  }

  if (!discardExtras) {
    for (const [k, v] of Object.entries(modelObj)) {
      if (!expectedKeys.includes(k)) {
        out[k] = valueToString(v);
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