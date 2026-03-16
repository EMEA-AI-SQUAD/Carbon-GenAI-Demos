/**
 * Vision-based PII extraction using Granite Vision 3.3 2B
 * Processes passport images directly without OCR pre-processing
 */

import { getExpectedKeys, parseModelJson, reconcileOutput, buildKeyLabelMap } from "./postprocess";

/**
 * Convert image file to base64 string
 */
export async function imageToBase64(imagePath) {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

/**
 * Build vision prompt for passport extraction
 */
function buildVisionPrompt(entities) {
  const fields = entities
    .filter(e => e.label && e.label.trim())
    .map(e => `- ${e.label}: ${e.definition}`)
    .join('\n');

  return `Read this passport and extract the following information in a structured JSON format:

${fields}

Return ONLY a JSON object with these exact field names. If a field is not visible or cannot be determined, use "Data not available" as the value.`;
}

/**
 * Call Granite Vision API with image
 */
export async function extractFromPassportImage(imagePath, entities, openai_client) {
  console.log('Starting vision-based passport extraction...');
  
  // 1. Convert image to base64
  console.log('Converting image to base64...');
  const imageBase64 = await imageToBase64(imagePath);
  console.log(`Image encoded: ${imageBase64.length} characters`);

  // 2. Build vision prompt
  const prompt = buildVisionPrompt(entities);
  console.log('Vision prompt:', prompt);

  // 3. Create vision request with image
  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`
          }
        }
      ]
    }
  ];

  // 4. Call vision endpoint (routes through proxy to port 8082)
  console.log('Calling Granite Vision API...');
  const result = await openai_client.chat.completions.create({
    model: "granite-vision", // Model name doesn't matter for llama.cpp
    messages,
    stream: false,
    temperature: 0,
    max_tokens: 1000,
  });

  const text = result?.choices?.[0]?.message?.content ?? "";
  console.log("Raw vision model response:", text);

  // 5. Parse and reconcile output
  const modelObj = parseModelJson(text);
  const expected = getExpectedKeys({ entities });
  const finalObj = reconcileOutput(modelObj, expected, {
    discardExtras: true,
    fillValue: "Data not available",
  });

  // 6. Build display rows
  const labelMap = buildKeyLabelMap({ entities });
  const rows = expected.map((k, i) => ({
    id: String(i),
    label: labelMap.get(k) || k,
    value: finalObj[k],
  }));

  return { rawText: text, json: finalObj, rows };
}

/**
 * Pre-warm vision cache by calling with passport image
 * This should be called when the page loads to cache the result
 */
export async function prewarmVisionCache(imagePath, entities, openai_client) {
  console.log('Pre-warming vision cache...');
  try {
    const result = await extractFromPassportImage(imagePath, entities, openai_client);
    console.log('Vision cache pre-warmed successfully');
    return result;
  } catch (error) {
    console.error('Failed to pre-warm vision cache:', error);
    throw error;
  }
}

// Made with Bob
