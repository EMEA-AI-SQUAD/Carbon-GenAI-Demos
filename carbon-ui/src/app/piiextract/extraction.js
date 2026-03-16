export async function runExtractionWithStreaming(values, openai_client) {
  // 1) Build messages dynamically from the UI values
  const messages = buildMessages(values);

  // 2) Create streaming completion
  const stream = await openai_client.chat.completions.create({
    model: "gpt-3.5-turbo", // llama.cpp ignores but field required
    messages,
    stream: true,
    temperature: 0
  });

  // 3) Accumulate streamed content
  let fullText = "";

  // If you want to expose incremental tokens to the UI, pass a callback
  // (onToken) that appends chunkText to a text area or state.
  // Example signature: onToken?: (chunkText: string) => void
  // For now we'll just accumulate.
  for await (const chunk of stream) {
    const part = chunk?.choices?.[0]?.delta?.content ?? "";
    if (part) {
      fullText += part;
      // onToken?.(part);
    }
  }

  // 4) Parse model output (tolerant to extra prose), build expected keys, reconcile
  const modelObj = parseModelJson(fullText);
  const expected = getExpectedKeys(values);
  const finalObj = reconcileOutput(modelObj, expected, {
    discardExtras: true,
    fillValue: "Data not available"
  });

  // 5) (Optional) map normalized keys back to user labels for display
  const keyLabelMap = buildKeyLabelMap(values);
  const rows = expected.map((k) => ({
    label: keyLabelMap.get(k) || k,
    value: finalObj[k]
  }));

  return { rawText: fullText, json: finalObj, rows };
}
``
