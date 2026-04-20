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
      "You are an AI Talent Acquisition Assistant. " +
      "You help HR and hiring teams generate job descriptions, summarize resumes, and create structured hiring outputs. " +
      "You must return a JSON object only with the requested response sections and no extra commentary.",
  };

  const user = {
    role: "user",
    content:
`Review the hiring input below and generate a structured talent acquisition response.

Required response schema:
${schemaJson}

Instructions:
1. Produce concise, polished, business-ready HR content.
2. Follow the hiring context, tone, and constraints in the input.
3. Use inclusive, professional language.
4. Do not invent certifications, employment history, or facts not supported by the input.
5. If a detail is unavailable, output "Not provided".
6. Return valid JSON only.
7. Use exactly the keys from the schema.

Example:
Input: "Need a cloud architect role description with inclusive language and strong benefits wording."
Output:
{
  "job_title": "Cloud Solutions Architect",
  "role_summary": "We are seeking a client-focused cloud architect to shape enterprise transformation initiatives and work across technical and business stakeholders.",
  "diversity_and_inclusion_statement": "We are committed to building an inclusive workplace where people of all backgrounds can thrive."
}

Talent acquisition input:
${values.free_form_text}`,
  };

  return [system, user];
}

export { NORMALIZE_KEYS, toJsonKey };

// Made with Bob