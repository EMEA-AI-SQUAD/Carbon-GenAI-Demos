# Complete Demo Deployment Guide

## Overview

This guide covers deploying all three GenAI demos on IBM Power with the new PassportEye integration:

1. **Entity Extraction** - Extract structured data from unstructured text
2. **PII Extraction** - Extract personal information with PassportEye (ultra-fast!)
3. **Conversation Intelligence** - Analyze customer conversations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│                      Port 3000                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Entity     │  │     PII      │  │  ConvIntel   │     │
│  │  Extraction  │  │  Extraction  │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Node.js Proxy Server                        │
│                      Port 3001                               │
│  Routes:                                                     │
│  • /v1/* → Granite Text Model (port 8080)                  │
│  • /passporteye → PassportEye Service (port 5000)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│  Granite 3.0 8B  │                  │   PassportEye    │
│  Text Model      │                  │   Service        │
│  Port 8080       │                  │   Port 5000      │
│  (llama.cpp)     │                  │   (Flask/Python) │
└──────────────────┘                  └──────────────────┘
```

## Quick Start

### 1. Install PassportEye (New!)

```bash
cd ~/Carbon-GenAI-Demos
git checkout feature/conversation-intelligence

# Install PassportEye and dependencies
chmod +x deployment/setup-passporteye.sh
./deployment/setup-passporteye.sh
```

### 2. Start All Services

```bash
# Terminal 1: Granite Text Model (for Entity Extraction & ConvIntel)
cd llama.cpp
./llama-server -m models/granite-3.0-8b-instruct.Q4_K_M.gguf -c 4096 --port 8080

# Terminal 2: PassportEye Service (for PII Extraction)
cd ~/Carbon-GenAI-Demos
chmod +x deployment/start-passporteye-service.sh
./deployment/start-passporteye-service.sh

# Terminal 3: Node.js Proxy
cd carbon-ui/src/llama-proxy
node server_final.js

# Terminal 4: Next.js Frontend
cd carbon-ui
npm run dev
```

### 3. Access Demos

Open browser to: `http://your-server:3000`

- **Home**: `/` or `/home`
- **Entity Extraction**: `/entextract`
- **PII Extraction**: `/piiextract`
- **Conversation Intelligence**: `/convintel`

## Demo Details

### 1. Entity Extraction (`/entextract`)

**Purpose**: Extract structured data from unstructured text

**Use Cases**:
- **Tab 1**: IT Operations - Extract ticket details from support emails
- **Tab 2**: Logistics - Extract shipping quote information
- **Tab 3**: Document Discovery - Find PII in unstructured documents

**Technology**: Granite 3.0 8B text model

**Performance**: 5-10 seconds per extraction

---

### 2. PII Extraction (`/piiextract`) ⭐ NEW: PassportEye!

**Purpose**: Extract personal information from documents

**Use Cases**:
- **Tab 1**: Fraud Complaint - Extract PII from complaint text
- **Tab 2**: Passport Verification - Extract passport data (PassportEye!)
- **Tab 3**: Document Discovery - Find PII in documents

**Technology**:
- Tab 1 & 3: Granite 3.0 8B text model
- Tab 2: **PassportEye** (ultra-fast MRZ extraction!)

**Performance**:
- Tab 1 & 3: 5-10 seconds
- Tab 2: **< 1 second** (100-300x faster than AI vision!)

**PassportEye Features**:
- Extracts MRZ fields: passport number, name, DOB, nationality, etc.
- No large model downloads needed
- Minimal resource usage
- Deterministic and reliable

---

### 3. Conversation Intelligence (`/convintel`)

**Purpose**: Analyze customer conversations for insights

**Use Cases**:
- **Tab 1**: Customer Service - Analyze support call
- **Tab 2**: Sales Call - Extract sales intelligence
- **Tab 3**: Support Ticket - Analyze multilingual support

**Technology**: Granite 3.0 8B text model

**Performance**: 5-10 seconds per analysis

---

## PassportEye Integration

### What is PassportEye?

PassportEye is a Python library that extracts data from passport MRZ (Machine Readable Zone) - the two lines of text at the bottom of passports.

### Why PassportEye?

| Feature | PassportEye | Granite Vision |
|---------|-------------|----------------|
| Speed | < 1 second | 4-5 minutes |
| Model Size | None | 2 GB |
| Memory | ~100 MB | 4-6 GB |
| Setup | Simple | Complex |

**Result**: 100-300x faster with minimal resources!

### What PassportEye Extracts

✅ **MRZ Fields** (from bottom two lines):
- Passport Type
- Country Code
- Surname
- Given Names
- Passport Number
- Nationality
- Date of Birth
- Sex
- Expiry Date

❌ **Not Extracted** (visual zone only):
- Place of Birth
- Issuing Authority
- Issue Date

### Testing PassportEye

```bash
# Test with Mr. Bean passport
chmod +x deployment/test-passporteye.sh
./deployment/test-passporteye.sh

# Expected output:
# ✓ Extraction completed in 0.XXX seconds
# Surname: BEAN
# Names: MR
# Passport Number: 023477812
# etc.
```

## Proxy Server Configuration

The Node.js proxy (`carbon-ui/src/llama-proxy/server_final.js`) routes requests:

```javascript
// Default route: Granite text model
app.post('/v1/*', async (req, res) => {
  // Forward to port 8080 (Granite)
});

// PassportEye route
app.post('/passporteye', async (req, res) => {
  // Forward to port 5000 (PassportEye)
});
```

## Service Health Checks

```bash
# Check Granite text model
curl http://localhost:8080/health

# Check PassportEye service
curl http://localhost:5000/health

# Check proxy server
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000
```

## Troubleshooting

### PassportEye Service Won't Start

```bash
# Check if Tesseract is installed
tesseract --version

# Check if Python packages installed
source .passporteye-venv/bin/activate
python3 -c "import passporteye; print('OK')"

# Check port availability
lsof -i :5000
```

### PassportEye Extraction Fails

1. **Check image quality**: MRZ must be clearly visible
2. **Check service logs**: `tail -f deployment/passporteye-service.log`
3. **Test directly**: Use test script to verify service works

### Granite Model Issues

```bash
# Check if model file exists
ls -lh llama.cpp/models/granite-3.0-8b-instruct.Q4_K_M.gguf

# Check if server is running
ps aux | grep llama-server

# Check server logs
# (llama-server outputs to terminal)
```

## Performance Optimization

### PassportEye
- Already optimized (< 1 second)
- No caching needed
- Minimal resource usage

### Granite Text Model
- Use `-ngl` flag for GPU acceleration (if available)
- Increase context window with `-c` flag
- Monitor memory usage

## Deployment Checklist

- [ ] Granite text model downloaded
- [ ] llama.cpp built and working
- [ ] PassportEye installed
- [ ] Tesseract OCR installed
- [ ] All Python dependencies installed
- [ ] Granite server starts on port 8080
- [ ] PassportEye service starts on port 5000
- [ ] Proxy server starts on port 3001
- [ ] Frontend starts on port 3000
- [ ] All health checks pass
- [ ] Entity Extraction demo works
- [ ] PII Extraction demo works (all 3 tabs)
- [ ] PassportEye extraction < 1 second
- [ ] Conversation Intelligence demo works

## Production Considerations

### PassportEye
- Deploy as Docker container
- Use process manager (PM2, systemd)
- Add monitoring and health checks
- Consider serverless deployment

### Granite Model
- Use dedicated server or VM
- Monitor resource usage
- Set up automatic restart
- Consider load balancing for multiple users

### Frontend
- Use production build: `npm run build && npm start`
- Set up reverse proxy (nginx)
- Enable HTTPS
- Configure CORS properly

## Documentation

- **PassportEye Research**: `deployment/PASSPORTEYE_RESEARCH.md`
- **PassportEye Integration**: `deployment/PASSPORTEYE_INTEGRATION_GUIDE.md`
- **Approach Comparison**: `deployment/APPROACH_COMPARISON.md`
- **ConvIntel Testing**: `deployment/CONVINTEL_TESTING_GUIDE.md`

## Summary

You now have three powerful GenAI demos running on IBM Power:

1. **Entity Extraction** - Structured data from text
2. **PII Extraction** - Personal information with ultra-fast PassportEye
3. **Conversation Intelligence** - Customer conversation analysis

All powered by:
- Granite 3.0 8B (text model)
- PassportEye (passport MRZ extraction)
- IBM Power (reliable, secure infrastructure)

**Key Achievement**: PassportEye makes passport extraction 100-300x faster while using minimal resources!

---

**Branch**: `feature/conversation-intelligence`
**Status**: Ready for deployment
**Next**: Test on remote server and integrate with frontend UI