# Granite Vision Integration - Testing Guide

## Overview
This guide covers testing the Granite Vision 3.3 2B integration for Tab 2 (Passport Verification) of the PII Extraction demo.

## What Changed

### 1. **Proxy Server** (`carbon-ui/src/llama-proxy/server_final.js`)
- Added `/vision` route that forwards to port 8082
- Maintains existing text model route to port 8080

### 2. **Vision API Client** (`carbon-ui/src/app/piiextract/vision-extraction.js`)
- `imageToBase64()` - Converts image to base64
- `extractFromPassportImage()` - Calls vision API with image
- `prewarmVisionCache()` - Pre-loads vision processing

### 3. **Frontend** (`carbon-ui/src/app/piiextract/page.js`)
- Added vision-specific state (visionLoading, visionCached, visionError)
- Auto-triggers vision processing when Tab 2 is selected
- Removed OCR text area and manual entity fields from Tab 2
- Updated UI to show vision processing status
- Results auto-populate when vision processing completes

## Testing Steps

### Prerequisites
Ensure both servers are running:
```bash
# Terminal 1: Vision server (port 8082)
./deployment/start-vision-server.sh

# Terminal 2: Text model server (port 8080)
cd llama.cpp
./llama-server -m models/granite-3.0-8b-instruct.Q4_K_M.gguf -c 4096 --port 8080

# Terminal 3: Proxy server (port 3001)
cd carbon-ui/src/llama-proxy
node server_final.js

# Terminal 4: Next.js dev server (port 3000)
cd carbon-ui
npm run dev
```

### Test 1: Vision Server Health Check
```bash
curl http://localhost:8082/health
# Expected: {"status":"ok"}
```

### Test 2: Proxy Vision Route
```bash
curl http://localhost:3001/vision/health
# Expected: {"status":"ok"}
```

### Test 3: Frontend Integration

1. **Open Browser**: Navigate to `http://p1270-pvm1.p1270.cecc.ihost.com:3000/piiextract`

2. **Tab 1 (Fraud Complaint)**: 
   - Should work as before (text-based extraction)
   - Uses port 8080 text model

3. **Tab 2 (Passport Verification)**:
   - Click on Tab 2
   - **Expected behavior**:
     - Loading indicator appears immediately
     - Message: "Granite Vision 3.3 2B is reading the passport directly..."
     - Processing time: 4-5 minutes (first run) or 20-30 seconds (cached)
     - Results auto-populate in table when complete
   
   - **What to verify**:
     - ✅ Passport image displays
     - ✅ Loading state shows during processing
     - ✅ No OCR text area (removed)
     - ✅ No manual entity fields (removed)
     - ✅ Automatic processing message displays
     - ✅ Results table populates with extracted data
     - ✅ Data includes: Passport Number, Surname, Given Names, etc.

4. **Tab 3 (Document Discovery)**:
   - Should work as before (text-based extraction)
   - Uses port 8080 text model

### Test 4: Error Handling

**Scenario A: Vision server not running**
1. Stop vision server: `pkill -f 'llama-server.*8082'`
2. Navigate to Tab 2
3. **Expected**: Error notification appears with connection error

**Scenario B: Vision server timeout**
1. Monitor browser console for timeout errors
2. **Expected**: Graceful error handling, user-friendly message

### Test 5: Cache Verification

1. **First load**: Navigate to Tab 2, wait for completion (~4-5 min)
2. **Switch tabs**: Go to Tab 1, then back to Tab 2
3. **Expected**: Results load much faster (~20-30 seconds) due to caching

### Test 6: Browser Console Logs

Check for these log messages:
```
Tab 2 selected - pre-warming vision cache...
Converting image to base64...
Image encoded: XXXXX characters
Vision prompt: Read this passport and extract...
Calling Granite Vision API...
Raw vision model response: {...}
Vision cache pre-warmed successfully
```

## Expected Results

### Successful Vision Extraction
```json
{
  "Passport Number": "023477812",
  "Surname": "BEAN",
  "Given Names": "MR",
  "Nationality": "BRITISH",
  "Date of Birth": "06 JAN/JA",
  "Sex": "M",
  "Place of Birth": "ENFIELD",
  "Issue Date": "20 SEP/SEP 06",
  "Expiry Date": "20 SEP/SEP 06",
  "Issuing Authority": "UNITED KINGDOM PASSPORT AGENCY"
}
```

## Performance Benchmarks

| Scenario | Expected Time | Notes |
|----------|--------------|-------|
| First vision call | 4-5 minutes | Model processes full image |
| Cached vision call | 20-30 seconds | Cached response |
| Text extraction (Tab 1/3) | 5-10 seconds | Unchanged |

## Troubleshooting

### Issue: Vision processing never completes
**Check**:
- Vision server running on port 8082
- Proxy forwarding to correct port
- Browser console for errors
- Server logs for processing status

### Issue: "Vision proxy error"
**Solution**:
- Verify vision server is running
- Check proxy server logs
- Restart proxy server

### Issue: Results don't auto-populate
**Check**:
- Browser console for JavaScript errors
- Verify `visionCached` state updates
- Check `extractedRows` state in React DevTools

### Issue: Slow performance even when cached
**Possible causes**:
- Cache not working (check server logs)
- Network latency
- Browser throttling

## Rollback Plan

If vision integration has issues:

1. **Switch to main branch**:
   ```bash
   git checkout main
   ```

2. **Restart servers**:
   ```bash
   # Only need text model and proxy
   pkill -f llama-server
   cd llama.cpp
   ./llama-server -m models/granite-3.0-8b-instruct.Q4_K_M.gguf -c 4096 --port 8080
   ```

3. **Main branch uses OCR text** - Tab 2 will show text area with pre-extracted OCR content

## Success Criteria

✅ All three tabs functional
✅ Tab 2 auto-processes passport image
✅ Vision extraction completes successfully
✅ Results display in structured table
✅ Caching improves subsequent loads
✅ Error handling works gracefully
✅ No regression in Tab 1 or Tab 3

## Next Steps After Successful Testing

1. Document in main README
2. Commit changes to feature branch
3. Create pull request
4. Merge to main branch
5. Update deployment documentation