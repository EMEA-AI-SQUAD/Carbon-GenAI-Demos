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
      "You are an objective AI IT Service Management triage specialist. " +
      "You extract structured technical facts and classify true organizational priority based on objective business continuity standards, " +
      "filtering out sender panic and emotional exaggeration. Output valid JSON only — no explanations.",
  };

  const user = {
    role: "user",
    content:
`Analyze the following IT operations email and extract these entities according to their exact definitions:

${schemaJson}

Important Guidelines:
- Output must be valid JSON matching the schema keys.
- If an entity is missing, output "Data not available" for that key.
- Do not hallucinate or include explanations.
- In 'business_impact', focus solely on company operations and workflows (e.g. delayed reports or shipments), ignoring personal employment anxiety.
- In 'true_priority', evaluate strictly based on enterprise severity. An unavailable internal reporting tool for a meeting is strictly Medium. Critical is reserved for company-wide outages, safety hazards, or regulatory shutdowns.

Email:
${values.free_form_text}`,
  };

  return [system, user];
}

// Export the normalization helpers so postprocess can stay in sync
export { NORMALIZE_KEYS, toJsonKey };
