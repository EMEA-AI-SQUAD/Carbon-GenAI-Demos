# Passport Verification Feature

## Overview

The passport extraction demo now includes a **privacy-preserving verification system** that validates passport data without exposing sensitive personal information. Instead of showing redacted text, the system displays a clear verification status (ALLOWED/DENIED/WARNING).

## Key Changes

### 1. Updated Default Text (defaults.js)

**Before**: Showed full passport details including fields PassportEye cannot extract
**After**: Shows only MRZ (Machine Readable Zone) data that PassportEye actually extracts

```
MRZ DATA (Machine Readable Zone):
Passport Number: P<GBRBEAN<<ROWAN<SEBASTIAN<<<<<<<<<<<<<<<
Nationality Code: GBR
Date of Birth: 550106
Sex: M
Expiry Date: 250915
Country Code: GBR
```

### 2. Verification Logic (page.js)

Added `verifyPassport()` function that checks:

- **Required Fields**: Ensures passport_number, surname, given_names, and expiry_date are present
- **Expiry Date Validation**: 
  - Parses dates in YYMMDD or YYYYMMDD format
  - Checks if passport is expired
  - Warns if expiry is within 180 days
- **Status Determination**:
  - `ALLOWED` (green ✓): All checks passed
  - `WARNING` (orange ⚠): Expiring soon or minor issues
  - `DENIED` (red ✗): Expired or missing required fields

### 3. UI Changes

**Passport Tab Only** (activeTab === 1):
- Replaced "Redacted OCR Text" with "Verification Status"
- Shows color-coded status badge (green/orange/red)
- Lists specific issues and warnings
- Displays verification timestamp
- Emphasizes privacy: "Passport details remain private while providing verification result"

**Other Tabs** (Customer Complaint, GDPR Audit):
- Continue to show redacted text as before
- No changes to existing functionality

## Privacy Benefits

### Traditional Approach (Redacted Text)
```
Passport Number: [REDACTED]
Name: [REDACTED] [REDACTED]
Date of Birth: [REDACTED]
Expiry Date: [REDACTED]
```
**Problem**: Still shows structure and field names, aggressive redaction breaks words

### New Approach (Verification Status)
```
✓ ALLOWED

All verification checks passed. Passport details remain 
private while providing verification result.

Verified at: 4/2/2026, 2:45:30 PM
```
**Benefits**: 
- No personal data exposed
- Clear actionable result
- Maintains complete privacy
- Suitable for access control systems

## Use Case: Visitor Registration

**Scenario**: Security checkpoint needs to verify passport validity without storing personal data

**Workflow**:
1. Upload passport image
2. PassportEye extracts MRZ data (< 1 second)
3. Granite 4.0 parses and validates data
4. System shows ALLOWED/DENIED status
5. Security grants/denies access
6. **No personal data is logged or stored**

## Technical Implementation

### State Management
```javascript
const [verificationStatus, setVerificationStatus] = useState(null);
```

### Conditional Logic
```javascript
if (activeTab === 1) {
  // Passport tab: generate verification status
  const verification = verifyPassport(finalObj);
  setVerificationStatus(verification);
  setRedactedText('');
} else {
  // Other tabs: generate redacted text
  // ... existing redaction logic
}
```

### Verification Object Structure
```javascript
{
  status: 'ALLOWED' | 'WARNING' | 'DENIED',
  statusColor: 'green' | 'orange' | 'red',
  statusIcon: '✓' | '⚠' | '✗',
  issues: ['Passport has expired'],
  warnings: ['Passport expires in 45 days'],
  timestamp: '2026-04-02T14:45:30.000Z'
}
```

## Date Parsing

Handles multiple MRZ date formats:
- **YYMMDD**: `250915` → September 15, 2025
- **YYYYMMDD**: `20250915` → September 15, 2025
- **ISO Format**: `2025-09-15` → September 15, 2025

## Testing

### Test Case 1: Valid Passport
```
Expiry Date: 250915 (Sep 15, 2025)
Expected: ✓ ALLOWED
```

### Test Case 2: Expired Passport
```
Expiry Date: 200315 (Mar 15, 2020)
Expected: ✗ DENIED - "Passport has expired"
```

### Test Case 3: Expiring Soon
```
Expiry Date: 260615 (Jun 15, 2026) [75 days from now]
Expected: ⚠ WARNING - "Passport expires in 75 days"
```

### Test Case 4: Missing Fields
```
Passport Number: (empty)
Expected: ✗ DENIED - "Missing required fields: passport_number"
```

## Future Enhancements

1. **Additional Validations**:
   - Check digit validation for passport numbers
   - Age verification (must be 18+)
   - Nationality restrictions

2. **Audit Logging**:
   - Log verification attempts (without personal data)
   - Track DENIED attempts for security monitoring

3. **Integration Options**:
   - REST API endpoint for verification
   - Webhook notifications for access control systems
   - Database logging of verification status only

## Comparison: Before vs After

| Aspect | Before (Redacted Text) | After (Verification Status) |
|--------|------------------------|----------------------------|
| **Privacy** | Shows field structure | No personal data exposed |
| **Clarity** | Unclear what's redacted | Clear ALLOWED/DENIED result |
| **Actionable** | Requires interpretation | Direct access decision |
| **Logging** | Unsafe to log | Safe to log status only |
| **Use Case** | Document sanitization | Access control verification |

## Conclusion

The verification status approach is **ideal for passport validation use cases** where:
- Privacy is paramount
- Clear yes/no decisions are needed
- Personal data should never be logged
- Access control systems need simple integration

For document sanitization use cases (Customer Complaint, GDPR Audit), the redacted text approach remains appropriate.