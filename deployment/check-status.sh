#!/bin/bash

################################################################################
# Script: check-status.sh
# Purpose: Check the status of Carbon GenAI Demo deployment
# Author: Bob
# Date: 2026-03-03
################################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="${SCRIPT_DIR}/carbon-dev-server.pid"
LLM_PID_FILE="${SCRIPT_DIR}/llama-server.pid"
VENV_NAME="carbon.venv"
LLM_VENV_NAME="llama.cpp.venv"
REPO_DIR="Carbon-GenAI-Demos"
APP_DIR="carbon-ui"
LLAMA_DIR="llama.cpp"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}${CYAN}Carbon GenAI Demo - Deployment Status${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Web App Python Virtual Environment
echo -e "${BOLD}🐍 Web App Python Virtual Environment${NC}"
if [ -d "${SCRIPT_DIR}/${VENV_NAME}" ]; then
    echo -e "   ${GREEN}✓${NC} Virtual environment exists: ${VENV_NAME}"
    if [ -f "${SCRIPT_DIR}/${VENV_NAME}/bin/python" ]; then
        local python_version=$("${SCRIPT_DIR}/${VENV_NAME}/bin/python" --version 2>&1)
        echo -e "   ${BLUE}ℹ${NC} Python version: $python_version"
    fi
else
    echo -e "   ${RED}✗${NC} Virtual environment not found"
fi
echo ""

# Check LLM Python Virtual Environment
echo -e "${BOLD}🤖 LLM Python Virtual Environment${NC}"
if [ -d "${SCRIPT_DIR}/${LLM_VENV_NAME}" ]; then
    echo -e "   ${GREEN}✓${NC} Virtual environment exists: ${LLM_VENV_NAME}"
    if [ -f "${SCRIPT_DIR}/${LLM_VENV_NAME}/bin/python" ]; then
        local python_version=$("${SCRIPT_DIR}/${LLM_VENV_NAME}/bin/python" --version 2>&1)
        echo -e "   ${BLUE}ℹ${NC} Python version: $python_version"
    fi
else
    echo -e "   ${RED}✗${NC} Virtual environment not found"
fi
echo ""

# Check Repository
echo -e "${BOLD}📁 Repository${NC}"
if [ -d "${SCRIPT_DIR}/${REPO_DIR}" ]; then
    echo -e "   ${GREEN}✓${NC} Repository cloned: ${REPO_DIR}"
    if [ -d "${SCRIPT_DIR}/${REPO_DIR}/${APP_DIR}" ]; then
        echo -e "   ${GREEN}✓${NC} Application directory exists: ${APP_DIR}"
        
        # Check if node_modules exists
        if [ -d "${SCRIPT_DIR}/${REPO_DIR}/${APP_DIR}/node_modules" ]; then
            echo -e "   ${GREEN}✓${NC} Node dependencies installed"
        else
            echo -e "   ${YELLOW}⚠${NC} Node dependencies not found"
        fi
        
        # Check if build directory exists
        if [ -d "${SCRIPT_DIR}/${REPO_DIR}/${APP_DIR}/build" ] || \
           [ -d "${SCRIPT_DIR}/${REPO_DIR}/${APP_DIR}/dist" ] || \
           [ -d "${SCRIPT_DIR}/${REPO_DIR}/${APP_DIR}/.next" ]; then
            echo -e "   ${GREEN}✓${NC} Application built"
        else
            echo -e "   ${YELLOW}⚠${NC} Build artifacts not found"
        fi
    else
        echo -e "   ${RED}✗${NC} Application directory not found: ${APP_DIR}"
    fi
else
    echo -e "   ${RED}✗${NC} Repository not found: ${REPO_DIR}"
fi
echo ""

# Check Web Dev Server
echo -e "${BOLD}🚀 Web Development Server${NC}"
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} Server is running (PID: $PID)"
        
        # Get process info
        if command -v ps >/dev/null 2>&1; then
            local process_info=$(ps -p "$PID" -o comm= 2>/dev/null)
            if [ -n "$process_info" ]; then
                echo -e "   ${BLUE}ℹ${NC} Process: $process_info"
            fi
            
            # Get CPU and memory usage
            local cpu_mem=$(ps -p "$PID" -o %cpu,%mem 2>/dev/null | tail -n 1)
            if [ -n "$cpu_mem" ]; then
                echo -e "   ${BLUE}ℹ${NC} Resource usage: CPU/MEM: $cpu_mem"
            fi
        fi
        
        # Check if port is listening
        if command -v netstat >/dev/null 2>&1; then
            local listening_ports=$(netstat -tlnp 2>/dev/null | grep "$PID" | awk '{print $4}' | awk -F: '{print $NF}' | sort -u)
            if [ -n "$listening_ports" ]; then
                echo -e "   ${BLUE}ℹ${NC} Listening on port(s): $listening_ports"
            fi
        elif command -v ss >/dev/null 2>&1; then
            local listening_ports=$(ss -tlnp 2>/dev/null | grep "pid=$PID" | awk '{print $4}' | awk -F: '{print $NF}' | sort -u)
            if [ -n "$listening_ports" ]; then
                echo -e "   ${BLUE}ℹ${NC} Listening on port(s): $listening_ports"
            fi
        fi
        
        # Calculate uptime
        if command -v ps >/dev/null 2>&1; then
            local start_time=$(ps -p "$PID" -o lstart= 2>/dev/null)
            if [ -n "$start_time" ]; then
                echo -e "   ${BLUE}ℹ${NC} Started: $start_time"
            fi
        fi
    else
        echo -e "   ${RED}✗${NC} Server not running (stale PID file)"
        echo -e "   ${BLUE}ℹ${NC} PID file exists but process $PID is not running"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} Server not started or PID file not found"
fi
echo ""

# Check LLM Server
echo -e "${BOLD}🤖 LLM Server (llama.cpp)${NC}"
if [ -f "$LLM_PID_FILE" ]; then
    LLM_PID=$(cat "$LLM_PID_FILE")
    if kill -0 "$LLM_PID" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} LLM server is running (PID: $LLM_PID)"
        
        # Get process info
        if command -v ps >/dev/null 2>&1; then
            local process_info=$(ps -p "$LLM_PID" -o comm= 2>/dev/null)
            if [ -n "$process_info" ]; then
                echo -e "   ${BLUE}ℹ${NC} Process: $process_info"
            fi
            
            # Get CPU and memory usage
            local cpu_mem=$(ps -p "$LLM_PID" -o %cpu,%mem 2>/dev/null | tail -n 1)
            if [ -n "$cpu_mem" ]; then
                echo -e "   ${BLUE}ℹ${NC} Resource usage: CPU/MEM: $cpu_mem"
            fi
        fi
        
        # Check if port is listening (default llama.cpp port is 8080)
        if command -v netstat >/dev/null 2>&1; then
            local listening_ports=$(netstat -tlnp 2>/dev/null | grep "$LLM_PID" | awk '{print $4}' | awk -F: '{print $NF}' | sort -u)
            if [ -n "$listening_ports" ]; then
                echo -e "   ${BLUE}ℹ${NC} Listening on port(s): $listening_ports"
            fi
        elif command -v ss >/dev/null 2>&1; then
            local listening_ports=$(ss -tlnp 2>/dev/null | grep "pid=$LLM_PID" | awk '{print $4}' | awk -F: '{print $NF}' | sort -u)
            if [ -n "$listening_ports" ]; then
                echo -e "   ${BLUE}ℹ${NC} Listening on port(s): $listening_ports"
            fi
        fi
        
        # Calculate uptime
        if command -v ps >/dev/null 2>&1; then
            local start_time=$(ps -p "$LLM_PID" -o lstart= 2>/dev/null)
            if [ -n "$start_time" ]; then
                echo -e "   ${BLUE}ℹ${NC} Started: $start_time"
            fi
        fi
    else
        echo -e "   ${RED}✗${NC} LLM server not running (stale PID file)"
        echo -e "   ${BLUE}ℹ${NC} PID file exists but process $LLM_PID is not running"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} LLM server not started or PID file not found"
fi
echo ""

# Check llama.cpp Installation
echo -e "${BOLD}🔨 llama.cpp Installation${NC}"
if [ -d "${SCRIPT_DIR}/${LLAMA_DIR}" ]; then
    echo -e "   ${GREEN}✓${NC} llama.cpp directory exists"
    if [ -f "${SCRIPT_DIR}/${LLAMA_DIR}/build/bin/llama-server" ]; then
        echo -e "   ${GREEN}✓${NC} llama-server binary found"
    else
        echo -e "   ${RED}✗${NC} llama-server binary not found"
    fi
else
    echo -e "   ${RED}✗${NC} llama.cpp not installed"
fi
echo ""

# Check LLM Model
echo -e "${BOLD}📦 LLM Model${NC}"
if [ -f "/tmp/models/granite-4.0-micro-Q4_K_M.gguf" ]; then
    echo -e "   ${GREEN}✓${NC} Model file exists"
    local model_size=$(du -h "/tmp/models/granite-4.0-micro-Q4_K_M.gguf" | cut -f1)
    echo -e "   ${BLUE}ℹ${NC} Model size: $model_size"
else
    echo -e "   ${RED}✗${NC} Model file not found"
fi
echo ""

# Check System Dependencies
echo -e "${BOLD}🔧 System Dependencies${NC}"
dependencies=("python3.12:Python 3.12" "git:Git" "node:Node.js" "npm:npm" "yarn:Yarn" "cmake:CMake" "make:Make")
for dep in "${dependencies[@]}"; do
    cmd="${dep%%:*}"
    name="${dep##*:}"
    if command -v "$cmd" >/dev/null 2>&1; then
        version=$($cmd --version 2>&1 | head -n1)
        echo -e "   ${GREEN}✓${NC} $name: $version"
    else
        echo -e "   ${RED}✗${NC} $name not found"
    fi
done
echo ""

# Check Log Files
echo -e "${BOLD}📋 Log Files${NC}"
log_count=$(find "${SCRIPT_DIR}" -maxdepth 1 -name "carbon-deployment-*.log" 2>/dev/null | wc -l)
if [ "$log_count" -gt 0 ]; then
    echo -e "   ${GREEN}✓${NC} Found $log_count deployment log file(s)"
    latest_log=$(ls -t "${SCRIPT_DIR}"/carbon-deployment-*.log 2>/dev/null | head -n1)
    if [ -n "$latest_log" ]; then
        echo -e "   ${BLUE}ℹ${NC} Latest: $(basename "$latest_log")"
        log_size=$(du -h "$latest_log" | cut -f1)
        echo -e "   ${BLUE}ℹ${NC} Size: $log_size"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} No deployment logs found"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}Commands:${NC}"
echo "  Start deployment:  ./deploy-carbon-genai.sh"
echo "  Stop servers:      ./stop-server.sh"
echo "  View logs:         tail -f carbon-deployment-*.log"
echo "  Test LLM API:      curl http://localhost:8080/health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Made with Bob
