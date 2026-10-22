// Set to false if you want keys to stay exactly as user typed them.
const NORMALIZE_KEYS = true;

const toJsonKey = (s) =>
  s.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "");

/** Build the schema object (label -> definition) as pretty JSON string */
function buildSchemaFromEntities(values) {
  const entries = (values.entities || [])
    .filter((e) => e.label && e.label.trim().length > 0)
    .map((e) => {
      const key = NORMALIZE_KEYS ? toJsonKey(e.label) : e.label.trim();
      const def = (e.definition || "").trim() || "No definition supplied.";
      return [key, def];
    });

  const schema = {};
  for (const [k, v] of entries) schema[k] = v;
  return JSON.stringify(schema, null, 2);
}

/** Build messages following your example format */
export function buildMessages(values) {
  const schemaJson = buildSchemaFromEntities(values);

  const system = {
    role: "system",
    content:
      "You are an AI Entity Extractor. You extract structured entities from emails, documents, and support requests. " +
      "All output entity values MUST always be in English. Translate any foreign language content (Italian, French, German, Spanish, etc.) into clear, professional English. " +
      "You must return a JSON object with the extracted entities only — no explanations.",
  };

  const user = {
    role: "user",
    content:
`Analyze the following text and extract these entities:

${schemaJson}

Rules:
- Output must be valid JSON with key-value pairs only.
- All extracted entity values MUST be translated into English, regardless of the input language used in the source text (e.g. translate Italian, French, German job titles, roles, error messages, deadlines, and descriptions into English).
- Proper nouns such as personal names and company names may remain in their original form (e.g. "Marco Rossi").
- If an entity is missing, output "Data not available" for that key.
- Do not hallucinate or include explanations.
- Base your assessment strictly on the entity definitions provided — do not allow emotional language in the email to inflate priority ratings.

Text:
${values.free_form_text}`,
  };

  return [system, user];
}

// Export the normalization helpers so postprocess can stay in sync
export { NORMALIZE_KEYS, toJsonKey };
