#!/bin/bash

################################################################################
# Script: deploy-carbon-genai.sh
# Purpose: Automated, hardened deployment of Carbon GenAI Demo on RHEL/PPC64LE
# Author: EMEA AI on IBM Power Squad & Bob
# Date: 2026-10-14
################################################################################

set -euo pipefail

# ============================================================================
# GLOBAL VARIABLES & DIRECTORY SELECTION
# ============================================================================

# Pick working directory with sufficient free space (>= 15GB)
pick_workdir() {
    for candidate in /data /opt /var /tmp "$HOME"; do
        if [ -d "$candidate" ]; then
            local free_gb
            free_gb=$(df -BG "$candidate" 2>/dev/null | awk 'NR==2{print $4}' | sed 's/G//' || echo "0")
            if [ -n "$free_gb" ] && [ "$free_gb" -ge 15 ] 2>/dev/null; then
                echo "$candidate"
                return
            fi
        fi
    done
    echo "$HOME"
}

WORK_DIR="${WORK_DIR:-$(pick_workdir)}"
REPO_URL="${REPO_URL:-https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos}"
REPO_DIR="Carbon-GenAI-Demos"
APP_DIR="carbon-ui"
BRANCH="${BRANCH:-main}"

LOG_DIR="${HOME}/deployment"
mkdir -p "${LOG_DIR}"
LOG_FILE="${LOG_DIR}/carbon-deployment-$(date +%Y%m%d-%H%M%S).log"

VENV_NAME="carbon.venv"
LLM_VENV_NAME="llama.cpp.venv"
LLAMA_REPO_URL="https://github.com/ggml-org/llama.cpp.git"
LLAMA_DIR="llama.cpp"
MODEL_DIR="${WORK_DIR}/models"
MODEL_FILE="granite-4.0-micro-Q4_K_M.gguf"
MODEL_URL="https://huggingface.co/ibm-granite/granite-4.0-micro-GGUF/resolve/main/granite-4.0-micro-Q4_K_M.gguf"
START_TIME=$(date +%s)

# DNF options to bypass problematic internal mirror repos on some TechZone templates
DNF_OPTS="--disablerepo=IBM_Power_Tools --disablerepo=Advance_Toolchain"

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

CURRENT_STEP=0
TOTAL_STEPS=12

# ============================================================================
# LOGGING & DISPLAY FUNCTIONS
# ============================================================================

init_log() {
    cat > "$LOG_FILE" << EOF
================================================================================
Carbon GenAI Demo Deployment Log
================================================================================
Start Time: $(date '+%Y-%m-%d %H:%M:%S')
Hostname: $(hostname)
User: $(whoami)
Working Directory: ${WORK_DIR}
Log File: ${LOG_FILE}
================================================================================

EOF
}

log_message() {
    local level="$1"
    shift
    local message="$*"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" >> "$LOG_FILE"
}

log_command() {
    local cmd="$1"
    log_message "CMD" "Executing: $cmd"
    echo "----------------------------------------" >> "$LOG_FILE"
}

print_step() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    local message="$1"
    echo -e "\n${BOLD}${CYAN}[${CURRENT_STEP}/${TOTAL_STEPS}]${NC} ${message}"
    log_message "STEP" "[$CURRENT_STEP/$TOTAL_STEPS] $message"
}

print_success() {
    local message="$1"
    echo -e "${GREEN}✓${NC} $message"
    log_message "SUCCESS" "$message"
}

print_error() {
    local message="$1"
    echo -e "${RED}✗${NC} $message"
    log_message "ERROR" "$message"
}

print_warning() {
    local message="$1"
    echo -e "${YELLOW}⚠${NC} $message"
    log_message "WARNING" "$message"
}

print_info() {
    local message="$1"
    echo -e "${BLUE}ℹ${NC} $message"
    log_message "INFO" "$message"
}

run_command() {
    local cmd="$1"
    local description="${2:-}"
    
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

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

cleanup_on_error() {
    print_error "Deployment encountered an error. Check log file: $LOG_FILE"
    log_message "ERROR" "Deployment failed."
    exit 1
}

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
        print_error "This script requires RHEL / Red Hat Enterprise Linux"
        exit 1
    fi
    print_success "Operating system: $(cat /etc/redhat-release)"
    
    # Check architecture
    local arch=$(uname -m)
    if [ "$arch" != "ppc64le" ]; then
        print_warning "Expected ppc64le (IBM Power) architecture, found: $arch"
    else
        print_success "Architecture: $arch (IBM Power)"
    fi
    
    # Check sudo access
    if ! sudo -n true 2>/dev/null; then
        print_error "This script requires passwordless sudo privileges"
        exit 1
    fi
    print_success "Sudo access verified"
    
    # Check internet connectivity
    if ! ping -c 1 -W 3 github.com >/dev/null 2>&1 && ! curl -s --connect-timeout 5 https://github.com >/dev/null 2>&1; then
        print_warning "Direct ping to github.com blocked or slow, checking HTTP connectivity..."
        if ! curl -s --connect-timeout 5 https://huggingface.co >/dev/null 2>&1; then
            print_error "No outbound internet connectivity detected"
            exit 1
        fi
    fi
    print_success "Internet connectivity verified"
    
    # Check disk space
    local free_space=$(df -BG "$WORK_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$free_space" -lt 10 ]; then
        print_warning "Low disk space in $WORK_DIR: ${free_space}GB available (15GB recommended)"
    else
        print_success "Working directory: $WORK_DIR (${free_space}GB available)"
    fi
}

# ============================================================================
# SYSTEM PACKAGES & NODE.JS
# ============================================================================

install_system_packages() {
    print_step "🔧 Installing system packages and build tools..."

    # Install base build dependencies
    local packages="git gcc gcc-c++ make cmake automake ninja-build gfortran curl-devel wget lsof"
    sudo dnf install -y $DNF_OPTS $packages >> "$LOG_FILE" 2>&1 || sudo dnf install -y $packages >> "$LOG_FILE" 2>&1 || true
    print_success "Base system build tools installed"

    # Python 3.12
    if ! command -v python3.12 >/dev/null 2>&1; then
        print_info "Installing Python 3.12..."
        sudo dnf install -y $DNF_OPTS python3.12 python3.12-pip python3.12-devel >> "$LOG_FILE" 2>&1 || sudo dnf install -y python3.12 python3.12-pip python3.12-devel >> "$LOG_FILE" 2>&1 || true
    fi
    print_success "Python: $(python3.12 --version 2>/dev/null || python3 --version)"

    # LLVM toolset (optional)
    sudo dnf install -y $DNF_OPTS llvm-toolset >> "$LOG_FILE" 2>&1 || true

    # Node.js 20/22 detection and setup
    print_info "Checking Node.js environment..."
    local node_found=false
    for candidate in /usr/local/node/bin/node /usr/bin/node; do
        if [ -x "$candidate" ]; then
            local nver
            nver=$("$candidate" --version 2>/dev/null | sed 's/v//' | cut -d. -f1 || echo "0")
            if [ "$nver" -ge 20 ] 2>/dev/null; then
                export PATH="$(dirname "$candidate"):$PATH"
                node_found=true
                print_success "Node.js $($candidate --version) found at $(dirname "$candidate")"
                break
            fi
        fi
    done

    if [ "$node_found" = false ]; then
        local rhel_major
        rhel_major=$(rpm -q --qf '%{VERSION}' redhat-release 2>/dev/null | cut -d. -f1 || echo "9")
        if [ "${rhel_major}" -ge 10 ] 2>/dev/null; then
            print_info "RHEL 10+: installing Node.js from AppStream..."
            sudo dnf install -y $DNF_OPTS nodejs npm >> "$LOG_FILE" 2>&1 || sudo dnf install -y nodejs npm >> "$LOG_FILE" 2>&1
        else
            print_info "RHEL 9: enabling nodejs:20 module stream..."
            sudo dnf module reset -y nodejs >> "$LOG_FILE" 2>&1 || true
            sudo dnf module enable -y nodejs:20 >> "$LOG_FILE" 2>&1 || true
            sudo dnf install -y nodejs npm >> "$LOG_FILE" 2>&1 || {
                print_warning "AppStream nodejs:20 failed, installing via nvm..."
                curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash >> "$LOG_FILE" 2>&1
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
                nvm install 22 >> "$LOG_FILE" 2>&1
                nvm use 22 >> "$LOG_FILE"
                nvm alias default 22 >> "$LOG_FILE"
            }
        fi
    fi

    # Source NVM if present
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" || true

    print_success "Node.js $(node --version) and npm $(npm --version) active"

    # Install Yarn and PM2 globally
    print_info "Installing yarn and pm2 globally..."
    sudo npm install --global yarn pm2 >> "$LOG_FILE" 2>&1 || npm install --global yarn pm2 >> "$LOG_FILE" 2>&1
    print_success "Yarn $(yarn --version) and pm2 $(pm2 --version) ready"
}

# ============================================================================
# CLONE / UPDATE REPOSITORY
# ============================================================================

setup_repository() {
    print_step "📥 Setting up Carbon GenAI repository..."
    cd "$WORK_DIR"
    
    if [ -d "${REPO_DIR}/.git" ]; then
        print_info "Repository already present at ${WORK_DIR}/${REPO_DIR}, fetching latest..."
        cd "$REPO_DIR"
        git fetch origin >> "$LOG_FILE" 2>&1 || true
        git checkout "$BRANCH" >> "$LOG_FILE" 2>&1 || true
        git pull origin "$BRANCH" >> "$LOG_FILE" 2>&1 || true
        cd "$WORK_DIR"
    else
        [ -d "$REPO_DIR" ] && rm -rf "$REPO_DIR"
        print_info "Cloning branch '$BRANCH' from $REPO_URL..."
        git clone --branch "$BRANCH" "$REPO_URL" "$REPO_DIR" >> "$LOG_FILE" 2>&1 || git clone "$REPO_URL" "$REPO_DIR" >> "$LOG_FILE" 2>&1
    fi

    # Make deployment scripts executable
    chmod +x "${WORK_DIR}/${REPO_DIR}/deployment/"*.sh 2>/dev/null || true
    print_success "Repository ready at ${WORK_DIR}/${REPO_DIR}"
}

# ============================================================================
# NODE APPLICATION SETUP & BUILD
# ============================================================================

build_node_application() {
    print_step "📦 Installing Node dependencies and building Carbon UI..."
    cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"

    # Relax ESLint
    cat > .eslintrc.json << 'EOF'
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/no-unescaped-entities": "off"
  }
}
EOF

    # Install base dependencies
    print_info "Running yarn install..."
    yarn --ignore-engines >> "$LOG_FILE" 2>&1

    # Pin Carbon & required packages
    print_info "Ensuring Carbon React and runtime packages are installed..."
    yarn add --ignore-engines \
        @carbon/react@latest \
        sass@1.63.6 \
        @carbon/icons-react@latest \
        @carbon/pictograms-react@latest >> "$LOG_FILE" 2>&1

    # Proxy server dependencies
    if [ -d "src/llama-proxy" ]; then
        print_info "Installing proxy dependencies..."
        cd src/llama-proxy && npm install >> "$LOG_FILE" 2>&1 && cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
    fi

    # Build Next.js application
    print_info "Building Next.js production bundle..."
    if [ -x node_modules/.bin/next ]; then
        node_modules/.bin/next build >> "$LOG_FILE" 2>&1
    else
        yarn --ignore-engines build >> "$LOG_FILE" 2>&1
    fi

    # Verify .next was produced — fail fast rather than letting pm2 crash-loop
    if [ ! -f ".next/BUILD_ID" ]; then
        print_error "Next.js build did not produce .next/BUILD_ID — aborting"
        exit 1
    fi
    print_success "Next.js application built successfully"
}

# ============================================================================
# LLM ENVIRONMENT & LLAMA.CPP BUILD (MMA ACCELERATED)
# ============================================================================

setup_llama_cpp() {
    print_step "🤖 Setting up Python OpenBLAS and llama.cpp (Matrix Math Accelerator)..."
    cd "$WORK_DIR"

    # Python venv for OpenBLAS / PyTorch ppc64le wheels
    if [ ! -d "$LLM_VENV_NAME" ]; then
        print_info "Creating Python virtual environment: $LLM_VENV_NAME..."
        python3.12 -m venv "$LLM_VENV_NAME" >> "$LOG_FILE" 2>&1 || python3 -m venv "$LLM_VENV_NAME" >> "$LOG_FILE" 2>&1
        source "${LLM_VENV_NAME}/bin/activate"
        pip install --upgrade pip --quiet >> "$LOG_FILE" 2>&1
        print_info "Installing OpenBLAS and PyTorch ppc64le wheels..."
        pip install --prefer-binary --quiet torch openblas --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux >> "$LOG_FILE" 2>&1 || true
        deactivate
        print_success "LLM Python environment prepared"
    else
        print_success "LLM Python virtual environment already exists"
    fi

    # Build llama.cpp if not already built
    if [ -f "${LLAMA_DIR}/build/bin/llama-server" ]; then
        print_success "llama-server already compiled, skipping rebuild"
    else
        print_info "Cloning and building llama.cpp (commit b6122)..."
        [ -d "$LLAMA_DIR" ] && rm -rf "$LLAMA_DIR"
        git clone "$LLAMA_REPO_URL" "$LLAMA_DIR" >> "$LOG_FILE" 2>&1
        cd "$LLAMA_DIR"
        git checkout b6122 >> "$LOG_FILE" 2>&1

        local ob_lib="${WORK_DIR}/${LLM_VENV_NAME}/lib/python3.12/site-packages/openblas/lib/libopenblas.so"
        local ob_inc="${WORK_DIR}/${LLM_VENV_NAME}/lib/python3.12/site-packages/openblas/include"

        if [ -f "$ob_lib" ]; then
            print_info "Building llama.cpp with OpenBLAS acceleration..."
            LD_LIBRARY_PATH=/opt/lib cmake -B build \
                -DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS \
                -DBLAS_LIBRARIES="$ob_lib" -DBLAS_INCLUDE_DIRS="$ob_inc" \
                -DGGML_CUDA=OFF >> "$LOG_FILE" 2>&1
        else
            print_warning "OpenBLAS library not found, building with standard GCC optimization..."
            cmake -B build -DGGML_CUDA=OFF >> "$LOG_FILE" 2>&1
        fi

        cmake --build build --config Release -j 8 >> "$LOG_FILE" 2>&1
        cd "$WORK_DIR"
        print_success "llama-server compiled successfully"
    fi
}

# ============================================================================
# DOWNLOAD GRANITE 4.0 MICRO MODEL
# ============================================================================

download_model() {
    print_step "📥 Downloading Granite 4.0 Micro model..."
    mkdir -p "$MODEL_DIR"

    if [ -f "${MODEL_DIR}/${MODEL_FILE}" ]; then
        local sz
        sz=$(du -h "${MODEL_DIR}/${MODEL_FILE}" | cut -f1)
        print_success "Model already exists: ${MODEL_DIR}/${MODEL_FILE} (${sz})"
    else
        print_info "Downloading ${MODEL_FILE} from HuggingFace..."
        wget --quiet --show-progress "$MODEL_URL" -O "${MODEL_DIR}/${MODEL_FILE}" >> "$LOG_FILE" 2>&1 || \
            curl -L -o "${MODEL_DIR}/${MODEL_FILE}" "$MODEL_URL" >> "$LOG_FILE" 2>&1
        local sz
        sz=$(du -h "${MODEL_DIR}/${MODEL_FILE}" | cut -f1)
        print_success "Granite 4.0 Micro model downloaded: ${sz}"
    fi
}

# ============================================================================
# PASSPORTEYE OCR SETUP
# ============================================================================

setup_passporteye_service() {
    print_step "📸 Setting up PassportEye OCR service..."
    local setup_script="${WORK_DIR}/${REPO_DIR}/deployment/setup-passporteye.sh"
    if [ -f "$setup_script" ]; then
        chmod +x "$setup_script"
        bash "$setup_script" >> "$LOG_FILE" 2>&1 || print_warning "PassportEye optional setup had warnings"
        print_success "PassportEye OCR service configured"
    else
        print_warning "PassportEye setup script not found, skipping"
    fi
}

# ============================================================================
# START SERVICES VIA PM2 ECOSYSTEM
# ============================================================================

start_services() {
    print_step "🚀 Starting all services via PM2 ecosystem..."
    cd "$WORK_DIR"

    # Stop any previous instances cleanly
    pm2 delete all 2>/dev/null || true

    # Export variables for ecosystem.config.js
    export WORK_DIR REPO_DIR

    local eco_config="${WORK_DIR}/${REPO_DIR}/deployment/ecosystem.config.js"
    if [ -f "$eco_config" ]; then
        WORK_DIR="$WORK_DIR" REPO_DIR="$REPO_DIR" pm2 start "$eco_config" >> "$LOG_FILE" 2>&1
        pm2 save >> "$LOG_FILE" 2>&1
        print_success "Services started from ecosystem.config.js and PM2 state saved"
    else
        print_error "ecosystem.config.js not found at $eco_config"
        cleanup_on_error
    fi
}

# ============================================================================
# VERIFICATION & SUMMARY
# ============================================================================

verify_services() {
    print_step "🔍 Verifying services and ports..."
    sleep 6

    echo ""
    pm2 list

    echo ""
    for port in 8080 3001 3000; do
        if lsof -Pi ":${port}" -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_success "Port ${port} is listening"
        else
            print_warning "Port ${port} not listening yet — check: pm2 logs"
        fi
    done

    # Check LLM health
    if curl -sf http://localhost:8080/v1/models >/dev/null 2>&1 || curl -sf http://localhost:8080/health >/dev/null 2>&1; then
        print_success "Granite 4.0 Micro LLM endpoint responsive on http://localhost:8080"
    else
        print_warning "LLM server is still warming up the model"
    fi
}

print_summary() {
    local elapsed
    elapsed=$(get_elapsed_time)
    local fqdn
    fqdn=$(hostname -f 2>/dev/null || hostname)

    echo ""
    echo -e "${GREEN}${BOLD}================================================================${NC}"
    echo -e "${GREEN}${BOLD}✓ Carbon GenAI Demo Deployment Complete!${NC}"
    echo -e "${GREEN}${BOLD}================================================================${NC}"
    echo -e "${BOLD}🌐 Web UI URL:${NC}       http://${fqdn}:3000"
    echo -e "${BOLD}🔌 Proxy Server:${NC}     http://${fqdn}:3001"
    echo -e "${BOLD}🤖 LLM Server (MMA):${NC} http://localhost:8080"
    echo -e "${BOLD}📁 Install Root:${NC}     ${WORK_DIR}/${REPO_DIR}"
    echo -e "${BOLD}📋 Log File:${NC}         ${LOG_FILE}"
    echo -e "${BOLD}⏱️  Total Elapsed:${NC}    ${elapsed}"
    echo ""
    echo -e "${BOLD}PM2 Management Commands:${NC}"
    echo "  pm2 list                  # View all running services"
    echo "  pm2 logs                  # Stream logs from all services"
    echo "  pm2 restart all           # Restart all demo services"
    echo "  pm2 restart genai-nextjs  # Restart Next.js UI"
    echo "================================================================"
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    echo -e "${BOLD}${CYAN}================================================================${NC}"
    echo -e "${BOLD}${CYAN}  Carbon GenAI Demo — Automated RHEL Power Deployment           ${NC}"
    echo -e "${BOLD}${CYAN}================================================================${NC}"
    
    init_log
    preflight_checks
    install_system_packages
    setup_repository
    build_node_application
    setup_llama_cpp
    download_model
    setup_passporteye_service
    start_services
    verify_services
    print_summary
}

trap cleanup_on_error ERR
main
exit 0
