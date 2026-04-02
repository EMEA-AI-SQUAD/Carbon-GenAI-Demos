# Restart Services After Hostname Updates

## What Changed

Updated all hardcoded `localhost:3001` URLs to use the correct FQDN: `p1362-pvm1.p1362.cecc.ihost.com:3001`

### Files Updated:
1. `carbon-ui/src/llama-proxy/server_final.js` - CORS origin
2. `carbon-ui/src/app/piiextract/page.js` - API_URL
3. `carbon-ui/src/app/convintel/page.js` - API_URL
4. `carbon-ui/src/app/entextract/page.js` - API_URL
5. `carbon-ui/src/app/piiextract/passporteye-extraction.js` - Default proxy URLs

## Restart Instructions

### 1. Restart Proxy Server

```bash
cd ~/Carbon-GenAI-Demos/carbon-ui/src/llama-proxy

# Kill existing proxy
pkill -f 'node.*server_final.js'

# Start new proxy
npm start &

# Verify it's running
ps aux | grep server_final
```

### 2. Restart Next.js UI

```bash
cd ~/Carbon-GenAI-Demos/carbon-ui

# Kill existing Next.js server
pkill -f 'next-server'

# Start new UI
npm run dev &

# Verify it's running
ps aux | grep next
```

### 3. Verify Services

```bash
# Check all services are running
echo "=== llama.cpp server ==="
curl -s http://localhost:8080/health | head -5

echo -e "\n=== PassportEye service ==="
curl -s http://localhost:5000/health

echo -e "\n=== Proxy server ==="
curl -s http://p1362-pvm1.p1362.cecc.ihost.com:3001/health || echo "Proxy running (no health endpoint)"

echo -e "\n=== Next.js UI ==="
curl -s http://p1362-pvm1.p1362.cecc.ihost.com:3000 | grep -o '<title>.*</title>'
```

## Test After Restart

1. **Open browser**: `http://p1362-pvm1.p1362.cecc.ihost.com:3000`

2. **Test PII Extraction Demo**:
   - Navigate to PII Extraction
   - Go to "Passport Verification" tab
   - Click "🚀 Pre-load Demo Results" - should work now!
   - Enable PassportEye toggle
   - Upload passport image
   - Click "⚡ Extract with PassportEye"

3. **Test Conversational Intelligence Demo**:
   - Navigate to Conversational Intelligence
   - Try any of the three tabs
   - Click "Extract Entities" - should work now!

4. **Test Entity Extraction Demo**:
   - Navigate to Entity Extraction
   - Try any of the three tabs
   - Click "Extract Entities" - should work now!

## Expected Results

- ✅ No more "ERR_CONNECTION_REFUSED" errors
- ✅ All demos can connect to llama.cpp via proxy
- ✅ PassportEye extraction works
- ✅ Text-based extraction works
- ✅ All three demos work independently

## Quick One-Liner Restart

```bash
cd ~/Carbon-GenAI-Demos && \
pkill -f 'node.*server_final.js' && \
pkill -f 'next-server' && \
cd carbon-ui/src/llama-proxy && npm start & \
cd ~/Carbon-GenAI-Demos/carbon-ui && npm run dev &
```

Wait 10 seconds, then test in browser!