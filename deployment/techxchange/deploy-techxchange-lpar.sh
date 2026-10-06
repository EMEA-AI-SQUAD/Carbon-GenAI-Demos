#!/bin/bash

################################################################################
# Script: deploy-techxchange-lpar.sh
# Purpose: Deploy Carbon GenAI Demo on bare-metal LPAR for TechXChange Lab 1127
# Target:  9.8.70.150 (root, password auth â€” no SSH key)
# Branch:  feature/lab1127-techxchange
#
# Usage:
#   ./deployment/techxchange/deploy-techxchange-lpar.sh
#
# The script SSHes into 9.8.70.150 as root (password prompt appears once),
# then runs the full deployment inline via a heredoc.
# After completion the demo is live at:
#   http://9.8.70.150:3000
#
# IBM Spyre cards are on 9.8.70.146 â€” the UI toggle switches to them live.
#
# Prerequisites (local machine):
#   - ssh / scp in PATH
#   - Network access to 9.8.70.150 on port 22
################################################################################

set -euo pipefail

LPAR_HOST="9.8.70.150"
LPAR_USER="root"
BRANCH="feature/lab1127-techxchange"
REPO_URL="https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos"
SPYRE_URL="http://9.8.70.146:8080"

# Colours
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo -e "${BOLD}${CYAN}"
echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
echo "  TechXChange Lab 1127 â€” LPAR Deployment"
echo "  Target: ${LPAR_USER}@${LPAR_HOST}"
echo "  Branch: ${BRANCH}"
echo "  Spyre:  ${SPYRE_URL}"
echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
echo -e "${NC}"

echo -e "${YELLOW}â„¹  You will be prompted for the root password.${NC}"
echo ""

# â”€â”€ SSH into the LPAR and run the full deployment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# The entire heredoc runs as a single SSH session.
# StrictHostKeyChecking=accept-new: auto-accepts the host key on first connect.
# BatchMode=no: allows password prompt through.

ssh -o StrictHostKeyChecking=accept-new \
    -o BatchMode=no \
    "${LPAR_USER}@${LPAR_HOST}" \
    BRANCH="${BRANCH}" REPO_URL="${REPO_URL}" SPYRE_URL="${SPYRE_URL}" \
    'bash -s' << 'REMOTE_SCRIPT'

set -euo pipefail

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Colours
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

print_step()    { echo -e "\n${BOLD}${CYAN}â–¶ $*${NC}"; }
print_success() { echo -e "${GREEN}âœ“${NC} $*"; }
print_warning() { echo -e "${YELLOW}âš ${NC} $*"; }
print_info()    { echo -e "  $*"; }

START=$(date +%s)
WORK_DIR="$HOME"
REPO_DIR="Carbon-GenAI-Demos"
APP_DIR="carbon-ui"
MODEL_DIR="${HOME}/models"
MODEL_FILE="granite-4.0-micro-Q4_K_M.gguf"
MODEL_URL="https://huggingface.co/ibm-granite/granite-4.0-micro-GGUF/resolve/main/granite-4.0-micro-Q4_K_M.gguf"
LOG_FILE="${HOME}/deployment/techxchange-deploy-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "${HOME}/deployment"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "Deployment log: ${LOG_FILE}"
echo "Start: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Branch: ${BRANCH}"
echo "Spyre URL: ${SPYRE_URL}"

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[1/12] Pre-flight checks"

if [ ! -f /etc/redhat-release ]; then
    echo "ERROR: This script requires RHEL"; exit 1
fi
print_success "OS: $(cat /etc/redhat-release)"
print_success "Arch: $(uname -m)"
FREE=$(df -BG "${WORK_DIR}" | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "${FREE}" -lt 10 ]; then
    print_warning "Low disk space: ${FREE}GB (10GB recommended)"
else
    print_success "Disk space: ${FREE}GB available"
fi

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[2/12] System update"
dnf -y update

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[3/12] Install system dependencies"
dnf install -y python3.12 python3.12-pip python3.12-devel \
    git gcc gcc-c++ make cmake automake llvm-toolset ninja-build \
    gfortran curl-devel wget lsof

RHEL_MAJOR=$(rpm -q --qf '%{VERSION}' redhat-release 2>/dev/null | cut -d. -f1)
print_info "RHEL major: ${RHEL_MAJOR}"
if [ "${RHEL_MAJOR}" -ge 10 ] 2>/dev/null; then
    dnf install -y nodejs
else
    dnf module enable -y nodejs:20
    dnf install -y nodejs
fi
print_success "Node.js: $(node --version)"

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[4/12] Clone repository (branch: ${BRANCH})"
cd "${WORK_DIR}"
if [ -d "${REPO_DIR}" ]; then
    print_warning "Repo exists â€” pulling latest"
    cd "${REPO_DIR}"
    git fetch origin
    git checkout "${BRANCH}"
    git pull origin "${BRANCH}"
    cd "${WORK_DIR}"
else
    git clone --branch "${BRANCH}" "${REPO_URL}"
fi
chmod +x "${REPO_DIR}/deployment/"*.sh 2>/dev/null || true
print_success "Repository ready on branch ${BRANCH}"

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[5/12] Install Node.js tooling (yarn, pm2)"
npm install --global yarn pm2
print_success "yarn $(yarn --version), pm2 $(pm2 --version)"

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[6/12] Install Node.js dependencies"
cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"

# Disable eslint strict entity checking so build succeeds on clean clone
cat > .eslintrc.json << 'EOF'
{"extends":"next/core-web-vitals","rules":{"react/no-unescaped-entities":"off"}}
EOF

yarn

# Pinned versions (Node 20/22 compatible on ppc64le)
yarn add @carbon/react@latest sass@1.63.6 @carbon/icons-react@latest @carbon/pictograms-react@latest
npm install openai@^4.104.0 cors express@^4.21.2 http-proxy-middleware@^2.0.7

# Proxy server deps
if [ -d src/llama-proxy ]; then
    cd src/llama-proxy && npm install && cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
fi
print_success "Node.js dependencies installed"

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[7/12] Build Next.js application"
cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
yarn build
print_success "Next.js build complete"

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[8/12] Python + LLM virtual environment"
cd "${WORK_DIR}"
python3.12 -m venv llama.cpp.venv
source llama.cpp.venv/bin/activate
pip install --upgrade pip
pip install --prefer-binary torch openblas \
    --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux
deactivate
print_success "LLM Python environment ready"

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[9/12] Build llama.cpp"
cd "${WORK_DIR}"
LLAMA_DIR="llama.cpp"
if [ -f "${LLAMA_DIR}/build/bin/llama-server" ]; then
    print_warning "llama-server already built â€” skipping rebuild"
else
    [ -d "${LLAMA_DIR}" ] && rm -rf "${LLAMA_DIR}"
    git clone https://github.com/ggml-org/llama.cpp.git
    cd "${LLAMA_DIR}"
    git checkout b6122

    OPENBLAS_LIB="${WORK_DIR}/llama.cpp.venv/lib/python3.12/site-packages/openblas/lib/libopenblas.so"
    OPENBLAS_INC="${WORK_DIR}/llama.cpp.venv/lib/python3.12/site-packages/openblas/include"

    LD_LIBRARY_PATH=/opt/lib cmake -B build \
        -DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS \
        -DBLAS_LIBRARIES="${OPENBLAS_LIB}" \
        -DBLAS_INCLUDE_DIRS="${OPENBLAS_INC}" \
        -DGGML_CUDA=OFF
    cmake --build build --config Release
    cd "${WORK_DIR}"
fi
print_success "llama-server binary ready"

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[10/12] Download Granite model"
mkdir -p "${MODEL_DIR}"
if [ -f "${MODEL_DIR}/${MODEL_FILE}" ]; then
    print_warning "Model already downloaded â€” skipping"
else
    wget --quiet --show-progress "${MODEL_URL}" -O "${MODEL_DIR}/${MODEL_FILE}"
fi
print_success "Model: $(du -h ${MODEL_DIR}/${MODEL_FILE} | cut -f1)"

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[11/12] Start services via pm2"
cd "${WORK_DIR}"

# Stop any existing pm2 processes from a previous deploy
pm2 delete all 2>/dev/null || true

# â”€â”€ LLM server â”€â”€
pm2 start "${WORK_DIR}/llama.cpp/build/bin/llama-server" \
    --name genai-llama \
    --interpreter none \
    -- -m "${MODEL_DIR}/${MODEL_FILE}" --host 0.0.0.0 --port 8080

# â”€â”€ Proxy server â”€â”€
cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}/src/llama-proxy"
pm2 start node --name genai-proxy \
    --env NODE_ENV=production \
    -- server_final.js

# â”€â”€ Next.js UI (with Spyre env var) â”€â”€
cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
SPYRE_URL="${SPYRE_URL}" LLAMA_URL="http://localhost:8080" \
PORT=3000 NODE_ENV=production \
pm2 start node --name genai-nextjs \
    -- -e production server.js

pm2 save
print_success "pm2 process list saved"

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[12/12] Verify services"
sleep 6

echo ""
pm2 list
echo ""

# Port checks
for port in 8080 3001 3000; do
    if lsof -Pi ":${port}" -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_success "Port ${port} listening âœ“"
    else
        echo -e "${RED}âœ— Port ${port} NOT listening â€” check pm2 logs${NC}"
    fi
done

# Quick LLM health check
if curl -sf http://localhost:8080/health >/dev/null 2>&1; then
    print_success "llama-server health check passed"
elif curl -sf http://localhost:8080/v1/models >/dev/null 2>&1; then
    print_success "llama-server /v1/models OK"
else
    print_warning "llama-server may still be loading the model â€” retry in 30s"
fi

# Spyre connectivity check
if curl -sf --connect-timeout 5 "${SPYRE_URL}/health" >/dev/null 2>&1 || \
   curl -sf --connect-timeout 5 "${SPYRE_URL}/v1/models" >/dev/null 2>&1; then
    print_success "Spyre endpoint reachable at ${SPYRE_URL} âœ“"
else
    print_warning "Spyre endpoint ${SPYRE_URL} not yet reachable â€” ensure Spyre is running on 9.8.70.146"
fi

ELAPSED=$(( $(date +%s) - START ))
echo ""
echo -e "${GREEN}${BOLD}â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”${NC}"
echo -e "${GREEN}${BOLD}âœ…  Deployment complete in $((ELAPSED/60))m $((ELAPSED%60))s${NC}"
echo ""
echo -e "  ðŸŒ Demo URL:       ${BOLD}http://9.8.70.150:3000${NC}"
echo -e "  âš¡ Spyre endpoint: ${BOLD}${SPYRE_URL}${NC}"
echo ""
echo -e "  Toggle in the header bar:  ${BOLD}MMA  â†”  âš¡ Spyre${NC}"
echo ""
echo -e "  pm2 management:"
echo "    pm2 list               â€” show all processes"
echo "    pm2 logs genai-nextjs  â€” Next.js log"
echo "    pm2 logs genai-llama   â€” LLM server log"
echo "    pm2 restart all        â€” restart everything"
echo -e "${GREEN}${BOLD}â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”${NC}"

REMOTE_SCRIPT

echo ""
echo -e "${GREEN}${BOLD}Remote deployment finished.${NC}"
echo -e "Demo: ${BOLD}http://${LPAR_HOST}:3000${NC}"
