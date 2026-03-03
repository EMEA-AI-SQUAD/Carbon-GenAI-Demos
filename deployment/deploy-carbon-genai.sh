#!/bin/bash

################################################################################
# Script: deploy-carbon-genai.sh
# Purpose: Automated deployment of Carbon GenAI Demo on RHEL/PPC64LE
# Author: Bob
# Date: 2026-03-03
################################################################################

set -o pipefail

# ============================================================================
# GLOBAL VARIABLES
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/carbon-deployment-$(date +%Y%m%d-%H%M%S).log"
PID_FILE="${SCRIPT_DIR}/carbon-dev-server.pid"
PROXY_PID_FILE="${SCRIPT_DIR}/proxy-server.pid"
LLM_PID_FILE="${SCRIPT_DIR}/llama-server.pid"
VENV_NAME="carbon.venv"
LLM_VENV_NAME="llama.cpp.venv"
REPO_URL="https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos"
REPO_DIR="Carbon-GenAI-Demos"
APP_DIR="carbon-ui"
LLAMA_REPO_URL="https://github.com/ggml-org/llama.cpp.git"
LLAMA_DIR="llama.cpp"
MODEL_DIR="/tmp/models"
MODEL_FILE="granite-4.0-micro-Q4_K_M.gguf"
MODEL_URL="https://huggingface.co/ibm-granite/granite-4.0-micro-GGUF/resolve/main/granite-4.0-micro-Q4_K_M.gguf"
START_TIME=$(date +%s)

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Step tracking
CURRENT_STEP=0
TOTAL_STEPS=13

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

# Initialize log file with header
init_log() {
    cat > "$LOG_FILE" << EOF
================================================================================
Carbon GenAI Demo Deployment Log
================================================================================
Start Time: $(date '+%Y-%m-%d %H:%M:%S')
Hostname: $(hostname)
User: $(whoami)
Working Directory: ${SCRIPT_DIR}
================================================================================

EOF
}

# Log message with timestamp to file
log_message() {
    local level="$1"
    shift
    local message="$*"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" >> "$LOG_FILE"
}

# Log command output to file
log_command() {
    local cmd="$1"
    log_message "CMD" "Executing: $cmd"
    echo "----------------------------------------" >> "$LOG_FILE"
}

# ============================================================================
# DISPLAY FUNCTIONS
# ============================================================================

# Print step header to console
print_step() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    local message="$1"
    echo -e "\n${BOLD}${CYAN}[${CURRENT_STEP}/${TOTAL_STEPS}]${NC} ${message}"
    log_message "STEP" "[$CURRENT_STEP/$TOTAL_STEPS] $message"
}

# Print success message
print_success() {
    local message="$1"
    echo -e "${GREEN}✓${NC} $message"
    log_message "SUCCESS" "$message"
}

# Print error message
print_error() {
    local message="$1"
    echo -e "${RED}✗${NC} $message"
    log_message "ERROR" "$message"
}

# Print warning message
print_warning() {
    local message="$1"
    echo -e "${YELLOW}⚠${NC} $message"
    log_message "WARNING" "$message"
}

# Print info message
print_info() {
    local message="$1"
    echo -e "${BLUE}ℹ${NC} $message"
    log_message "INFO" "$message"
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

# Execute command with logging
run_command() {
    local cmd="$1"
    local description="$2"
    
    log_command "$cmd"
    
    if eval "$cmd" >> "$LOG_FILE" 2>&1; then
        if [ -n "$description" ]; then
            print_success "$description"
        fi
        return 0
    else
        local exit_code=$?
        if [ -n "$description" ]; then
            print_error "$description (exit code: $exit_code)"
        fi
        log_message "ERROR" "Command failed with exit code: $exit_code"
        return $exit_code
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Cleanup on error
cleanup_on_error() {
    print_error "Deployment failed. Check log file for details: $LOG_FILE"
    log_message "ERROR" "Deployment failed. Performing cleanup..."
    
    # Stop dev server if running
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            print_info "Stopped dev server (PID: $pid)"
        fi
        rm -f "$PID_FILE"
    fi
    
    # Stop proxy server if running
    if [ -f "$PROXY_PID_FILE" ]; then
        local pid=$(cat "$PROXY_PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            print_info "Stopped proxy server (PID: $pid)"
        fi
        rm -f "$PROXY_PID_FILE"
    fi
    
    # Stop LLM server if running
    if [ -f "$LLM_PID_FILE" ]; then
        local pid=$(cat "$LLM_PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            print_info "Stopped LLM server (PID: $pid)"
        fi
        rm -f "$LLM_PID_FILE"
    fi
    
    exit 1
}

# Calculate elapsed time
get_elapsed_time() {
    local end_time=$(date +%s)
    local elapsed=$((end_time - START_TIME))
    local minutes=$((elapsed / 60))
    local seconds=$((elapsed % 60))
    echo "${minutes}m ${seconds}s"
}

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================

preflight_checks() {
    print_step "🔍 Running pre-flight checks..."
    
    # Check OS
    if [ ! -f /etc/redhat-release ]; then
        print_error "This script requires RHEL (Red Hat Enterprise Linux)"
        log_message "ERROR" "Not running on RHEL system"
        exit 1
    fi
    print_success "Operating system: $(cat /etc/redhat-release)"
    
    # Check architecture
    local arch=$(uname -m)
    if [ "$arch" != "ppc64le" ]; then
        print_warning "Expected ppc64le architecture, found: $arch"
        log_message "WARNING" "Architecture mismatch: $arch"
    else
        print_success "Architecture: $arch"
    fi
    
    # Check sudo access
    if ! sudo -n true 2>/dev/null; then
        print_error "This script requires sudo privileges"
        log_message "ERROR" "Insufficient privileges"
        exit 1
    fi
    print_success "Sudo access verified"
    
    # Check internet connectivity
    if ! ping -c 1 github.com >/dev/null 2>&1; then
        print_error "No internet connectivity detected"
        log_message "ERROR" "Cannot reach github.com"
        exit 1
    fi
    print_success "Internet connectivity verified"
    
    # Check disk space (require at least 5GB free)
    local free_space=$(df -BG "$SCRIPT_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$free_space" -lt 5 ]; then
        print_warning "Low disk space: ${free_space}GB available (5GB recommended)"
    else
        print_success "Disk space: ${free_space}GB available"
    fi
    
    log_message "INFO" "Pre-flight checks completed successfully"
}

# ============================================================================
# DEPLOYMENT PHASES
# ============================================================================

# Phase 1: System Update
update_system() {
    print_step "📦 Updating system packages..."
    
    if run_command "sudo dnf -y update" "System packages updated"; then
        return 0
    else
        print_error "Failed to update system packages"
        cleanup_on_error
    fi
}

# Phase 2: Install System Dependencies
install_dependencies() {
    print_step "🔧 Installing system dependencies..."
    
    local packages="python3.12 python3.12-pip python3.12-devel git gcc gcc-c++ nodejs make cmake automake llvm-toolset ninja-build gfortran curl-devel wget"
    
    if run_command "sudo dnf install -y $packages" "System dependencies installed"; then
        # Verify installations
        for cmd in python3.12 git gcc g++ node npm make cmake wget; do
            if command_exists "$cmd"; then
                local version=$($cmd --version 2>&1 | head -n1)
                print_info "$cmd: $version"
            fi
        done
        return 0
    else
        print_error "Failed to install system dependencies"
        cleanup_on_error
    fi
}

# Phase 3: Setup Python Environment
setup_python_env() {
    print_step "🐍 Setting up Python environment..."
    
    # Create virtual environment
    if run_command "python3.12 -m venv $VENV_NAME" "Virtual environment created"; then
        print_info "Virtual environment: ${SCRIPT_DIR}/${VENV_NAME}"
    else
        print_error "Failed to create virtual environment"
        cleanup_on_error
    fi
    
    # Activate virtual environment
    source "${VENV_NAME}/bin/activate"
    if [ $? -eq 0 ]; then
        print_success "Virtual environment activated"
        log_message "INFO" "Python virtual environment activated"
    else
        print_error "Failed to activate virtual environment"
        cleanup_on_error
    fi
    
    # Upgrade pip
    if run_command "pip install --upgrade pip" "pip upgraded"; then
        local pip_version=$(pip --version)
        print_info "$pip_version"
    else
        print_error "Failed to upgrade pip"
        cleanup_on_error
    fi
}

# Phase 4: Clone Repository
clone_repository() {
    print_step "📥 Cloning repository..."
    
    # Remove existing directory if present
    if [ -d "$REPO_DIR" ]; then
        print_warning "Repository directory already exists, removing..."
        rm -rf "$REPO_DIR"
    fi
    
    if run_command "git clone $REPO_URL" "Repository cloned successfully"; then
        print_info "Repository: ${SCRIPT_DIR}/${REPO_DIR}"
        
        # Verify clone
        if [ -d "$REPO_DIR/$APP_DIR" ]; then
            print_success "Application directory verified"
        else
            print_error "Application directory not found: $APP_DIR"
            cleanup_on_error
        fi
    else
        print_error "Failed to clone repository"
        cleanup_on_error
    fi
}

# Phase 5: Install Node Dependencies
install_node_dependencies() {
    print_step "📦 Installing Node.js dependencies..."
    
    # Install Yarn globally
    if run_command "sudo npm install --global yarn" "Yarn installed globally"; then
        local yarn_version=$(yarn --version 2>/dev/null)
        print_info "Yarn version: $yarn_version"
    else
        print_error "Failed to install Yarn"
        cleanup_on_error
    fi
    
    # Navigate to app directory
    cd "${REPO_DIR}/${APP_DIR}" || {
        print_error "Failed to navigate to ${REPO_DIR}/${APP_DIR}"
        cleanup_on_error
    }
    print_info "Working directory: $(pwd)"
    
    # Install dependencies with yarn
    if run_command "yarn" "Project dependencies installed"; then
        print_success "Base dependencies installed"
    else
        print_error "Failed to install project dependencies"
        cleanup_on_error
    fi
    
    # Add specific Carbon packages
    print_info "Installing Carbon packages..."
    run_command "yarn add @carbon/react@1.33.0" "Carbon React added"
    run_command "yarn add sass@1.63.6" "Sass added"
    run_command "yarn add typescript" "TypeScript added"
    run_command "yarn add @carbon/icons-react" "Carbon Icons added"
    
    # Install npm packages
    print_info "Installing additional npm packages..."
    run_command "npm install openai" "OpenAI package installed"
    run_command "npm install cors" "CORS package installed"
    run_command "npm install express" "Express package installed"
    run_command "npm install http-proxy-middleware" "HTTP proxy middleware installed"
    
    print_success "All Node.js dependencies installed"
}

# Phase 6: Build Application
build_application() {
    print_step "🏗️  Building application..."
    
    # Ensure we're in the app directory
    cd "${SCRIPT_DIR}/${REPO_DIR}/${APP_DIR}" || {
        print_error "Failed to navigate to app directory"
        cleanup_on_error
    }
    
    if run_command "yarn build" "Application built successfully"; then
        print_success "Build completed"
    else
        print_error "Failed to build application"
        cleanup_on_error
    fi

# Phase 7: Configure Proxy and Web App
configure_proxy() {
    print_step "🔧 Configuring proxy and web application..."
    
    # Get the fully qualified hostname
    local fqdn=$(hostname -f)
    if [ -z "$fqdn" ]; then
        print_warning "Could not get FQDN, using hostname"
        fqdn=$(hostname)
    fi
    print_info "Server FQDN: $fqdn"
    
    # 1. Update proxy server configuration
    local proxy_file="${SCRIPT_DIR}/${REPO_DIR}/${APP_DIR}/src/llama-proxy/server_final.js"
    
    if [ ! -f "$proxy_file" ]; then
        print_error "Proxy configuration file not found: $proxy_file"
        cleanup_on_error
    fi
    
    # Backup proxy file
    if [ ! -f "${proxy_file}.backup" ]; then
        cp "$proxy_file" "${proxy_file}.backup"
        print_info "Created backup: ${proxy_file}.backup"
    fi
    
    print_info "Updating proxy server configuration..."
    # Replace hardcoded hostname in proxy (port 3000)
    sed -i "s|http://[^:]*:3000|http://${fqdn}:3000|g" "$proxy_file"
    
    if [ $? -eq 0 ]; then
        print_success "Proxy server configuration updated"
        if grep -q "http://${fqdn}:3000" "$proxy_file"; then
            print_success "Hostname verified in proxy config"
        fi
    else
        print_error "Failed to update proxy configuration"
        cleanup_on_error
    fi
    
    # 2. Update web application page
    local page_file="${SCRIPT_DIR}/${REPO_DIR}/${APP_DIR}/src/app/entextract/page.js"
    
    if [ ! -f "$page_file" ]; then
        print_error "Web page file not found: $page_file"
        cleanup_on_error
    fi
    
    # Backup page file
    if [ ! -f "${page_file}.backup" ]; then
        cp "$page_file" "${page_file}.backup"
        print_info "Created backup: ${page_file}.backup"
    fi
    
    print_info "Updating web application API URL..."
    # Replace hardcoded hostname in page.js (port 3001 - proxy port)
    sed -i "s|http://[^:]*:3001|http://${fqdn}:3001|g" "$page_file"
    
    if [ $? -eq 0 ]; then
        print_success "Web application API URL updated"
        if grep -q "http://${fqdn}:3001" "$page_file"; then
            print_success "Hostname verified in web app"
        fi
    else
        print_error "Failed to update web application"
        cleanup_on_error
    fi
    
    print_success "All hostname configurations updated successfully"
}

}


# Phase 8: Start Proxy Server
start_proxy_server() {
    print_step "🔌 Starting proxy server..."
    
    # Navigate to proxy directory
    local proxy_dir="${SCRIPT_DIR}/${REPO_DIR}/${APP_DIR}/src/llama-proxy"
    cd "$proxy_dir" || {
        print_error "Failed to navigate to proxy directory"
        cleanup_on_error
    }
    print_info "Working directory: $(pwd)"
    
    # Check if server_final.js exists
    if [ ! -f "server_final.js" ]; then
        print_error "Proxy server file not found: server_final.js"
        cleanup_on_error
    fi
    
    # Start proxy server in background
    log_message "INFO" "Starting proxy server with: nohup node server_final.js"
    nohup node server_final.js >> "$LOG_FILE" 2>&1 &
    local proxy_pid=$!
    
    # Save PID
    local proxy_pid_file="${SCRIPT_DIR}/proxy-server.pid"
    echo "$proxy_pid" > "$proxy_pid_file"
    print_success "Proxy server started (PID: $proxy_pid)"
    
    # Wait a moment and verify it's still running
    sleep 3
    if kill -0 "$proxy_pid" 2>/dev/null; then
        print_success "Proxy server is running on port 3001"
        log_message "INFO" "Proxy server verified running with PID: $proxy_pid"
    else
        print_error "Proxy server failed to start"
        log_message "ERROR" "Proxy server process died immediately"
        cleanup_on_error
    fi
}

# Phase 8: Start Dev Server
start_dev_server() {
    print_step "🚀 Starting development server..."
    
    # Ensure we're in the app directory
    cd "${SCRIPT_DIR}/${REPO_DIR}/${APP_DIR}" || {
        print_error "Failed to navigate to app directory"
        cleanup_on_error
    }
    
    # Start dev server in background
    log_message "INFO" "Starting dev server with: nohup yarn dev"
    nohup yarn dev >> "$LOG_FILE" 2>&1 &
    local server_pid=$!
    
    # Save PID
    echo "$server_pid" > "$PID_FILE"
    print_success "Dev server started (PID: $server_pid)"
    
    # Wait a moment and verify it's still running
    sleep 3
    if kill -0 "$server_pid" 2>/dev/null; then
        print_success "Dev server is running"
        log_message "INFO" "Dev server verified running with PID: $server_pid"
    else
        print_error "Dev server failed to start"
        log_message "ERROR" "Dev server process died immediately"
        cleanup_on_error
    fi
}

# Phase 9: Setup LLM Environment
setup_llm_env() {
    print_step "🤖 Setting up LLM environment..."
    
    # Return to script directory
    cd "$SCRIPT_DIR" || {
        print_error "Failed to navigate to script directory"
        cleanup_on_error
    }
    
    # Create LLM virtual environment
    if run_command "python3.12 -m venv $LLM_VENV_NAME" "LLM virtual environment created"; then
        print_info "LLM virtual environment: ${SCRIPT_DIR}/${LLM_VENV_NAME}"
    else
        print_error "Failed to create LLM virtual environment"
        cleanup_on_error
    fi
    
    # Activate LLM virtual environment
    source "${LLM_VENV_NAME}/bin/activate"
    if [ $? -eq 0 ]; then
        print_success "LLM virtual environment activated"
        log_message "INFO" "LLM virtual environment activated"
    else
        print_error "Failed to activate LLM virtual environment"
        cleanup_on_error
    fi
    
    # Upgrade pip
    if run_command "pip install --upgrade pip" "pip upgraded"; then
        local pip_version=$(pip --version)
        print_info "$pip_version"
    else
        print_error "Failed to upgrade pip"
        cleanup_on_error
    fi
    
    # Install PyTorch and OpenBLAS
    print_info "Installing PyTorch and OpenBLAS (this may take a while)..."
    if run_command "pip install --prefer-binary torch openblas --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux" "PyTorch and OpenBLAS installed"; then
        print_success "LLM dependencies installed"
    else
        print_error "Failed to install LLM dependencies"
        cleanup_on_error
    fi
}

# Phase 10: Clone and Build llama.cpp
build_llama_cpp() {
    print_step "🔨 Building llama.cpp..."
    
    # Return to script directory
    cd "$SCRIPT_DIR" || {
        print_error "Failed to navigate to script directory"
        cleanup_on_error
    }
    
    # Remove existing directory if present
    if [ -d "$LLAMA_DIR" ]; then
        print_warning "llama.cpp directory already exists, removing..."
        rm -rf "$LLAMA_DIR"
    fi
    
    # Clone llama.cpp
    if run_command "git clone $LLAMA_REPO_URL" "llama.cpp repository cloned"; then
        print_info "Repository: ${SCRIPT_DIR}/${LLAMA_DIR}"
    else
        print_error "Failed to clone llama.cpp repository"
        cleanup_on_error
    fi
    
    # Navigate to llama.cpp directory
    cd "$LLAMA_DIR" || {
        print_error "Failed to navigate to llama.cpp directory"
        cleanup_on_error
    }
    
    # Checkout specific commit
    if run_command "git checkout b6122" "Checked out commit b6122"; then
        print_success "Using stable llama.cpp version"
    else
        print_error "Failed to checkout specific commit"
        cleanup_on_error
    fi
    
    # Get OpenBLAS library path
    local openblas_lib="${SCRIPT_DIR}/${LLM_VENV_NAME}/lib/python3.12/site-packages/openblas/lib/libopenblas.so"
    local openblas_inc="${SCRIPT_DIR}/${LLM_VENV_NAME}/lib/python3.12/site-packages/openblas/include"
    
    # Configure build
    print_info "Configuring llama.cpp build..."
    local cmake_cmd="LD_LIBRARY_PATH=/opt/lib cmake -B build -DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS -DBLAS_LIBRARIES=${openblas_lib} -DBLAS_INCLUDE_DIRS=${openblas_inc} -DGGML_CUDA=OFF"
    if run_command "$cmake_cmd" "Build configured"; then
        print_success "CMake configuration complete"
    else
        print_error "Failed to configure build"
        cleanup_on_error
    fi
    
    # Build llama.cpp
    print_info "Building llama.cpp (this may take several minutes)..."
    if run_command "cmake --build build --config Release" "llama.cpp built successfully"; then
        print_success "Build completed"
    else
        print_error "Failed to build llama.cpp"
        cleanup_on_error
    fi
    
    # Verify build
    if [ -f "build/bin/llama-server" ]; then
        print_success "llama-server binary created"
    else
        print_error "llama-server binary not found"
        cleanup_on_error
    fi
}

# Phase 11: Download LLM Model
download_model() {
    print_step "📥 Downloading LLM model..."
    
    # Create models directory
    if run_command "mkdir -p $MODEL_DIR" "Models directory created"; then
        print_info "Models directory: $MODEL_DIR"
    else
        print_error "Failed to create models directory"
        cleanup_on_error
    fi
    
    # Check if model already exists
    if [ -f "${MODEL_DIR}/${MODEL_FILE}" ]; then
        print_warning "Model file already exists, skipping download"
        local model_size=$(du -h "${MODEL_DIR}/${MODEL_FILE}" | cut -f1)
        print_info "Existing model size: $model_size"
        return 0
    fi
    
    # Download model
    print_info "Downloading Granite 4.0 Micro model (this may take a while)..."
    if run_command "wget --quiet --show-progress $MODEL_URL -O ${MODEL_DIR}/${MODEL_FILE}" "Model downloaded successfully"; then
        local model_size=$(du -h "${MODEL_DIR}/${MODEL_FILE}" | cut -f1)
        print_success "Model downloaded: $model_size"
    else
        print_error "Failed to download model"
        cleanup_on_error
    fi
}

# Phase 12: Start LLM Server
start_llm_server() {
    print_step "🚀 Starting LLM server..."
    
    # Navigate to llama.cpp directory
    cd "${SCRIPT_DIR}/${LLAMA_DIR}" || {
        print_error "Failed to navigate to llama.cpp directory"
        cleanup_on_error
    }
    
    # Start llama-server in background
    log_message "INFO" "Starting llama-server with model: ${MODEL_DIR}/${MODEL_FILE}"
    nohup ./build/bin/llama-server -m "${MODEL_DIR}/${MODEL_FILE}" --host 0.0.0.0 >> "$LOG_FILE" 2>&1 &
    local server_pid=$!
    
    # Save PID
    echo "$server_pid" > "$LLM_PID_FILE"
    print_success "LLM server started (PID: $server_pid)"
    
    # Wait a moment and verify it's still running
    sleep 5
    if kill -0 "$server_pid" 2>/dev/null; then
        print_success "LLM server is running"
        log_message "INFO" "LLM server verified running with PID: $server_pid"
    else
        print_error "LLM server failed to start"
        log_message "ERROR" "LLM server process died immediately"
        cleanup_on_error
    fi
}

# ============================================================================
# SUMMARY
# ============================================================================

print_summary() {
    local elapsed=$(get_elapsed_time)
    
    echo ""
    echo -e "${GREEN}${BOLD}✅ Deployment Summary${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BOLD}📁 Installation Directory:${NC} ${SCRIPT_DIR}/${REPO_DIR}"
    echo -e "${BOLD}🐍 Web App Virtual Env:${NC} ${SCRIPT_DIR}/${VENV_NAME}"
    echo -e "${BOLD}🤖 LLM Virtual Env:${NC} ${SCRIPT_DIR}/${LLM_VENV_NAME}"
    echo -e "${BOLD}🌐 Web Dev Server:${NC} http://$(hostname -f):3000"
    echo -e "${BOLD}🔌 Proxy Server:${NC} http://$(hostname -f):3001"
    echo -e "${BOLD}🤖 LLM Server:${NC} http://localhost:8080"
    echo -e "${BOLD}📋 Log File:${NC} $LOG_FILE"
    echo -e "${BOLD}⏱️  Total Time:${NC} $elapsed"
    echo ""
    echo -e "${BOLD}🛑 To stop servers:${NC}"
    echo "   ./stop-server.sh  # Stops all servers"
    echo "   OR manually:"
    echo "   kill \$(cat $PID_FILE)        # Web server"
    echo "   kill \$(cat $PROXY_PID_FILE)  # Proxy server"
    echo "   kill \$(cat $LLM_PID_FILE)    # LLM server"
    echo ""
    echo -e "${BOLD}🔄 To check server status:${NC}"
    echo "   ./check-status.sh"
    echo ""
    echo -e "${BOLD}📖 For more information:${NC}"
    echo "   cat README.md"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${BLUE}Deployment automation created with Bob (Roo-Cline AI Assistant)${NC}"
    echo -e "${BLUE}https://github.com/RooVetGit/Roo-Cline${NC}"
    
    log_message "INFO" "Deployment completed successfully in $elapsed"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    # Print banner
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BOLD}${CYAN}Carbon GenAI Demo - Automated Deployment${NC}"
    echo -e "${BLUE}Created with Bob (Roo-Cline AI Assistant)${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Initialize log
    init_log
    log_message "INFO" "Starting deployment process"
    
    # Execute deployment phases
    preflight_checks
    update_system
    install_dependencies
    setup_python_env
    clone_repository
    install_node_dependencies
    build_application
    configure_proxy
    start_proxy_server
    start_dev_server
    setup_llm_env
    build_llama_cpp
    download_model
    start_llm_server
    
    # Print summary
    print_summary
    
    log_message "INFO" "Deployment script completed successfully"
}

# Trap errors
trap cleanup_on_error ERR

# Run main function
main

exit 0

# Deployment automation created with assistance from Bob (Roo-Cline AI Assistant)
# https://github.com/RooVetGit/Roo-Cline

# Made with Bob
