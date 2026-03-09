# Carbon Pictograms Usage Examples

## What are Carbon Pictograms?

Carbon pictograms are **large, illustrative icons** (typically 48px+) used to:
- Enhance empty states
- Illustrate concepts in hero sections
- Add visual interest to feature descriptions
- Guide users through onboarding

They're different from regular icons - they're more detailed and decorative.

---

## Example 1: Empty State in Entity Extraction (RECOMMENDED)

### Current State (Plain Text)
```jsx
// Lines 234-238 in entextract/page.js
<p>
  No results yet. Edit the text and entities, then click <em>Send Prompt to LLM</em>.
</p>
```

### Enhanced with Pictogram
```jsx
import { DataBase } from '@carbon/pictograms-react';

// Replace the plain text with:
<div style={{ 
  textAlign: 'center', 
  padding: '3rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem'
}}>
  <DataBase style={{ fill: 'var(--cds-icon-secondary)' }} />
  <h4 style={{ margin: 0 }}>No entities extracted yet</h4>
  <p style={{ 
    color: 'var(--cds-text-secondary)', 
    maxWidth: '400px',
    margin: 0 
  }}>
    Edit the text and entity definitions above, then click 
    <strong> Send Prompt to LLM</strong> to extract structured data.
  </p>
</div>
```

**Visual Result:**
```
    [Database Icon]
    
    No entities extracted yet
    
    Edit the text and entity definitions above,
    then click Send Prompt to LLM to extract
    structured data.
```

---

## Example 2: Feature Sections on Home Page

You could enhance your "Principles" section with pictograms:

```jsx
import { 
  Security, 
  CloudDataOps, 
  Enterprise 
} from '@carbon/pictograms-react';

// In your home page, lines 89-115:
<Column lg={16} md={8} sm={4} className="landing-page__r3">
  <Grid>
    <Column lg={4} md={2} sm={4}>
      <h3 className="landing-page__label">The Principles</h3>
    </Column>
    
    {/* Principle 1 with pictogram */}
    <Column
      lg={{ start: 5, span: 3 }}
      md={{ start: 3, span: 6 }}
      sm={4}
      className="landing-page__title"
      style={{ textAlign: 'center' }}>
      <CloudDataOps style={{ marginBottom: '1rem' }} />
      <div>Run GenAI Models where your data lives</div>
    </Column>
    
    {/* Principle 2 with pictogram */}
    <Column
      lg={{ start: 9, span: 3 }}
      md={{ start: 3, span: 6 }}
      sm={4}
      className="landing-page__title"
      style={{ textAlign: 'center' }}>
      <Security style={{ marginBottom: '1rem' }} />
      <div>Ensure data sovereignty</div>
    </Column>
    
    {/* Principle 3 with pictogram */}
    <Column
      lg={{ start: 13, span: 3 }}
      md={{ start: 3, span: 6 }}
      sm={4}
      className="landing-page__title"
      style={{ textAlign: 'center' }}>
      <Enterprise style={{ marginBottom: '1rem' }} />
      <div>Legendary reliability</div>
    </Column>
  </Grid>
</Column>
```

---

## Example 3: Loading State Enhancement

Add a pictogram to make loading more engaging:

```jsx
import { MachineLearningModel } from '@carbon/pictograms-react';

{isLoading && (
  <div style={{ 
    textAlign: 'center', 
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  }}>
    <MachineLearningModel 
      style={{ 
        fill: 'var(--cds-icon-primary)',
        animation: 'pulse 2s ease-in-out infinite'
      }} 
    />
    <InlineNotification
      kind="info"
      title="Processing"
      subtitle="Granite 4.0 is analyzing your text..."
      hideCloseButton
      lowContrast
    />
  </div>
)}
```

---

## Example 4: Error State with Pictogram

```jsx
import { Warning } from '@carbon/pictograms-react';

{errorMsg && (
  <div style={{ 
    textAlign: 'center', 
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  }}>
    <Warning style={{ fill: 'var(--cds-support-error)' }} />
    <InlineNotification
      kind="error"
      title="Error"
      subtitle={errorMsg}
      onCloseButtonClick={() => setErrorMsg('')}
      lowContrast
    />
  </div>
)}
```

---

## Relevant Pictograms for Your Use Case

### AI/ML Related:
- `MachineLearningModel` - Perfect for AI processing
- `DataBase` - For data extraction
- `DataProcessing` - For entity processing
- `Analytics` - For results display
- `NeuralNetwork` - For AI/ML concepts

### Infrastructure Related:
- `CloudDataOps` - For cloud/Power systems
- `Security` - For data sovereignty
- `Enterprise` - For reliability
- `ServerOperatingSystems` - For IBM Power

### User Experience:
- `NoDataIllustration` - Empty states
- `Warning` - Errors
- `CheckmarkOutline` - Success states
- `DocumentBlank` - No documents/text

---

## Installation

```bash
npm install @carbon/pictograms-react
```

Or if already installed, verify version:
```bash
npm list @carbon/pictograms-react
```

---

## Best Practices

1. **Size**: Pictograms should be 48px or larger (default is 64px)
2. **Color**: Use Carbon design tokens for colors:
   - `var(--cds-icon-primary)` - Main color
   - `var(--cds-icon-secondary)` - Subtle/disabled
   - `var(--cds-support-error)` - Errors
   - `var(--cds-support-success)` - Success
3. **Spacing**: Give pictograms breathing room (2-3rem padding)
4. **Context**: Always pair with descriptive text
5. **Accessibility**: Pictograms are decorative, ensure text conveys the message

---

## Quick Implementation for Your Demo

**Priority 1: Empty State** (Most impactful)
```jsx
// In entextract/page.js, replace lines 234-238
import { DataBase } from '@carbon/pictograms-react';

<div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
  <DataBase style={{ fill: 'var(--cds-icon-secondary)', marginBottom: '1rem' }} />
  <h4>No entities extracted yet</h4>
  <p style={{ color: 'var(--cds-text-secondary)' }}>
    Edit the text and entities, then click <strong>Send Prompt to LLM</strong>.
  </p>
</div>
```

**Priority 2: Loading State**
```jsx
import { MachineLearningModel } from '@carbon/pictograms-react';

{isLoading && (
  <div style={{ textAlign: 'center', padding: '2rem' }}>
    <MachineLearningModel style={{ fill: 'var(--cds-icon-primary)' }} />
    <p>Processing with Granite 4.0...</p>
  </div>
)}
```

---

## Visual Comparison

### Before (Plain Text):
```
No results yet. Edit the text and entities, 
then click Send Prompt to LLM.
```

### After (With Pictogram):
```
        ┌─────────┐
        │  [DB]   │  ← Large database pictogram
        └─────────┘
        
    No entities extracted yet
    
    Edit the text and entities, then
    click Send Prompt to LLM.
```

Much more engaging and professional! 🎨

---

## Browse All Pictograms

- **Online Gallery**: https://carbondesignsystem.com/guidelines/pictograms/library
- **React Storybook**: https://react.carbondesignsystem.com/?path=/story/pictograms--default
- **Search by keyword**: "AI", "data", "cloud", "security", etc.

---

Would you like me to implement any of these examples in your code?