// Set to false if you want keys to stay exactly as user typed them.
const NORMALIZE_KEYS = true;

const toJsonKey = (s) =>
  s.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "");

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

export function buildMessages(values) {
  const schemaJson = buildSchemaFromEntities(values);

  const system = {
    role: "system",
    content:
      "You are an AI Marketing Brief Builder Assistant. " +
      "You convert launch notes, campaign inputs, event details, and partner information " +
      "into structured internal marketing briefs for enterprise teams. " +
      "You must return a JSON object only with the requested brief sections and no extra commentary.",
  };

  const user = {
    role: "user",
    content:
`Create a structured marketing brief from the following input.

Required brief schema:
${schemaJson}

Instructions:
1. Produce concise but useful business-ready content for each requested section.
2. Follow the tone, style, and constraints given in the input.
3. Prioritize clarity, consistency, and practical execution guidance.
4. Do not invent unsupported product claims or metrics.
5. If a detail is not available, infer cautiously only when the input strongly supports it. Otherwise output "Not provided".
6. Return valid JSON only.
7. Use exactly the keys from the schema.

Example:
Input: "Feature launch for analytics dashboard targeting CFOs in the UK. Tone should be executive and concise. Goal is to drive demo requests."
Output:
{
  "brief_title": "UK Analytics Dashboard Launch Brief",
  "campaign_objective": "Drive qualified demo requests for the new analytics dashboard among CFO audiences in the UK.",
  "target_audience": "CFOs and senior finance leaders at UK-based mid-market and enterprise organizations.",
  "key_message": "Give finance leaders faster visibility into business performance with a dashboard designed for executive decision-making."
}

Campaign input:
${values.free_form_text}`,
  };

  return [system, user];
}

export { NORMALIZE_KEYS, toJsonKey };

// Made with Bob