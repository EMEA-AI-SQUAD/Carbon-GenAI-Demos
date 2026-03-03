#!/bin/bash

################################################################################
# Script: stop-server.sh
# Purpose: Stop the Carbon GenAI Demo servers (web and LLM)
# Author: Bob
# Date: 2026-03-03
################################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="${SCRIPT_DIR}/carbon-dev-server.pid"
LLM_PID_FILE="${SCRIPT_DIR}/llama-server.pid"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}Stopping Carbon GenAI Servers...${NC}\n"

# Function to stop a server
stop_server() {
    local pid_file="$1"
    local server_name="$2"
    
    # Check if PID file exists
    if [ ! -f "$pid_file" ]; then
        echo -e "${YELLOW}⚠${NC} $server_name: PID file not found"
        return 1
    fi
    
    # Read PID
    local pid=$(cat "$pid_file")
    
    # Check if process is running
    if ! kill -0 "$pid" 2>/dev/null; then
        echo -e "${YELLOW}⚠${NC} $server_name: Process $pid is not running"
        echo -e "${BLUE}ℹ${NC} Removing stale PID file..."
        rm -f "$pid_file"
        return 1
    fi
    
    # Attempt graceful shutdown
    echo -e "${BLUE}ℹ${NC} $server_name: Sending SIGTERM to process $pid..."
    kill "$pid" 2>/dev/null
    
    # Wait for process to terminate (max 10 seconds)
    for i in {1..10}; do
        if ! kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $server_name: Stopped successfully (PID: $pid)"
            rm -f "$pid_file"
            return 0
        fi
        sleep 1
    done
    
    # Force kill if still running
    echo -e "${YELLOW}⚠${NC} $server_name: Process did not terminate gracefully. Forcing shutdown..."
    kill -9 "$pid" 2>/dev/null
    
    # Verify termination
    sleep 1
    if ! kill -0 "$pid" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $server_name: Forcefully stopped (PID: $pid)"
        rm -f "$pid_file"
        return 0
    else
        echo -e "${RED}✗${NC} $server_name: Failed to stop (PID: $pid)"
        echo -e "${BLUE}ℹ${NC} You may need to manually kill: kill -9 $pid"
        return 1
    fi
}

# Stop web dev server
echo -e "${BOLD}Web Development Server${NC}"
stop_server "$PID_FILE" "Web Server"
web_result=$?

echo ""

# Stop LLM server
echo -e "${BOLD}LLM Server${NC}"
stop_server "$LLM_PID_FILE" "LLM Server"
llm_result=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Exit with appropriate code
if [ $web_result -eq 0 ] || [ $llm_result -eq 0 ]; then
    echo -e "${GREEN}✓${NC} At least one server was stopped"
    exit 0
else
    echo -e "${YELLOW}⚠${NC} No servers were running"
    exit 1
fi

# Made with Bob
