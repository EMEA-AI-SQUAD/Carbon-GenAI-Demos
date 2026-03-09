# Carbon Design System Review & Recommendations

## Executive Summary
Your Carbon implementation is **very solid**! The pages follow Carbon best practices well. Below are my findings and recommendations for improvements, including adding the AI label for LLM-generated content.

---

## ✅ What You're Doing Right

### 1. **Proper Component Usage**
- Correct use of Grid/Column system with responsive breakpoints
- Proper Carbon components (Breadcrumb, Tabs, Button, DataTable, etc.)
- Good use of Carbon icons from `@carbon/icons-react`

### 2. **Accessibility**
- Proper `aria-label` attributes on navigation elements
- Semantic HTML structure
- Skip to content link in header

### 3. **Theme Implementation**
- Using Carbon's g100 (dark) theme consistently
- Proper Theme wrapper in providers

### 4. **Navigation Structure**
- Clean header with proper navigation
- Responsive side navigation
- Good use of HeaderContainer pattern

---

## 🎯 Key Recommendation: Add AI Label

### **Carbon's AI Label Component**
Carbon has a dedicated `AILabel` component specifically for marking AI-generated content. This is **exactly** what you need for your LLM output!

**Where to add it:** In the Entity Extraction results table (lines 241-280 in `entextract/page.js`)

### **Implementation Options:**

#### Option 1: AI Label on Table Container (Recommended)
Add the AI label to indicate the entire results table contains AI-generated content:

```jsx
import { AILabel, AILabelContent, AILabelActions } from '@carbon/react';

// In your results section:
<TableContainer
  title={
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span>Extracted Entities</span>
      <AILabel size="sm">
        <AILabelContent>
          <div>
            <p className="secondary">AI Generated</p>
            <p className="secondary">Content extracted by Granite 4.0 LLM</p>
          </div>
        </AILabelContent>
      </AILabel>
    </div>
  }
  description="Entities extracted from your text using AI"
>
```

#### Option 2: Inline AI Label Badge
Add a simple inline badge next to the results:

```jsx
import { AILabel } from '@carbon/react';

// Before the DataTable:
<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
  <h4>Results</h4>
  <AILabel size="sm" />
</div>
```

---

## 📋 Additional Recommendations

### 1. **Error Handling Enhancement**
**Issue:** Line 109 has a typo - `e?.message` should be `err?.message`

**Fix:**
```jsx
// Line 109 in entextract/page.js
setErrorMsg(err?.message || 'Failed to contact the LLM.');
```

### 2. **Add Error Display**
**Issue:** You set `errorMsg` but never display it to the user

**Fix:** Add after line 218:
```jsx
{errorMsg && (
  <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
    <InlineNotification
      kind="error"
      title="Error"
      subtitle={errorMsg}
      onCloseButtonClick={() => setErrorMsg('')}
      lowContrast
    />
  </Column>
)}
```

### 3. **Loading State Improvements**
**Current:** Good use of DataTableSkeleton ✅

**Enhancement:** Consider adding a loading message:
```jsx
{isLoading && (
  <div style={{ marginBottom: '1rem' }}>
    <InlineNotification
      kind="info"
      title="Processing"
      subtitle="Sending your prompt to the LLM..."
      hideCloseButton
      lowContrast
    />
  </div>
)}
```

### 4. **Typo Fixes**
- Line 136: "unscructured" → "unstructured"
- Line 113: "reliablity" → "reliability"

### 5. **Button Accessibility**
**Enhancement:** Add more descriptive aria-label:
```jsx
<Button 
  className="send-to-llm-class" 
  onClick={()=>completion()} 
  disabled={isLoading}
  aria-label="Send prompt to Large Language Model for entity extraction"
>
```

### 6. **Unused Component**
**Issue:** `EntExtractTable.js` is imported but never used in the page

**Options:**
- Remove the import if not needed
- Or integrate it if you plan to use expandable rows

### 7. **Add Carbon AI Components Package**
**Current:** Using `@carbon/react` v1.33.0

**Recommendation:** Ensure you have the latest AI components. Check if you need to update:
```bash
npm install @carbon/react@latest
```

The `AILabel` component is available in Carbon v11.33.0+

---

## 🎨 Design Pattern Suggestions

### 1. **Empty State Enhancement**
Instead of plain text, use Carbon's EmptyState pattern:

```jsx
import { NoDataIllustration } from '@carbon/pictograms-react';

// Replace line 236-238:
<div style={{ textAlign: 'center', padding: '3rem' }}>
  <NoDataIllustration />
  <h4>No results yet</h4>
  <p>Edit the text and entities, then click Send Prompt to LLM.</p>
</div>
```

### 2. **Add Tooltips for Entity Definitions**
Help users understand what each entity means:

```jsx
import { Tooltip } from '@carbon/react';

<Tooltip align="bottom" label={f.definition}>
  <span>{f.label}</span>
</Tooltip>
```

### 3. **Progressive Disclosure**
Consider using an Accordion for the entity definitions section to reduce visual clutter:

```jsx
import { Accordion, AccordionItem } from '@carbon/react';

<Accordion>
  <AccordionItem title="Entity Definitions (click to expand)">
    {/* Your entity TextAreas here */}
  </AccordionItem>
</Accordion>
```

---

## 🔧 Code Quality Improvements

### 1. **Extract Magic Numbers**
```jsx
// At top of file:
const DEFAULT_SKELETON_ROWS = 3;
const TABLE_COLUMN_COUNT = 2;

// Use in skeleton:
rowCount={Math.max(DEFAULT_SKELETON_ROWS, values.entities.filter(e => (e.label || '').trim()).length)}
columnCount={TABLE_COLUMN_COUNT}
```

### 2. **Memoize Expensive Computations**
```jsx
const expectedKeys = useMemo(() => getExpectedKeys(values), [values]);
const labelMap = useMemo(() => buildKeyLabelMap(values), [values]);
```

### 3. **Add PropTypes or TypeScript**
Consider converting to TypeScript for better type safety, especially with the LLM response parsing.

---

## 📦 Recommended Package Additions

```json
{
  "@carbon/pictograms-react": "^11.x.x",  // For empty states
  "@carbon/charts-react": "^1.x.x"        // If you want to visualize data
}
```

---

## 🎯 Priority Implementation Order

1. **HIGH PRIORITY:**
   - Add AI Label to results table ⭐
   - Fix error message typo (line 109)
   - Display error messages to users

2. **MEDIUM PRIORITY:**
   - Fix typos in text content
   - Add loading notification
   - Improve button accessibility

3. **LOW PRIORITY:**
   - Empty state enhancement
   - Add tooltips
   - Code quality improvements

---

## 📚 Carbon Resources

- **AI Components:** https://carbondesignsystem.com/components/AI-label/usage/
- **Data Table:** https://carbondesignsystem.com/components/data-table/usage/
- **Notifications:** https://carbondesignsystem.com/components/notification/usage/
- **Design Patterns:** https://carbondesignsystem.com/patterns/overview/

---

## Summary

Your implementation is **excellent** and follows Carbon best practices well! The main enhancement needed is adding the `AILabel` component to clearly mark AI-generated content, which is both a best practice and helps with transparency. The other recommendations are minor improvements that will enhance user experience and code maintainability.

Would you like me to implement any of these recommendations for you?