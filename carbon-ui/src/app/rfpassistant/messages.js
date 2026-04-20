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
      "You are an AI RFP and Proposal Assistant. " +
      "You help enterprise bid teams review opportunities, assess fit, and draft polished proposal content. " +
      "You must return a JSON object only with the requested response sections and no extra commentary.",
  };

  const user = {
    role: "user",
    content:
`Review the company profile and RFP opportunity below, then generate a structured bid support response.

Required response schema:
${schemaJson}

Instructions:
1. Produce concise, polished, business-ready content suitable for bid and proposal teams.
2. Reflect the company profile, buyer priorities, and RFP constraints.
3. Use clear proposal language, not casual commentary.
4. Do not invent certifications, case studies, or claims not supported by the input.
5. If a detail is unavailable, output "Not provided".
6. Return valid JSON only.
7. Use exactly the keys from the schema.

Example:
Input: "Company provides hybrid cloud and consulting services. Buyer wants a secure modernization partner."
Output:
{
  "opportunity_fit_summary": "The opportunity aligns well with the supplier's hybrid cloud and consulting strengths, particularly where secure modernization and delivery capability are key evaluation factors.",
  "bid__no_bid_recommendation": "Bid",
  "key_win_themes": "Secure modernization, end-to-end delivery capability, and long-term transformation partnership."
}

RFP input:
${values.free_form_text}`,
  };

  return [system, user];
}

export { NORMALIZE_KEYS, toJsonKey };

// Made with Bob