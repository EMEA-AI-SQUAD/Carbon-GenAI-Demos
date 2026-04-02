# PassportEye Integration Research

## Overview

**PassportEye** is a Python library specifically designed for passport MRZ (Machine Readable Zone) extraction. This could be a much simpler and faster alternative to using large AI models for passport text extraction.

## What is PassportEye?

- **Purpose**: Extract data from passport MRZ (Machine Readable Zone)
- **Technology**: Traditional computer vision + OCR (not AI/LLM based)
- **Speed**: Very fast (< 1 second typically)
- **Accuracy**: High for standard passport formats
- **Dependencies**: Python, OpenCV, pytesseract

## Key Advantages

### 1. **Speed**
- No model loading required
- No GPU needed
- Processing time: < 1 second (vs 4-5 minutes for Granite Vision)
- Instant results

### 2. **Simplicity**
- No large model downloads (2-3 GB)
- No llama.cpp server needed
- Simple Python package installation
- Minimal resource usage

### 3. **Specialized**
- Purpose-built for passports
- Understands MRZ format
- Validates checksums
- Parses structured data automatically

### 4. **Reliability**
- Based on established standards (ICAO 9303)
- Deterministic (not probabilistic like AI)
- Consistent results
- Well-tested library

## How PassportEye Works

### MRZ (Machine Readable Zone)
The bottom two lines of a passport contain encoded information:
```
P<GBRBEAN<<MR<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
0234778124GBR8601066M1609206<<<<<<<<<<<<<<06
```

PassportEye:
1. Locates the MRZ in the image
2. Uses OCR to read the text
3. Parses the MRZ format
4. Validates checksums
5. Returns structured data

### Extracted Fields
- Passport type
- Country code
- Surname
- Given names
- Passport number
- Nationality
- Date of birth
- Sex
- Expiry date
- Personal number

## Installation

```bash
# Install PassportEye
pip install PassportEye

# Dependencies (usually auto-installed)
pip install opencv-python
pip install pytesseract
pip install pillow

# System dependency: Tesseract OCR
# Ubuntu/Debian: apt-get install tesseract-ocr
# macOS: brew install tesseract
# Windows: Download installer from GitHub
```

## Basic Usage

```python
from passporteye import read_mrz

# Read passport image
mrz = read_mrz('passport.jpg')

# Get parsed data
if mrz:
    data = mrz.to_dict()
    print(f"Name: {data['names']} {data['surname']}")
    print(f"Passport: {data['number']}")
    print(f"DOB: {data['date_of_birth']}")
    print(f"Expiry: {data['expiration_date']}")
```

## Integration Architecture

### Option 1: Python Microservice
```
Frontend (Next.js)
    ↓
Node.js Proxy (port 3001)
    ↓
Python PassportEye Service (port 5000)
    ↓
Returns JSON with extracted data
```

### Option 2: Direct Python Script
```
Frontend uploads image
    ↓
Node.js saves image temporarily
    ↓
Executes Python script
    ↓
Returns extracted data
```

### Option 3: Hybrid Approach
```
PassportEye extracts MRZ data (< 1s)
    ↓
Granite text model structures/validates (5-10s)
    ↓
Returns formatted PII data
```

## Comparison with Other Approaches

| Approach | Speed | Accuracy | Complexity | Resource Usage |
|----------|-------|----------|------------|----------------|
| **PassportEye** | < 1s | High (MRZ) | Low | Minimal |
| Granite Vision | 4-5 min | High | High | 4-6 GB RAM |
| DeepSeek OCR | 30s-2min | High | Medium | 2-3 GB RAM |
| Two-stage OCR | 40s-2.5min | High | Medium | 2-3 GB RAM |

## Limitations

### 1. **MRZ Only**
- Only extracts data from MRZ (bottom two lines)
- Doesn't read visual inspection zone (top part)
- Won't extract fields like "Place of Birth" (not in MRZ)

### 2. **Image Quality**
- Requires clear MRZ visibility
- Sensitive to image quality
- May need preprocessing for poor images

### 3. **Format Specific**
- Works best with standard passport formats
- May struggle with damaged/worn passports
- Requires proper MRZ format

### 4. **Limited Fields**
- Only extracts MRZ fields
- Missing some fields from visual zone
- May need supplementary extraction

## Recommended Approach

### Phase 1: PassportEye for MRZ (Fast Path)
1. Use PassportEye to extract MRZ data (< 1s)
2. Display core passport information immediately
3. Covers 80% of use cases

### Phase 2: Hybrid for Complete Data (Fallback)
1. If user needs additional fields (Place of Birth, etc.)
2. Use AI model for visual zone extraction
3. Combine MRZ + visual zone data

### Phase 3: User Choice
Let user choose extraction method:
- **Fast**: PassportEye (MRZ only, < 1s)
- **Complete**: AI Vision (all fields, 4-5 min)
- **Balanced**: PassportEye + Text Model (< 15s)

## Implementation Plan

### 1. Create Python Service
```python
# passport_service.py
from flask import Flask, request, jsonify
from passporteye import read_mrz
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)

@app.route('/extract', methods=['POST'])
def extract_passport():
    # Get base64 image from request
    image_data = request.json['image']
    
    # Decode and process
    image_bytes = base64.b64decode(image_data)
    image = Image.open(BytesIO(image_bytes))
    
    # Extract MRZ
    mrz = read_mrz(image)
    
    if mrz:
        return jsonify({
            'success': True,
            'data': mrz.to_dict()
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Could not read MRZ'
        })

if __name__ == '__main__':
    app.run(port=5000)
```

### 2. Update Node.js Proxy
Add route to forward to Python service:
```javascript
app.post('/passporteye', async (req, res) => {
  const response = await fetch('http://localhost:5000/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  const data = await response.json();
  res.json(data);
});
```

### 3. Update Frontend
Add PassportEye extraction option in Tab 2.

## Testing Strategy

### Test 1: Basic MRZ Extraction
- Use Mr. Bean passport image
- Verify MRZ fields extracted correctly
- Measure processing time

### Test 2: Accuracy Comparison
- Compare PassportEye vs Granite Vision
- Check field accuracy
- Identify any missing fields

### Test 3: Performance Benchmark
- Measure end-to-end time
- Compare with other approaches
- Document resource usage

### Test 4: Error Handling
- Test with poor quality images
- Test with non-passport images
- Verify graceful degradation

## Expected Results

### MRZ Fields from Mr. Bean Passport
```json
{
  "type": "P",
  "country": "GBR",
  "surname": "BEAN",
  "names": "MR",
  "number": "023477812",
  "nationality": "GBR",
  "date_of_birth": "860106",
  "sex": "M",
  "expiration_date": "160920",
  "personal_number": ""
}
```

### Performance Target
- Extraction time: < 1 second
- Total API response: < 2 seconds
- 100x faster than Granite Vision!

## Advantages Over AI Approaches

1. **No Model Management**: No downloading, loading, or managing large models
2. **Instant Results**: Sub-second processing
3. **Low Resources**: Runs on minimal hardware
4. **Deterministic**: Same input = same output
5. **Standard Compliance**: Based on ICAO standards
6. **Easy Deployment**: Simple Python package
7. **Cost Effective**: No GPU needed

## Potential Issues & Solutions

### Issue 1: Tesseract Not Installed
**Solution**: Add installation to setup script
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract
```

### Issue 2: Poor Image Quality
**Solution**: Add image preprocessing
```python
# Enhance image before extraction
from PIL import ImageEnhance
enhancer = ImageEnhance.Contrast(image)
enhanced = enhancer.enhance(2.0)
```

### Issue 3: Missing Visual Zone Fields
**Solution**: Hybrid approach - use PassportEye for MRZ, AI for visual zone

### Issue 4: Python Service Dependency
**Solution**: Package as Docker container or use serverless function

## Next Steps

1. ✅ Create new branch: `feature/passporteye-integration`
2. [ ] Install PassportEye and dependencies
3. [ ] Create Python extraction service
4. [ ] Create test script for Mr. Bean passport
5. [ ] Measure performance
6. [ ] Compare with Granite Vision
7. [ ] Document findings
8. [ ] Decide on production approach

## Resources

- **PassportEye GitHub**: https://github.com/konstantint/PassportEye
- **PyPI Package**: https://pypi.org/project/PassportEye/
- **ICAO 9303 Standard**: Machine Readable Travel Documents
- **Tesseract OCR**: https://github.com/tesseract-ocr/tesseract

---

**Branch**: feature/passporteye-integration
**Status**: Research complete, ready for implementation
**Expected Outcome**: 100x faster passport extraction with minimal complexity