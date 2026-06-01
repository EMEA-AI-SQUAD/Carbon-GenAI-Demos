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
VENV_DIR="${WORK_DIR}/.passporteye-venv"
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

# Start service
echo -e "${YELLOW}Starting PassportEye service...${NC}"
echo "Port: ${SERVICE_PORT}"
echo "Log: ${LOG_FILE}"
echo ""

nohup python3 "${SERVICE_FILE}" > "${LOG_FILE}" 2>&1 &
SERVICE_PID=$!
echo "Service PID: ${SERVICE_PID}"

# Wait for service to start
echo -e "${YELLOW}Waiting for service to start...${NC}"
sleep 3

# Check if service is running
if curl -s http://localhost:${SERVICE_PORT}/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PassportEye service is running on port ${SERVICE_PORT}${NC}"
    echo ""
    echo "Test with:"
    echo "  curl http://localhost:${SERVICE_PORT}/health"
    echo ""
    echo "View logs:"
    echo "  tail -f ${LOG_FILE}"
    echo ""
    echo "Stop service:"
    echo "  pkill -f 'passport_service.py'"
else
    echo -e "${RED}✗ Service failed to start${NC}"
    echo "Check logs: tail -f ${LOG_FILE}"
    exit 1
fi

# Made with Bob