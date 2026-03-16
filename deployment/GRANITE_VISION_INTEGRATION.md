# Granite Vision Integration Guide

## Overview

This guide explains how to integrate IBM Granite Vision 3.3 2B for direct image processing in Tab 2 of the PII Extraction demo.

## Architecture

### Current (Main Branch)
```
Passport Image (display only)
  ↓
Pre-extracted OCR Text
  ↓
Granite 4.0 Micro (port 8080)
  ↓
Structured PII Data
```

### New (Vision Branch)
```
Passport Image
  ↓
Granite Vision 3.3 2B (port 8082)
  ↓
Extracted Text + Structured Data
  ↓
Display Results
```

## Prerequisites

- llama.cpp with multimodal support (confirmed ✓)
- ~2GB disk space for vision model
- ~4GB RAM for running vision model
- Existing Granite 4.0 Micro setup

## Installation Steps

### 1. Download Granite Vision Model

```bash
cd Carbon-GenAI-Demos
chmod +x deployment/setup-granite-vision.sh
./deployment/setup-granite-vision.sh
```

This script will:
- Create `/tmp/models` directory
- Download `granite-vision-3.3-2b-Q4_K_M.gguf` (~2GB)
- Download `mmproj-model-f16.gguf` (multimodal projector)
- Verify downloads

### 2. Start Granite Vision Server

```bash
chmod +x deployment/start-vision-server.sh
./deployment/start-vision-server.sh
```

This will start llama-server on port 8082 with:
- Model: Granite Vision 3.3 2B
- Multimodal projector enabled
- Host: 0.0.0.0 (network accessible)
- Context: 4096 tokens

### 3. Verify Vision Server

Test with curl:
```bash
curl http://localhost:8082/health
```

Expected response:
```json
{"status": "ok"}
```

## Code Changes Required

### 1. Update Proxy Server (Henrik's component)

Add route for vision endpoint in `carbon-ui/src/llama-proxy/server_final.js`:

```javascript
// Add vision model endpoint
app.post('/v1/vision/completions', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8082/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Update Tab 2 Frontend

Modify `carbon-ui/src/app/piiextract/page.js`:

**Current approach:**
- User sees image
- Text area shows pre-extracted OCR text
- Button sends text to Granite 4.0

**New approach:**
- User sees image
- Button sends image to Granite Vision
- Vision model extracts and structures data
- Display results

**Key changes:**
1. Remove OCR text textarea
2. Add image file handling
3. Convert image to base64
4. Send to vision endpoint
5. Parse vision model response

### 3. API Client Updates

Create new vision API client in `carbon-ui/src/app/piiextract/vision-extraction.js`:

```javascript
export async function extractFromImage(imageFile, entities) {
  // Convert image to base64
  const base64Image = await fileToBase64(imageFile);
  
  // Build prompt with entity definitions
  const prompt = buildVisionPrompt(entities);
  
  // Call vision endpoint
  const response = await fetch('http://localhost:3001/v1/vision/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'granite-vision',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }],
      temperature: 0,
      max_tokens: 2048
    })
  });
  
  return await response.json();
}
```

## Testing

### 1. Test Vision Server Directly

```bash
# Encode test image
base64 carbon-ui/public/images/mr-bean-passport.jpg > /tmp/passport.b64

# Test vision endpoint
curl http://localhost:8082/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "granite-vision",
    "messages": [{
      "role": "user",
      "content": [{
        "type": "image_url",
        "image_url": {
          "url": "data:image/jpeg;base64,'$(cat /tmp/passport.b64)'"
        }
      }, {
        "type": "text",
        "text": "Extract all text from this passport image."
      }]
    }],
    "temperature": 0
  }'
```

### 2. Test Through Proxy

```bash
curl http://localhost:3001/v1/vision/completions \
  -H 'Content-Type: application/json' \
  -d '{ ... same payload ... }'
```

### 3. Test Frontend

1. Navigate to Tab 2
2. Image should be displayed
3. Click "Extract Passport Information"
4. Frontend sends image to vision endpoint
5. Results displayed in table

## Rollback Plan

If vision integration has issues:

```bash
# Switch back to main branch
git checkout main

# Restart servers with original setup
./deployment/stop-server.sh
./deployment/deploy-carbon-genai.sh
```

Main branch remains stable with simulated OCR approach.

## Performance Considerations

- **Vision model**: ~2-3 seconds per image
- **Memory**: ~4GB RAM for vision model
- **Concurrent requests**: Limited by model capacity
- **Recommendation**: Run on dedicated server or scale horizontally

## Future Enhancements

1. **Batch processing**: Process multiple images
2. **Caching**: Cache vision results for same images
3. **Fallback**: Use OCR if vision model unavailable
4. **Model selection**: Let user choose text vs vision model

## Troubleshooting

### Vision server won't start
- Check llama.cpp multimodal support: `./llama-server --help | grep mmproj`
- Verify model files exist in `/tmp/models`
- Check port 8082 availability: `lsof -i :8082`

### Vision model returns errors
- Check model compatibility with llama.cpp version
- Verify multimodal projector matches model
- Review server logs: `tail -f deployment/granite-vision-server.log`

### Frontend can't connect
- Verify proxy server routes vision requests
- Check CORS headers in proxy
- Test vision endpoint directly with curl

## Resources

- [Granite Vision Model](https://huggingface.co/ibm-granite/granite-vision-3.3-2b-GGUF)
- [llama.cpp Multimodal](https://github.com/ggml-org/llama.cpp/tree/master/examples/llava)
- [OpenAI Vision API Format](https://platform.openai.com/docs/guides/vision)

---

**Branch**: `feature/granite-vision-integration`  
**Status**: Experimental  
**Merge to main**: After successful testing