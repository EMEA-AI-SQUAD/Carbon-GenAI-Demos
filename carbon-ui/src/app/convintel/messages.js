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
      "You are an AI Sales Conversation Intelligence Assistant. You analyze sales call transcripts " +
      "to extract actionable insights including summaries, classifications, and key entities. " +
      "You must return a JSON object with the extracted information only — no explanations or additional text.",
  };

  const user = {
    role: "user",
    content:
`Analyze the following sales conversation transcript and extract these insights:

${schemaJson}

IMPORTANT INSTRUCTIONS:

1. CONVERSATION SUMMARY (1-shot learning):
   Create a concise 2-3 sentence summary capturing the key discussion points.
   
   Example:
   Input: "Sales Rep: Hi, I'm calling about our CRM software. Client: We need better customer tracking. Sales Rep: Our Enterprise plan offers advanced analytics. Client: Sounds good, send me pricing."
   Output: "Client expressed need for improved customer tracking capabilities. Sales rep presented Enterprise CRM plan with advanced analytics features. Next step is to send detailed pricing information."

2. INDUSTRY CLASSIFICATION (0-shot learning):
   Classify the client's industry based on the conversation context.
   Valid options: Finance, Manufacturing, Healthcare, Retail, Technology, Energy, Logistics, Education, Government, Other
   Choose the single most appropriate category.

3. CALL-TO-ACTION (0-shot learning):
   Identify the primary next step agreed upon in the conversation.
   Valid options: Send Proposal, Schedule Demo, Follow-up Call, Send Pricing, Technical Discussion, Contract Review, No Action Needed
   Choose the single most appropriate action.

4. ENTITY EXTRACTION:
   Extract specific entities mentioned in the conversation (names, companies, roles, budget, timeline, pain points, competitors).
   If an entity is not mentioned, output "Not mentioned" for that field.

OUTPUT FORMAT:
- Return valid JSON only
- Use the exact keys from the schema
- No explanations or additional text
- For classification fields, use only the predefined options listed above

Sales Conversation Transcript:
${values.free_form_text}`,
  };

  return [system, user];
}

// Export the normalization helpers so postprocess can stay in sync
export { NORMALIZE_KEYS, toJsonKey };

// Made with Bob