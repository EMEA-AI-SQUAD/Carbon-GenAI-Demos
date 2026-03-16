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

/** Build messages for PII extraction */
export function buildMessages(values) {
  const schemaJson = buildSchemaFromEntities(values);

  const system = {
    role: "system",
    content:
      "You are an AI PII Compliance Assistant. You help identify and extract personal identifiable information (PII) " +
      "from customer support tickets for data privacy compliance (GDPR, CCPA, etc.). " +
      "You must return a JSON object with the extracted entities only — no explanations. " +
      "Extract information exactly as it appears in the text for accurate redaction and compliance storage.",
  };

  const user = {
    role: "user",
    content:
`Analyze the following customer complaint ticket and extract these PII entities for compliance purposes:

${schemaJson}

Rules:
- Output must be valid JSON with key-value pairs only.
- If an entity is missing, output "Data not available" for that key.
- Do not hallucinate or include explanations.
- Extract information exactly as it appears in the text.

Customer Complaint Ticket:
${values.free_form_text}`,
  };

  return [system, user];
}

// Export the normalization helpers so postprocess can stay in sync
export { NORMALIZE_KEYS, toJsonKey };

// Made with Bob
