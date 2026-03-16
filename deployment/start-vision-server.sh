#!/bin/bash

################################################################################
# Start Granite Vision Server
# Runs llama-server with Granite Vision 3.3 2B on port 8082
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
MMPROJ_FILE="mmproj-model-f16.gguf"
VISION_PORT=8082
LLAMA_CPP_DIR="$HOME/llama.cpp"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Starting Granite Vision Server${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if model files exist
if [ ! -f "${VISION_MODEL_DIR}/${VISION_MODEL_FILE}" ]; then
    echo -e "${RED}✗ Vision model not found!${NC}"
    echo "Please run: ./deployment/setup-granite-vision.sh"
    exit 1
fi

if [ ! -f "${VISION_MODEL_DIR}/${MMPROJ_FILE}" ]; then
    echo -e "${RED}✗ Multimodal projector not found!${NC}"
    echo "Please run: ./deployment/setup-granite-vision.sh"
    exit 1
fi

# Check if llama.cpp exists
if [ ! -d "${LLAMA_CPP_DIR}" ]; then
    echo -e "${RED}✗ llama.cpp directory not found at ${LLAMA_CPP_DIR}${NC}"
    exit 1
fi

# Check if port is already in use
if lsof -Pi :${VISION_PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠ Port ${VISION_PORT} is already in use${NC}"
    echo "Stopping existing process..."
    kill $(lsof -t -i:${VISION_PORT}) 2>/dev/null || true
    sleep 2
fi

echo -e "${GREEN}✓ Pre-flight checks passed${NC}"
echo ""
echo "Configuration:"
echo "  Model: ${VISION_MODEL_FILE}"
echo "  Projector: ${MMPROJ_FILE}"
echo "  Port: ${VISION_PORT}"
echo "  Host: 0.0.0.0 (accessible from network)"
echo ""

# Start the vision server
echo -e "${YELLOW}Starting Granite Vision server...${NC}"
echo "This will run in the foreground. Press Ctrl+C to stop."
echo ""

cd "${LLAMA_CPP_DIR}"

# Activate virtual environment if it exists
if [ -f "../llama.cpp.venv/bin/activate" ]; then
    source ../llama.cpp.venv/bin/activate
fi

# Start llama-server with vision model
./build/bin/llama-server \
    -m "${VISION_MODEL_DIR}/${VISION_MODEL_FILE}" \
    --mmproj "${VISION_MODEL_DIR}/${MMPROJ_FILE}" \
    --host 0.0.0.0 \
    --port ${VISION_PORT} \
    -c 8192 \
    -ngl 0 \
    --log-disable \
    2>&1 | tee -a ../deployment/granite-vision-server.log

echo ""
echo -e "${GREEN}Granite Vision server stopped${NC}"

# Made with Bob
