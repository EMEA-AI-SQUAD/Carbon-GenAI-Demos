/**
 * PassportEye OCR Extraction Module
 * 
 * Provides fast passport MRZ extraction using the PassportEye service.
 * This is significantly faster than vision models (< 1 second vs 4-5 minutes).
 */

/**
 * Extract passport data using PassportEye OCR service
 * @param {string} imageBase64 - Base64 encoded passport image
 * @param {string} proxyUrl - URL of the proxy server (default: http://p1362-pvm1.p1362.cecc.ihost.com:3001)
 * @returns {Promise<Object>} Extraction results with MRZ data
 */
export async function extractPassportWithPassportEye(imageBase64, proxyUrl = 'http://p1362-pvm1.p1362.cecc.ihost.com:3001') {
  try {
    console.log('🔍 Starting PassportEye extraction...');
    const startTime = Date.now();

    // Call PassportEye service via proxy
    const response = await fetch(`${proxyUrl}/passporteye/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PassportEye service error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`✅ PassportEye extraction completed in ${duration}s`);
    console.log('Raw MRZ data:', result);

    // Check if MRZ was found
    if (!result.mrz_data) {
      return {
        success: false,
        error: 'No MRZ data found in passport image',
        duration,
        rows: []
      };
    }

    // Format the MRZ data for display
    const mrzData = result.mrz_data;
    const rows = [
      { label: 'Document Type', value: mrzData.type || 'P (Passport)' },
      { label: 'Passport Number', value: mrzData.number || 'Not found' },
      { label: 'Surname', value: mrzData.surname || 'Not found' },
      { label: 'Given Names', value: mrzData.names || 'Not found' },
      { label: 'Nationality', value: mrzData.nationality || 'Not found' },
      { label: 'Date of Birth', value: mrzData.date_of_birth || 'Not found' },
      { label: 'Sex', value: mrzData.sex || 'Not found' },
      { label: 'Expiry Date', value: mrzData.expiration_date || 'Not found' },
      { label: 'Country Code', value: mrzData.country || 'Not found' },
    ];

    // Add optional fields if available
    if (mrzData.personal_number) {
      rows.push({ label: 'Personal Number', value: mrzData.personal_number });
    }

    return {
      success: true,
      duration,
      mrzData,
      rows,
      rawText: JSON.stringify(mrzData, null, 2)
    };

  } catch (error) {
    console.error('❌ PassportEye extraction error:', error);
    return {
      success: false,
      error: error.message,
      rows: []
    };
  }
}

/**
 * Convert image file to base64 string
 * @param {File} file - Image file from file input
 * @returns {Promise<string>} Base64 encoded image
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Check if PassportEye service is available
 * @param {string} proxyUrl - URL of the proxy server
 * @returns {Promise<boolean>} True if service is available
 */
export async function checkPassportEyeAvailability(proxyUrl = 'http://p1362-pvm1.p1362.cecc.ihost.com:3001') {
  try {
    const response = await fetch(`${proxyUrl}/passporteye/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn('PassportEye service not available:', error.message);
    return false;
  }
}

/**
 * Format MRZ data for text display
 * @param {Object} mrzData - MRZ data from PassportEye
 * @returns {string} Formatted text representation
 */
export function formatMRZForDisplay(mrzData) {
  if (!mrzData) return 'No MRZ data available';

  return `PASSPORT INFORMATION (from MRZ)

Document Type: ${mrzData.type || 'P (Passport)'}
Passport Number: ${mrzData.number || 'Not found'}
Surname: ${mrzData.surname || 'Not found'}
Given Names: ${mrzData.names || 'Not found'}
Nationality: ${mrzData.nationality || 'Not found'}
Date of Birth: ${mrzData.date_of_birth || 'Not found'}
Sex: ${mrzData.sex || 'Not found'}
Expiry Date: ${mrzData.expiration_date || 'Not found'}
Country Code: ${mrzData.country || 'Not found'}
${mrzData.personal_number ? `Personal Number: ${mrzData.personal_number}` : ''}

Extraction Method: PassportEye OCR (Fast)
Processing Time: < 1 second`;
}

// Made with Bob
