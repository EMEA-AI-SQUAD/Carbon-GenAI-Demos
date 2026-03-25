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

/** Build messages for Conversation Intelligence extraction */
export function buildMessages(values) {
  const schemaJson = buildSchemaFromEntities(values);

  const system = {
    role: "system",
    content:
      "You are an AI Conversation Intelligence Assistant. You analyze customer service interactions, sales calls, and support tickets " +
      "to extract key insights about sentiment, resolution status, agent performance, and business outcomes. " +
      "You must return a JSON object with the extracted insights only — no explanations. " +
      "Analyze the conversation context, tone, and outcomes to provide accurate intelligence metrics.",
  };

  const user = {
    role: "user",
    content:
`Analyze the following conversation transcript and extract these intelligence metrics:

${schemaJson}

Rules:
- Output must be valid JSON with key-value pairs only.
- If a metric cannot be determined, output "Not determined" for that key.
- Do not hallucinate or include explanations.
- Base your analysis on the actual conversation content and context.
- For sentiment and quality assessments, consider the overall tone and outcome.

Conversation Transcript:
${values.free_form_text}`,
  };

  return [system, user];
}

// Export the normalization helpers so postprocess can stay in sync
export { NORMALIZE_KEYS, toJsonKey };

// Made with Bob