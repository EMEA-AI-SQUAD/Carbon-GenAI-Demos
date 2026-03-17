# Fresh Instance Testing Plan

## Objective
Test the Granite Vision integration on a clean IBM Power instance to isolate the DataTable rendering error.

## Current Issue
- **Error**: "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined"
- **When**: Only occurs after clicking "Extract PII" button and rendering LLM results
- **Where**: DataTable component fails to render
- **Environment**: Existing server may have corrupted state or dependency conflicts

## Testing Steps for Fresh Instance

### Phase 1: Test Main Branch (Baseline)
```bash
# Clone repository
cd ~
git clone https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos.git
cd Carbon-GenAI-Demos

# Ensure on main branch
git checkout main

# Install dependencies
cd carbon-ui
npm install

# Start dev server
npm run dev
```

**Test Checklist:**
- [ ] Home page loads
- [ ] Navigate to PII Extract page
- [ ] Click "Extract PII" on Tab 1
- [ ] Verify DataTable renders with results
- [ ] Test Tab 3 (Document Scan)
- [ ] Navigate to Entity Extract page
- [ ] Test entity extraction
- [ ] **Document if DataTable error occurs on main branch**

### Phase 2: Test Feature Branch (Vision Integration)
```bash
# Switch to feature branch
cd ~/Carbon-GenAI-Demos
git checkout feature/granite-vision-integration

# Clean install
cd carbon-ui
rm -rf node_modules package-lock.json .next
npm install

# Update FQDN for CORS (replace with actual FQDN)
sed -i 's/localhost:3000/YOUR-FQDN:3000/g' src/app/piiextract/page.js
sed -i 's/localhost:3000/YOUR-FQDN:3000/g' src/app/entextract/page.js

# Start dev server
npm run dev
```

**Test Checklist:**
- [ ] All tests from Phase 1
- [ ] Tab 2 (Passport Verification) - vision processing
- [ ] Verify automatic vision extraction on Tab 2 load
- [ ] Check for DataTable rendering errors
- [ ] Compare behavior with main branch

### Phase 3: Setup Vision Server (If Phase 2 Passes)
```bash
# Download Granite Vision model
cd ~/Carbon-GenAI-Demos/deployment
chmod +x setup-granite-vision.sh
./setup-granite-vision.sh

# Start vision server
chmod +x start-vision-server.sh
./start-vision-server.sh
```

**Test Checklist:**
- [ ] Vision server starts on port 8082
- [ ] Tab 2 processes passport image
- [ ] Results display in DataTable
- [ ] Performance: First run ~4-5 min, cached ~20-30 sec

## Diagnostic Information to Collect

### If Error Occurs:
```bash
# Check versions
node --version
npm --version
npm list next
npm list @carbon/react
npm list react

# Check for conflicting packages
npm list | grep -i link
npm list | grep -i carbon

# Browser console
# - Full error stack trace
# - Network tab for failed requests
# - React DevTools component tree
```

### Environment Details:
- OS: IBM Power (ppc64le)
- Node version: 16.20.2 (expected)
- Architecture: ppc64le
- Available memory
- Disk space

## Expected Outcomes

### Scenario A: Error on Both Branches
**Conclusion**: Pre-existing issue, not caused by vision integration
**Action**: Investigate Carbon React compatibility with Next.js 13.4.9

### Scenario B: Error Only on Feature Branch
**Conclusion**: Vision integration changes introduced the bug
**Action**: Review all changes between main and feature branch

### Scenario C: No Error on Fresh Instance
**Conclusion**: Environment-specific issue on original server
**Action**: Document clean setup procedure, deprecate old instance

## Key Files to Monitor

### Modified in Feature Branch:
- `carbon-ui/src/app/piiextract/page.js` - Added vision processing
- `carbon-ui/src/app/piiextract/vision-extraction.js` - New file
- `carbon-ui/src/llama-proxy/server_final.js` - Added /vision route
- `carbon-ui/package.json` - Added openai dependency

### Removed in Feature Branch:
- `carbon-ui/src/app/entextract/page_orig.js` - Backup file with Link imports

## Rollback Plan

If feature branch has issues:
```bash
cd ~/Carbon-GenAI-Demos
git checkout main
cd carbon-ui
rm -rf node_modules .next
npm install
npm run dev
```

## Success Criteria

✅ **Main branch works perfectly** - Baseline confirmed
✅ **Feature branch DataTable renders** - No regression
✅ **Vision processing works** - Tab 2 extracts passport data
✅ **Performance acceptable** - Cached responses under 30 seconds
✅ **All three tabs functional** - No breaking changes

## Notes

- Fresh instance eliminates variables: corrupted cache, wrong dependencies, environment conflicts
- If main branch fails, issue predates vision integration
- If feature branch fails, we can bisect commits to find the breaking change
- Document exact setup steps that work for future deployments