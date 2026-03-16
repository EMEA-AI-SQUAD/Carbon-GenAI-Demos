#!/bin/bash

################################################################################
# Test Granite Vision with Mr. Bean Passport
# Verifies vision model can extract text from passport image
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PASSPORT_IMAGE="carbon-ui/public/images/mr-bean-passport.jpg"
VISION_ENDPOINT="http://localhost:8082/v1/chat/completions"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Testing Granite Vision${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if passport image exists
if [ ! -f "${PASSPORT_IMAGE}" ]; then
    echo -e "${RED}✗ Passport image not found: ${PASSPORT_IMAGE}${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/3] Encoding passport image to base64...${NC}"
BASE64_IMAGE=$(base64 -w 0 "${PASSPORT_IMAGE}")
echo -e "${GREEN}✓ Image encoded (${#BASE64_IMAGE} characters)${NC}"
echo ""

echo -e "${YELLOW}[2/3] Sending to Granite Vision...${NC}"
echo "Endpoint: ${VISION_ENDPOINT}"
echo "Prompt: Extract all text visible in this passport image"
echo ""

# Create JSON payload
PAYLOAD=$(cat <<EOF
{
  "model": "granite-vision",
  "messages": [{
    "role": "user",
    "content": [
      {
        "type": "image_url",
        "image_url": {
          "url": "data:image/jpeg;base64,${BASE64_IMAGE}"
        }
      },
      {
        "type": "text",
        "text": "Read this passport and extract the following information in a structured format:\n- Passport Number\n- Surname\n- Given Names\n- Nationality\n- Date of Birth\n- Sex\n- Place of Birth\n- Date of Issue\n- Date of Expiry\n- Issuing Authority\n\nProvide only the extracted data, not a description of the image."
      }
    ]
  }],
  "temperature": 0,
  "max_tokens": 2048
}
EOF
)

# Send request
RESPONSE=$(curl -s -X POST "${VISION_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}")

echo -e "${YELLOW}[3/3] Processing response...${NC}"
echo ""

# Check if response contains error
if echo "${RESPONSE}" | grep -q '"error"'; then
    echo -e "${RED}✗ Error from vision server:${NC}"
    echo "${RESPONSE}" | jq '.'
    exit 1
fi

# Extract and display the response
echo -e "${GREEN}✓ Vision model response:${NC}"
echo "---"
echo "${RESPONSE}" | jq -r '.choices[0].message.content' 2>/dev/null || echo "${RESPONSE}"
echo "---"
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Test Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Review extracted text above"
echo "2. Update proxy server to route vision requests"
echo "3. Modify Tab 2 frontend to use vision endpoint"
echo ""

# Made with Bob
