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

# Work from home directory, not from deployment subdirectory
WORK_DIR="$HOME"
DEPLOYMENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Store logs in home directory to avoid issues when repo is deleted/recreated
LOG_DIR="${WORK_DIR}/deployment"
mkdir -p "${LOG_DIR}"
LOG_FILE="${LOG_DIR}/carbon-deployment-$(date +%Y%m%d-%H%M%S).log"
PID_FILE="${WORK_DIR}/carbon-dev-server.pid"
PROXY_PID_FILE="${WORK_DIR}/proxy-server.pid"
LLM_PID_FILE="${WORK_DIR}/llama-server.pid"
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
TOTAL_STEPS=15

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
Working Directory: ${WORK_DIR}
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
    local free_space=$(df -BG "$WORK_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
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
    print_info "This may take several minutes. Progress indicators will show activity..."
    
    # Start a background spinner to show progress
    (
        local spin='-\|/'
        local i=0
        while kill -0 $$ 2>/dev/null; do
            i=$(( (i+1) %4 ))
            printf "\r${BLUE}⏳${NC} Updating packages... ${spin:$i:1} "
            sleep 0.5
        done
    ) &
    local spinner_pid=$!
    
    # Run the update
    if sudo dnf -y update >> "$LOG_FILE" 2>&1; then
        kill $spinner_pid 2>/dev/null
        wait $spinner_pid 2>/dev/null
        printf "\r"
        print_success "System packages updated"
        return 0
    else
        kill $spinner_pid 2>/dev/null
        wait $spinner_pid 2>/dev/null
        printf "\r"
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
        print_info "Virtual environment: ${WORK_DIR}/${VENV_NAME}"
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
        print_info "Repository: ${WORK_DIR}/${REPO_DIR}"
        
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
    run_command "yarn add @carbon/react@latest" "Carbon React added"
    run_command "yarn add sass@1.63.6" "Sass added"
    run_command "yarn add typescript" "TypeScript added"
    run_command "yarn add @carbon/icons-react@latest" "Carbon Icons added"
    run_command "yarn add @carbon/pictograms-react@latest" "Carbon Pictograms added"
    
    # Install npm packages
    print_info "Installing additional npm packages..."
    run_command "npm install openai" "OpenAI package installed"
    run_command "npm install cors" "CORS package installed"
    run_command "npm install express" "Express package installed"
    run_command "npm install http-proxy-middleware" "HTTP proxy middleware installed"
    
    # Install proxy server dependencies
    print_info "Installing proxy server dependencies..."
    local proxy_dir="${WORK_DIR}/${REPO_DIR}/${APP_DIR}/src/llama-proxy"
    if [ -d "$proxy_dir" ]; then
        cd "$proxy_dir" || {
            print_error "Failed to navigate to proxy directory"
            cleanup_on_error
        }
        if run_command "npm install" "Proxy dependencies installed"; then
            print_success "Proxy server dependencies installed"
        else
            print_error "Failed to install proxy dependencies"
            cleanup_on_error
        fi
        # Return to app directory
        cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}" || {
            print_error "Failed to return to app directory"
            cleanup_on_error
        }
    else
        print_warning "Proxy directory not found, skipping proxy dependency installation"
    fi
    
    print_success "All Node.js dependencies installed"
}

# Phase 6: Build Application
build_application() {
    print_step "🏗️  Building application..."
    
    # Ensure we're in the app directory
    cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}" || {
        print_error "Failed to navigate to app directory"
        cleanup_on_error
    }
    
    # Create .eslintrc.json to disable strict apostrophe checking
    print_info "Configuring ESLint rules..."
    cat > .eslintrc.json << 'EOF'
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/no-unescaped-entities": "off"
  }
}
EOF
    
    if [ $? -eq 0 ]; then
        print_success "ESLint configured"
    else
        print_warning "Failed to create ESLint config, continuing anyway..."
    fi
    
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
    local proxy_file="${WORK_DIR}/${REPO_DIR}/${APP_DIR}/src/llama-proxy/server_final.js"
    
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
    # Update all demo pages (entextract, piiextract, convintel)
    for page in entextract piiextract convintel; do
        local page_file="${WORK_DIR}/${REPO_DIR}/${APP_DIR}/src/app/${page}/page.js"
        
        if [ -f "$page_file" ]; then
            # Backup page file
            if [ ! -f "${page_file}.backup" ]; then
                cp "$page_file" "${page_file}.backup"
                print_info "Created backup: ${page_file}.backup"
            fi
            
            print_info "Updating ${page} API URL..."
            # Replace hardcoded hostname in page.js (port 3001 - proxy port)
            sed -i "s|http://[^:]*:3001|http://${fqdn}:3001|g" "$page_file"
            
            if [ $? -eq 0 ]; then
                print_success "${page} API URL updated"
            else
                print_warning "Failed to update ${page} (may not exist yet)"
            fi
        else
            print_info "Skipping ${page} (file not found)"
        fi
    done
    
    print_success "All hostname configurations updated successfully"
}

}


# Phase 8: Start Proxy Server
start_proxy_server() {
    print_step "🔌 Starting proxy server..."
    
    # Navigate to proxy directory
    local proxy_dir="${WORK_DIR}/${REPO_DIR}/${APP_DIR}/src/llama-proxy"
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
    local proxy_pid_file="${WORK_DIR}/proxy-server.pid"
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
        
        # Capture and display the last error from the log
        print_error "Last 20 lines from log file:"
        tail -20 "$LOG_FILE" | while IFS= read -r line; do
            echo "  $line"
        done
        
        # Also check if there's a specific Node.js error
        if grep -i "error" "$LOG_FILE" | tail -5 > /dev/null 2>&1; then
            print_error "Recent errors found in log:"
            grep -i "error" "$LOG_FILE" | tail -5 | while IFS= read -r line; do
                echo "  $line"
            done
        fi
        
        cleanup_on_error
    fi
}

# Phase 8: Build and Start Production Server
start_dev_server() {
    print_step "🏗️  Building Next.js application..."
    
    # Ensure we're in the app directory
    cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}" || {
        print_error "Failed to navigate to app directory"
        cleanup_on_error
    }
    
    # Build the application first to avoid on-demand compilation
    log_message "INFO" "Building application with: yarn build"
    print_info "This may take a few minutes..."
    if yarn build >> "$LOG_FILE" 2>&1; then
        print_success "Application built successfully"
        log_message "INFO" "Next.js build completed"
    else
        print_error "Build failed. Check log file: $LOG_FILE"
        cleanup_on_error
    fi
    
    print_step "🚀 Starting production server..."
    
    # Start production server in background
    log_message "INFO" "Starting production server with: nohup yarn start"
    nohup yarn start >> "$LOG_FILE" 2>&1 &
    local server_pid=$!
    
    # Save PID
    echo "$server_pid" > "$PID_FILE"
    print_success "Production server started (PID: $server_pid)"
    
    # Wait a moment and verify it's still running
    sleep 3
    if kill -0 "$server_pid" 2>/dev/null; then
        print_success "Production server is running"
        log_message "INFO" "Production server verified running with PID: $server_pid"
    else
        print_error "Production server failed to start"
        log_message "ERROR" "Production server process died immediately"
        cleanup_on_error
    fi
}

# Phase 9: Setup LLM Environment
setup_llm_env() {
    print_step "🤖 Setting up LLM environment..."
    
    # Return to working directory
    cd "$WORK_DIR" || {
        print_error "Failed to navigate to working directory"
        cleanup_on_error
    }
    
    # Create LLM virtual environment
    if run_command "python3.12 -m venv $LLM_VENV_NAME" "LLM virtual environment created"; then
        print_info "LLM virtual environment: ${WORK_DIR}/${LLM_VENV_NAME}"
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
    
    # Return to working directory
    cd "$WORK_DIR" || {
        print_error "Failed to navigate to working directory"
        cleanup_on_error
    }
    
    # Check if llama.cpp is already built
    if [ -d "$LLAMA_DIR" ] && [ -f "${LLAMA_DIR}/build/bin/llama-server" ]; then
        print_warning "llama.cpp already built, skipping rebuild"
        print_info "Existing build: ${WORK_DIR}/${LLAMA_DIR}"
        print_info "To force rebuild, remove directory: rm -rf ${WORK_DIR}/${LLAMA_DIR}"
        return 0
    fi
    
    # Remove existing directory if present but not built
    if [ -d "$LLAMA_DIR" ]; then
        print_warning "llama.cpp directory exists but not built, removing..."
        rm -rf "$LLAMA_DIR"
    fi
    
    # Clone llama.cpp
    if run_command "git clone $LLAMA_REPO_URL" "llama.cpp repository cloned"; then
        print_info "Repository: ${WORK_DIR}/${LLAMA_DIR}"
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
    local openblas_lib="${WORK_DIR}/${LLM_VENV_NAME}/lib/python3.12/site-packages/openblas/lib/libopenblas.so"
    local openblas_inc="${WORK_DIR}/${LLM_VENV_NAME}/lib/python3.12/site-packages/openblas/include"
    
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
    cd "${WORK_DIR}/${LLAMA_DIR}" || {
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

# Phase 13: Setup PassportEye
setup_passporteye() {
    print_step "📸 Setting up PassportEye OCR service..."
    
    # Return to working directory
    cd "$WORK_DIR" || {
        print_error "Failed to navigate to working directory"
        cleanup_on_error
    }
    
    # Check if setup script exists
    local setup_script="${WORK_DIR}/${REPO_DIR}/deployment/setup-passporteye.sh"
    if [ ! -f "$setup_script" ]; then
        print_warning "PassportEye setup script not found, skipping..."
        print_info "PassportEye can be set up later using: ./deployment/setup-passporteye.sh"
        return 0
    fi
    
    # Make script executable
    chmod +x "$setup_script"
    
    # Run PassportEye setup
    print_info "Running PassportEye setup script..."
    if bash "$setup_script" >> "$LOG_FILE" 2>&1; then
        print_success "PassportEye installed successfully"
        
        # Start PassportEye service
        local service_script="${WORK_DIR}/${REPO_DIR}/deployment/start-passporteye-service.sh"
        if [ -f "$service_script" ]; then
            chmod +x "$service_script"
            print_info "Starting PassportEye service..."
            if bash "$service_script" >> "$LOG_FILE" 2>&1; then
                print_success "PassportEye service started on port 5000"
            else
                print_warning "Failed to start PassportEye service (can be started manually later)"
            fi
        fi
    else
        print_warning "PassportEye setup failed (optional feature)"
        print_info "You can set it up manually later using: ./deployment/setup-passporteye.sh"
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
    echo -e "${BOLD}📁 Installation Directory:${NC} ${WORK_DIR}/${REPO_DIR}"
    echo -e "${BOLD}🐍 Web App Virtual Env:${NC} ${WORK_DIR}/${VENV_NAME}"
    echo -e "${BOLD}🤖 LLM Virtual Env:${NC} ${WORK_DIR}/${LLM_VENV_NAME}"
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
    
    # Change to working directory (home directory)
    cd "$WORK_DIR" || {
        print_error "Failed to navigate to working directory: $WORK_DIR"
        exit 1
    }
    log_message "INFO" "Working directory: $WORK_DIR"
    
    # Execute deployment phases
    preflight_checks
    update_system
    install_dependencies
    setup_python_env
    clone_repository
    install_node_dependencies
    build_application
    configure_proxy
    setup_llm_env
    build_llama_cpp
    download_model
    start_llm_server
    setup_passporteye
    start_proxy_server
    start_dev_server
    
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
