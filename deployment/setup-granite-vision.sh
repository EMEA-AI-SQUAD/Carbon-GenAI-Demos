#!/bin/bash

################################################################################
# Granite Vision 3.3 2B Setup Script
# Downloads and configures IBM Granite Vision model for llama.cpp
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VISION_MODEL_DIR="/tmp/models"
VISION_MODEL_FILE="granite-vision-3.3-2b-Q4_K_M.gguf"
VISION_MODEL_URL="https://huggingface.co/ibm-granite/granite-vision-3.3-2b-GGUF/resolve/main/${VISION_MODEL_FILE}"
MMPROJ_FILE="mmproj-model-f16.gguf"
MMPROJ_URL="https://huggingface.co/ibm-granite/granite-vision-3.3-2b-GGUF/resolve/main/${MMPROJ_FILE}"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Granite Vision 3.3 2B Setup${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Create model directory if it doesn't exist
echo -e "${YELLOW}[1/4] Creating model directory...${NC}"
mkdir -p "${VISION_MODEL_DIR}"
echo -e "${GREEN}✓ Model directory ready: ${VISION_MODEL_DIR}${NC}"
echo ""

# Download vision model if not exists
echo -e "${YELLOW}[2/4] Downloading Granite Vision model...${NC}"
if [ -f "${VISION_MODEL_DIR}/${VISION_MODEL_FILE}" ]; then
    echo -e "${GREEN}✓ Model already exists, skipping download${NC}"
else
    echo "Downloading from: ${VISION_MODEL_URL}"
    echo "This may take several minutes (~2GB)..."
    curl -L -o "${VISION_MODEL_DIR}/${VISION_MODEL_FILE}" "${VISION_MODEL_URL}"
    echo -e "${GREEN}✓ Vision model downloaded${NC}"
fi
echo ""

# Download multimodal projector if not exists
echo -e "${YELLOW}[3/4] Downloading multimodal projector...${NC}"
if [ -f "${VISION_MODEL_DIR}/${MMPROJ_FILE}" ]; then
    echo -e "${GREEN}✓ Projector already exists, skipping download${NC}"
else
    echo "Downloading from: ${MMPROJ_URL}"
    curl -L -o "${VISION_MODEL_DIR}/${MMPROJ_FILE}" "${MMPROJ_URL}"
    echo -e "${GREEN}✓ Multimodal projector downloaded${NC}"
fi
echo ""

# Verify files
echo -e "${YELLOW}[4/4] Verifying downloads...${NC}"
if [ -f "${VISION_MODEL_DIR}/${VISION_MODEL_FILE}" ] && [ -f "${VISION_MODEL_DIR}/${MMPROJ_FILE}" ]; then
    echo -e "${GREEN}✓ All files present${NC}"
    echo ""
    echo "Model file: ${VISION_MODEL_DIR}/${VISION_MODEL_FILE}"
    ls -lh "${VISION_MODEL_DIR}/${VISION_MODEL_FILE}"
    echo ""
    echo "Projector file: ${VISION_MODEL_DIR}/${MMPROJ_FILE}"
    ls -lh "${VISION_MODEL_DIR}/${MMPROJ_FILE}"
else
    echo -e "${RED}✗ Download verification failed${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Start the vision server:"
echo "   ./deployment/start-vision-server.sh"
echo ""
echo "2. Test with sample image:"
echo "   curl http://localhost:8082/v1/chat/completions \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"model\":\"granite-vision\",\"messages\":[{\"role\":\"user\",\"content\":[{\"type\":\"image_url\",\"image_url\":{\"url\":\"data:image/jpeg;base64,...\"}}]}]}'"
echo ""

# Made with Bob
