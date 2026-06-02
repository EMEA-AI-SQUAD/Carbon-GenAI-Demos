#!/bin/bash

################################################################################
# Test Proxy Server Startup Only
# Quick test script to start and verify the proxy without full deployment
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WORK_DIR="$HOME"
REPO_DIR="Carbon-GenAI-Demos"
APP_DIR="carbon-ui"
PROXY_DIR="${WORK_DIR}/${REPO_DIR}/${APP_DIR}/src/llama-proxy"
PROXY_LOG="${WORK_DIR}/deployment/proxy-test.log"
PROXY_PORT=3001

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Testing Proxy Server Startup${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if proxy directory exists
if [ ! -d "$PROXY_DIR" ]; then
    echo -e "${RED}✗ Proxy directory not found: $PROXY_DIR${NC}"
    exit 1
fi

# Check if port is already in use
echo -e "${YELLOW}Checking if port ${PROXY_PORT} is available...${NC}"
if lsof -Pi :${PROXY_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port ${PROXY_PORT} is already in use${NC}"
    echo "Existing process:"
    lsof -Pi :${PROXY_PORT} -sTCP:LISTEN
    echo ""
    read -p "Kill existing process and continue? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Killing process on port ${PROXY_PORT}..."
        lsof -ti :${PROXY_PORT} | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        echo "Exiting..."
        exit 1
    fi
fi
echo -e "${GREEN}✓ Port ${PROXY_PORT} is available${NC}"
echo ""

# Navigate to proxy directory
cd "$PROXY_DIR" || {
    echo -e "${RED}✗ Failed to navigate to proxy directory${NC}"
    exit 1
}
echo -e "${GREEN}✓ Working directory: $(pwd)${NC}"

# Check if server_final.js exists
if [ ! -f "server_final.js" ]; then
    echo -e "${RED}✗ Proxy server file not found: server_final.js${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Proxy server file found${NC}"
echo ""

# Start proxy server
echo -e "${YELLOW}Starting proxy server...${NC}"
echo "Log file: $PROXY_LOG"
echo ""

setsid node server_final.js > "$PROXY_LOG" 2>&1 < /dev/null &
PROXY_PID=$!

echo "Initial PID: $PROXY_PID"
echo ""

# Wait and check multiple times
echo -e "${YELLOW}Waiting for proxy to start...${NC}"
for i in {1..5}; do
    sleep 1
    echo -n "  ${i}s: "
    
    # Check if port is listening
    if lsof -Pi :${PROXY_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}Port ${PROXY_PORT} is listening!${NC}"
        LISTENING_PID=$(lsof -ti :${PROXY_PORT})
        echo "  Listening PID: $LISTENING_PID"
        break
    else
        echo "Not listening yet..."
    fi
done

echo ""

# Final check
if lsof -Pi :${PROXY_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Proxy server is running successfully!${NC}"
    echo ""
    echo "Process details:"
    lsof -Pi :${PROXY_PORT} -sTCP:LISTEN
    echo ""
    echo "Test with:"
    echo "  curl http://localhost:${PROXY_PORT}/health"
    echo ""
    echo "View logs:"
    echo "  tail -f $PROXY_LOG"
    echo ""
    echo "Stop proxy:"
    echo "  lsof -ti :${PROXY_PORT} | xargs kill"
else
    echo -e "${RED}✗ Proxy server failed to start${NC}"
    echo ""
    echo "Log output:"
    cat "$PROXY_LOG"
    exit 1
fi

# Made with Bob
