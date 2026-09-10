#!/bin/bash

################################################################################
# Start PassportEye Service
# Runs Flask microservice for passport MRZ extraction on port 5000
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get script directory and set absolute paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
WORK_DIR="$(dirname "$REPO_DIR")"

# Configuration
SERVICE_PORT=5000
LOG_FILE="${WORK_DIR}/deployment/passporteye-service.log"
VENV_DIR="${REPO_DIR}/.passporteye-venv"
SERVICE_FILE="${REPO_DIR}/deployment/passport_service.py"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Starting PassportEye Service${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if virtual environment exists
if [ ! -d "${VENV_DIR}" ]; then
    echo -e "${RED}✗ Virtual environment not found: ${VENV_DIR}${NC}"
    echo "Run ./deployment/setup-passporteye.sh first"
    exit 1
fi

# Check if port is already in use
if lsof -Pi :${SERVICE_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port ${SERVICE_PORT} is already in use${NC}"
    echo "Stopping existing service..."
    pkill -f "passport_service.py" || true
    sleep 2
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source "${VENV_DIR}/bin/activate"
echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""

# Check if PassportEye is installed
echo -e "${YELLOW}Checking PassportEye installation...${NC}"
if ! python3 -c "import passporteye" 2>/dev/null; then
    echo -e "${RED}✗ PassportEye not installed${NC}"
    echo "Run ./deployment/setup-passporteye.sh first"
    exit 1
fi
echo -e "${GREEN}✓ PassportEye is installed${NC}"
echo ""

# Start service via pm2 (survives SSH disconnects and auto-restarts on crash)
echo -e "${YELLOW}Starting PassportEye service via pm2...${NC}"
echo "Port: ${SERVICE_PORT}"
echo ""

# Stop any existing instance
pm2 delete passporteye 2>/dev/null || true

# Start under pm2 using the venv python directly
pm2 start "${VENV_DIR}/bin/python3" --name passporteye -- "${SERVICE_FILE}"
pm2 save

# Wait for service to start
echo -e "${YELLOW}Waiting for service to start...${NC}"
sleep 5

# Check if service is running
if curl -s http://localhost:${SERVICE_PORT}/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PassportEye service is running on port ${SERVICE_PORT}${NC}"
    echo ""
    echo "Test with:  curl http://localhost:${SERVICE_PORT}/health"
    echo "View logs:  pm2 logs passporteye"
    echo "Stop:       pm2 delete passporteye"
else
    echo -e "${RED}✗ Service failed to start — check: pm2 logs passporteye${NC}"
    exit 1
fi

# Made with Bob