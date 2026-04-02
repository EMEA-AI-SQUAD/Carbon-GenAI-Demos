# PassportEye Integration Guide

## Overview

This guide covers integrating PassportEye for ultra-fast passport MRZ extraction in the PII demo.

**Key Advantage**: PassportEye extracts passport data in < 1 second (vs 4-5 minutes for Granite Vision)

## Quick Start

```bash
# 1. Install PassportEye and dependencies
chmod +x deployment/setup-passporteye.sh
./deployment/setup-passporteye.sh

# 2. Start PassportEye service (port 5000)
chmod +x deployment/start-passporteye-service.sh
./deployment/start-passporteye-service.sh

# 3. Test with passport image
chmod +x deployment/test-passporteye.sh
./deployment/test-passporteye.sh
```

## Architecture

### Current Setup
```
Frontend → Proxy (3001) → Granite Vision (8082) → 4-5 min → Results
```

### PassportEye Setup
```
Frontend → Proxy (3001) → PassportEye Service (5000) → < 1s → Results
```

### Hybrid Approach (Recommended)
```
Frontend → User chooses method:
  ├─ Fast: PassportEye (MRZ only, < 1s)
  └─ Complete: Granite Vision (all fields, 4-5 min)
```

## What PassportEye Extracts

### MRZ Fields (Machine Readable Zone)
- ✅ Passport Type
- ✅ Country Code
- ✅ Surname
- ✅ Given Names
- ✅ Passport Number
- ✅ Nationality
- ✅ Date of Birth
- ✅ Sex
- ✅ Expiry Date
- ✅ Personal Number

### Not Extracted (Visual Zone Only)
- ❌ Place of Birth
- ❌ Issuing Authority
- ❌ Issue Date

## Integration Steps

### 1. Update Proxy Server

Add PassportEye route to `carbon-ui/src/llama-proxy/server_final.js`:

```javascript
// Add PassportEye endpoint
app.post('/passporteye', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5000/extract', {
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

### 2. Create Frontend Client

Create `carbon-ui/src/app/piiextract/passporteye-extraction.js`:

```javascript
/**
 * PassportEye extraction client
 */

export async function imageToBase64(imagePath) {
  const response = await fetch(imagePath);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function extractWithPassportEye(imagePath) {
  console.log('Extracting with PassportEye...');
  
  // Convert image to base64
  const imageBase64 = await imageToBase64(imagePath);
  
  // Call PassportEye service via proxy
  const response = await fetch('http://localhost:3001/passporteye', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log(`PassportEye extracted data in ${result.processing_time}s`);
    return result.data;
  } else {
    throw new Error(result.error);
  }
}
```

### 3. Update Frontend Page

Modify `carbon-ui/src/app/piiextract/page.js`:

```javascript
import { extractWithPassportEye } from './passporteye-extraction';

// Add state for extraction method
const [extractionMethod, setExtractionMethod] = useState('passporteye'); // or 'vision'

// Add PassportEye extraction handler
const handlePassportEyeExtraction = async () => {
  setLoading(true);
  try {
    const data = await extractWithPassportEye('/images/mr-bean-passport.jpg');
    
    // Convert to display format
    const rows = [
      { id: '1', label: 'Passport Number', value: data.number },
      { id: '2', label: 'Surname', value: data.surname },
      { id: '3', label: 'Given Names', value: data.names },
      { id: '4', label: 'Nationality', value: data.nationality },
      { id: '5', label: 'Date of Birth', value: data.date_of_birth },
      { id: '6', label: 'Sex', value: data.sex },
      { id: '7', label: 'Expiry Date', value: data.expiration_date },
    ];
    
    setExtractedRows(rows);
  } catch (error) {
    console.error('PassportEye extraction failed:', error);
  } finally {
    setLoading(false);
  }
};

// Add method selector in UI
<RadioButtonGroup
  legendText="Extraction Method"
  name="extraction-method"
  value={extractionMethod}
  onChange={(value) => setExtractionMethod(value)}
>
  <RadioButton
    labelText="Fast (PassportEye - MRZ only, < 1s)"
    value="passporteye"
    id="method-passporteye"
  />
  <RadioButton
    labelText="Complete (Granite Vision - all fields, 4-5 min)"
    value="vision"
    id="method-vision"
  />
</RadioButtonGroup>
```

## Performance Comparison

| Method | First Run | Cached | Fields | Complexity |
|--------|-----------|--------|--------|------------|
| **PassportEye** | < 1s | < 1s | MRZ only | Low |
| Granite Vision | 4-5 min | 20-30s | All fields | High |
| DeepSeek OCR | 30s-2min | ? | All fields | Medium |

## Advantages of PassportEye

1. **Speed**: 100-300x faster than Granite Vision
2. **Simplicity**: No large model downloads or GPU needed
3. **Reliability**: Deterministic, based on standards
4. **Resource Efficient**: Minimal CPU/memory usage
5. **Instant Results**: No waiting, no caching needed
6. **Easy Deployment**: Simple Python package

## Limitations

1. **MRZ Only**: Doesn't extract visual zone fields
2. **Image Quality**: Requires clear MRZ visibility
3. **Standard Formats**: Works best with standard passports
4. **No AI Reasoning**: Can't handle unusual cases

## Recommended User Experience

### Option 1: Default to PassportEye
```
1. User opens Tab 2
2. PassportEye extracts MRZ instantly (< 1s)
3. Display core passport info
4. Offer "Extract Additional Fields" button for Vision AI
```

### Option 2: Let User Choose
```
1. User selects extraction method:
   - Fast (PassportEye): MRZ fields, < 1s
   - Complete (Vision AI): All fields, 4-5 min
2. Extract based on selection
3. Display results
```

### Option 3: Progressive Enhancement
```
1. PassportEye extracts MRZ (< 1s)
2. Display MRZ fields immediately
3. Vision AI extracts visual zone in background
4. Update with additional fields when ready
```

## Error Handling

### PassportEye Fails
- Fallback to Granite Vision
- Show user-friendly error message
- Suggest image quality improvements

### Service Unavailable
- Check if PassportEye service is running
- Provide clear instructions to start service
- Offer alternative extraction methods

## Testing Checklist

- [ ] PassportEye service starts successfully
- [ ] Health check endpoint responds
- [ ] MRZ extraction works with test image
- [ ] Processing time < 1 second
- [ ] All MRZ fields extracted correctly
- [ ] Proxy route forwards requests properly
- [ ] Frontend displays results correctly
- [ ] Error handling works gracefully

## Deployment Considerations

### Development
- Run PassportEye service locally (port 5000)
- Use virtual environment for Python dependencies
- Easy to start/stop for testing

### Production
- Deploy as Docker container
- Use process manager (PM2, systemd)
- Add health checks and monitoring
- Consider serverless deployment (AWS Lambda, etc.)

## Next Steps

1. Run setup script to install PassportEye
2. Start PassportEye service
3. Test with Mr. Bean passport
4. Measure performance
5. Integrate with frontend
6. Add user choice for extraction method
7. Deploy to production

## Resources

- **PassportEye**: https://github.com/konstantint/PassportEye
- **MRZ Format**: ICAO 9303 standard
- **Tesseract OCR**: https://github.com/tesseract-ocr/tesseract

---

**Branch**: feature/passporteye-integration
**Status**: Ready for testing
**Expected Impact**: 100-300x faster passport extraction