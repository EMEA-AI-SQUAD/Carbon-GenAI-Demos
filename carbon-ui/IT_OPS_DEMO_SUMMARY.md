# IT Ops Email Demo - Implementation Summary

## 🎯 Overview
Multilingual entity extraction demo showcasing Granite 4.0's ability to:
- Understand multiple languages (Italian & French)
- Extract entities and translate to English
- Assess true business priority vs. emotional urgency
- Handle different communication styles

---

## ✨ Features Implemented

### 1. **Dual Email Scenarios**

#### 🇮🇹 Italian Emotional Email (Low Priority)
- **Sender:** Marco Rossi, Sales Analyst
- **Language:** Italian
- **Tone:** Highly emotional, stressed, using capitals and exclamation marks
- **Issue:** Cannot generate monthly sales report for VP
- **Perceived Urgency:** CRITICAL (from sender's perspective)
- **Actual Priority:** LOW (report delay won't impact business operations)
- **Key Learning:** Shows AI can distinguish emotional urgency from business impact

#### 🇫🇷 French Professional Email (Critical Priority)
- **Sender:** Sophie Lefebvre, Logistics Manager
- **Language:** French
- **Tone:** Professional, technical, factual
- **Issue:** Climate control system failure in warehouse storing pressurized aerosols
- **Perceived Urgency:** High (professional assessment)
- **Actual Priority:** CRITICAL (safety risk - potential explosion, €47K in blocked shipments)
- **Key Learning:** Shows AI correctly identifies genuine safety and business risks

---

## 🎨 UI/UX Features

### Carbon Components Used:
1. **Toggle** - Switch between Italian and French scenarios
2. **Tile** - Display email previews side-by-side
3. **TextArea** - Editable email content
4. **DataTable** - Display extracted entities
5. **AILabel** - Mark AI-generated translations
6. **InlineNotification** - Loading and error states
7. **Pictograms** - MachineLearningModel (loading), DataBase (empty state)

### Visual Design:
- **Side-by-side comparison** of both emails
- **Selected email highlighted** with border and "SELECTED" badge
- **Non-selected email greyed out** (40% opacity)
- **Smooth transitions** (0.3s ease)
- **Flag emojis** (🇮🇹 🇫🇷) for quick visual identification
- **Responsive layout** adapts to screen size

---

## 📊 Entity Extraction

### Italian Email Entities:
1. Issue Type
2. Affected System
3. Error Message
4. Business Impact
5. Urgency Level
6. Emotional State
7. Deadline
8. Sender Name
9. Sender Role
10. **True Priority** (AI assessment)

### French Email Entities:
1. Issue Type
2. Affected System
3. Error Code
4. Business Impact
5. **Safety Risk** (unique to this scenario)
6. **Financial Impact** (€47,000)
7. Response Deadline
8. Sender Name
9. Sender Role
10. **True Priority** (AI assessment)

---

## 🔧 Technical Implementation

### File Structure:
```
carbon-ui/src/app/entextract/
├── page.js                 # Main page with tab implementation
├── it-ops-emails.js        # Email scenarios data
├── defaults.js             # Default values
├── messages.js             # Message building
└── postprocess.js          # Response parsing
```

### Key Functions:

**State Management:**
```javascript
const [selectedScenario, setSelectedScenario] = useState('italian_emotional');
```

**Scenario Switching:**
```javascript
onToggle={(checked) => {
  const newScenario = checked ? 'french_professional' : 'italian_emotional';
  setSelectedScenario(newScenario);
  const scenario = IT_OPS_SCENARIOS[newScenario];
  setValues({
    free_form_text: scenario.email,
    entities: scenario.entities
  });
  setExtractedRows([]);
  setErrorMsg('');
}}
```

**Dynamic Styling:**
```javascript
style={{
  opacity: selectedScenario === 'italian_emotional' ? 1 : 0.4,
  transition: 'opacity 0.3s ease',
  border: selectedScenario === 'italian_emotional' 
    ? '2px solid var(--cds-border-interactive)' 
    : '1px solid var(--cds-border-subtle)',
}}
```

---

## 🎓 Demo Value Proposition

### What This Demo Shows:

1. **Multilingual Capability**
   - Granite 4.0 understands Italian and French
   - Extracts entities accurately from non-English text
   - Translates results to English

2. **Context Understanding**
   - Distinguishes emotional language from factual reporting
   - Assesses true business impact vs. perceived urgency
   - Identifies safety risks and financial implications

3. **Priority Assessment**
   - Italian email: High emotional urgency → Low actual priority
   - French email: Professional tone → Critical actual priority
   - Shows AI can make objective business decisions

4. **Real-World Applicability**
   - IT operations teams receive emails in multiple languages
   - Need to triage based on actual impact, not just tone
   - Automated priority assessment saves time and improves response

---

## 💡 Use Cases

### IT Operations:
- Automatic ticket prioritization
- Multilingual support desk
- Sentiment vs. severity analysis
- SLA compliance (respond to critical issues first)

### Customer Service:
- Multilingual customer inquiries
- Emotion detection for escalation
- Priority routing based on actual impact

### Business Intelligence:
- Extract structured data from unstructured emails
- Cross-language data aggregation
- Trend analysis across regions

---

## 🚀 Demo Flow

1. **User sees two email tiles** side-by-side
2. **Toggle switches** between scenarios
3. **Selected email loads** into editable text area
4. **Entities auto-populate** based on scenario
5. **User clicks "Send Prompt to LLM"**
6. **AI processes** multilingual text
7. **Results display** in English with AI label
8. **User compares** priority assessments

---

## 📝 Key Insights from Demo

### Italian Email (Emotional):
- **Sender's perception:** "This is a DISASTER! I might lose my job!"
- **AI assessment:** Low priority - report delay won't impact business
- **Learning:** Emotional language ≠ high priority

### French Email (Professional):
- **Sender's tone:** Calm, professional, factual
- **AI assessment:** Critical - safety risk, financial impact, regulatory compliance
- **Learning:** Professional tone can mask critical issues

---

## 🎯 Success Metrics

Demo successfully demonstrates:
- ✅ Multilingual understanding (Italian, French → English)
- ✅ Sentiment analysis (emotional vs. professional)
- ✅ Priority assessment (perceived vs. actual)
- ✅ Safety risk identification
- ✅ Financial impact extraction
- ✅ Context-aware entity extraction
- ✅ Professional UI/UX with Carbon Design System

---

## 🔄 Future Enhancements (Optional)

1. **Add more languages** (Spanish, German, Japanese)
2. **Sentiment scoring** (0-10 scale)
3. **Priority color coding** (red=critical, yellow=medium, green=low)
4. **Response time suggestions** based on priority
5. **Email templates** for responses
6. **Historical comparison** (show past similar incidents)

---

## 📚 Documentation

- Email scenarios: `it-ops-emails.js`
- Implementation: `page.js` (IT Ops tab)
- Styling: Uses Carbon design tokens
- Components: Toggle, Tile, DataTable, AILabel

---

**Created by Bob (Roo-Cline AI Assistant)**
**Date:** 2026-03-09
**Status:** ✅ Ready for Testing