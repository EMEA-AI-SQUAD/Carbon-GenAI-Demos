#!/bin/bash

################################################################################
# Script: restart-services.sh
# Purpose: Restart Carbon GenAI Demo services
# Author: Bob
# Date: 2026-04-08
################################################################################

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

HOME_DIR="$HOME"
REPO_DIR="Carbon-GenAI-Demos"
APP_DIR="carbon-ui"
LLAMA_DIR="llama.cpp"
MODEL_DIR="/tmp/models"
MODEL_FILE="granite-4.0-micro-Q4_K_M.gguf"

PID_FILE="${HOME_DIR}/carbon-dev-server.pid"
PROXY_PID_FILE="${HOME_DIR}/proxy-server.pid"
LLM_PID_FILE="${HOME_DIR}/llama-server.pid"

echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}Carbon GenAI Demo - Service Restart${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Stop all services
echo -e "${BOLD}Step 1: Stopping all services...${NC}"
./stop-server.sh

# Stop PassportEye service if running
if pgrep -f "passport_service.py" > /dev/null; then
    echo -e "${BLUE}ℹ${NC} Stopping PassportEye service..."
    pkill -f "passport_service.py"
    sleep 2
fi
echo ""

# Step 2: Start PassportEye Service (Optional)
echo -e "${BOLD}Step 2: Starting PassportEye Service (Optional)...${NC}"
if [ -d "${HOME_DIR}/.passporteye-venv" ]; then
    echo -e "${BLUE}ℹ${NC} PassportEye is installed, starting service..."
    cd "${HOME_DIR}/${REPO_DIR}"
    
    # Activate venv and start service
    source .passporteye-venv/bin/activate
    PASSPORT_LOG="${HOME_DIR}/passporteye-service.log"
    nohup python3 deployment/passport_service.py > "$PASSPORT_LOG" 2>&1 &
    PASSPORT_PID=$!
    echo "$PASSPORT_PID" > "${HOME_DIR}/passporteye-server.pid"
    
    sleep 3
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} PassportEye service started (PID: $PASSPORT_PID, port 5000)"
        echo -e "${BLUE}ℹ${NC} PassportEye logs: $PASSPORT_LOG"
    else
        echo -e "${YELLOW}⚠${NC} PassportEye service may not have started properly"
        echo -e "${BLUE}ℹ${NC} Check logs: tail -f $PASSPORT_LOG"
        echo -e "${BLUE}ℹ${NC} Demo will use LLM fallback for passport extraction"
    fi
else
    echo -e "${YELLOW}⚠${NC} PassportEye not installed (optional service)"
    echo -e "${BLUE}ℹ${NC} Install with: ./deployment/setup-passporteye.sh"
    echo -e "${BLUE}ℹ${NC} Demo will use LLM fallback for passport extraction"
fi
echo ""

# Step 3: Start LLM Server
echo -e "${BOLD}Step 2: Starting LLM Server...${NC}"
cd "${HOME_DIR}/${LLAMA_DIR}" || {
    echo -e "${RED}✗${NC} Failed to navigate to llama.cpp directory"
    exit 1
}

if [ ! -f "build/bin/llama-server" ]; then
    echo -e "${RED}✗${NC} llama-server binary not found at: ${HOME_DIR}/${LLAMA_DIR}/build/bin/llama-server"
    echo -e "${YELLOW}⚠${NC} You may need to build llama.cpp first"
    exit 1
fi

if [ ! -f "${MODEL_DIR}/${MODEL_FILE}" ]; then
    echo -e "${RED}✗${NC} Model file not found at: ${MODEL_DIR}/${MODEL_FILE}"
    exit 1
fi

echo -e "${BLUE}ℹ${NC} Starting llama-server..."
nohup ./build/bin/llama-server -m "${MODEL_DIR}/${MODEL_FILE}" --host 0.0.0.0 > /dev/null 2>&1 &
LLM_PID=$!
echo "$LLM_PID" > "$LLM_PID_FILE"

sleep 3
if kill -0 "$LLM_PID" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} LLM server started (PID: $LLM_PID)"
else
    echo -e "${RED}✗${NC} LLM server failed to start"
    exit 1
fi
echo ""

# Step 4: Start Proxy Server
echo -e "${BOLD}Step 3: Starting Proxy Server...${NC}"
cd "${HOME_DIR}/${REPO_DIR}/${APP_DIR}/src/llama-proxy" || {
    echo -e "${RED}✗${NC} Failed to navigate to proxy directory"
    exit 1
}

if [ ! -f "server_final.js" ]; then
    echo -e "${RED}✗${NC} Proxy server file not found"
    exit 1
fi

# Check if node_modules exist in proxy directory
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} Installing proxy dependencies..."
    npm install --legacy-peer-deps > /dev/null 2>&1
    
    # Update FQDN after npm install (in case it restored original file)
    echo -e "${BLUE}ℹ${NC} Updating FQDN in proxy configuration..."
    cd "${HOME_DIR}/${REPO_DIR}/deployment"
    ./update-fqdn.sh > /dev/null 2>&1
    cd "${HOME_DIR}/${REPO_DIR}/${APP_DIR}/src/llama-proxy"
fi

echo -e "${BLUE}ℹ${NC} Starting proxy server..."
# Create a log file for proxy output
PROXY_LOG="${HOME_DIR}/proxy-server.log"
nohup node server_final.js > "$PROXY_LOG" 2>&1 &
PROXY_PID=$!
echo "$PROXY_PID" > "$PROXY_PID_FILE"

# Wait and check if port 3001 is listening instead of checking PID
sleep 3
if netstat -tln 2>/dev/null | grep -q ":3001 " || ss -tln 2>/dev/null | grep -q ":3001 "; then
    echo -e "${GREEN}✓${NC} Proxy server started and listening on port 3001"
    echo -e "${BLUE}ℹ${NC} Proxy PID: $PROXY_PID"
    echo -e "${BLUE}ℹ${NC} Proxy logs: $PROXY_LOG"
elif kill -0 "$PROXY_PID" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Proxy server process running (PID: $PROXY_PID)"
    echo -e "${BLUE}ℹ${NC} Proxy logs: $PROXY_LOG"
else
    echo -e "${RED}✗${NC} Proxy server failed to start"
    if [ -f "$PROXY_LOG" ]; then
        echo -e "${YELLOW}⚠${NC} Last few lines from proxy log:"
        tail -5 "$PROXY_LOG"
    fi
    echo -e "${YELLOW}⚠${NC} Try starting manually: cd ~/Carbon-GenAI-Demos/carbon-ui/src/llama-proxy && node server_final.js"
    exit 1
fi
echo ""

# Step 5: Start Web Server
echo -e "${BOLD}Step 4: Starting Web Server...${NC}"
cd "${HOME_DIR}/${REPO_DIR}/${APP_DIR}" || {
    echo -e "${RED}✗${NC} Failed to navigate to app directory"
    exit 1
}

if [ ! -d ".next" ]; then
    echo -e "${YELLOW}⚠${NC} Application not built. Building now..."
    yarn build
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗${NC} Build failed"
        exit 1
    fi
fi

echo -e "${BLUE}ℹ${NC} Starting web server..."
nohup yarn start > /dev/null 2>&1 &
WEB_PID=$!
echo "$WEB_PID" > "$PID_FILE"

sleep 5
if kill -0 "$WEB_PID" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Web server started (PID: $WEB_PID)"
else
    echo -e "${RED}✗${NC} Web server failed to start"
    echo -e "${YELLOW}⚠${NC} Try starting manually: cd ~/Carbon-GenAI-Demos/carbon-ui && yarn start"
    exit 1
fi
echo ""

# Summary
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}✓ All services started successfully!${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}Service Status:${NC}"
if [ -n "$PASSPORT_PID" ] && kill -0 "$PASSPORT_PID" 2>/dev/null; then
    echo -e "  PassportEye:  PID $PASSPORT_PID (port 5000) ${GREEN}✓${NC}"
else
    echo -e "  PassportEye:  Not running (using LLM fallback) ${YELLOW}⚠${NC}"
fi
echo -e "  LLM Server:   PID $LLM_PID (port 8080)"
echo -e "  Proxy Server: PID $PROXY_PID (port 3001)"
echo -e "  Web Server:   PID $WEB_PID (port 3000)"
echo ""
echo -e "${BOLD}Next Steps:${NC}"
echo -e "  Check status:  ./check-status.sh"
echo -e "  View logs:     tail -f carbon-deployment-*.log"
echo -e "  Test LLM API:  curl http://localhost:8080/health"
echo -e "  Test Proxy:    curl http://localhost:3001/health"
echo -e "  Access Web:    http://$(hostname -f):3000"
echo ""

# Made with Bob