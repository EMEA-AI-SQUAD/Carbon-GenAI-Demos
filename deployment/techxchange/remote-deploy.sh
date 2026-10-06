#!/bin/bash
# remote-deploy.sh â€” runs ON the LPAR via: ssh root@9.8.70.150 'bash -s' < remote-deploy.sh
# Do not run this directly on Windows.

set -euo pipefail

BRANCH="${BRANCH:-feature/lab1127-techxchange}"
REPO_URL="${REPO_URL:-https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos}"
SPYRE_URL="${SPYRE_URL:-http://9.8.70.146:8080}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
print_step()    { echo -e "\n${BOLD}${CYAN}â–¶ $*${NC}"; }
print_success() { echo -e "${GREEN}âœ“${NC} $*"; }
print_warning() { echo -e "${YELLOW}âš ${NC} $*"; }

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

echo "Log: $LOG_FILE  |  Branch: $BRANCH  |  Spyre: $SPYRE_URL"

# â”€â”€ [1] Pre-flight â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[1/12] Pre-flight checks"
[ -f /etc/redhat-release ] || { echo "ERROR: requires RHEL"; exit 1; }
print_success "OS: $(cat /etc/redhat-release)"
print_success "Arch: $(uname -m)"
FREE=$(df -BG "$WORK_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
[ "${FREE}" -lt 10 ] && print_warning "Low disk: ${FREE}GB" || print_success "Disk: ${FREE}GB free"

# â”€â”€ [2] System update â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[2/12] System update"
dnf -y update

# â”€â”€ [3] Dependencies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[3/12] Install dependencies"
dnf install -y python3.12 python3.12-pip python3.12-devel git gcc gcc-c++ make \
    cmake automake llvm-toolset ninja-build gfortran curl-devel wget lsof
RHEL_MAJOR=$(rpm -q --qf '%{VERSION}' redhat-release 2>/dev/null | cut -d. -f1)
if [ "${RHEL_MAJOR}" -ge 10 ] 2>/dev/null; then
    dnf install -y nodejs
else
    dnf module enable -y nodejs:20 && dnf install -y nodejs
fi
print_success "Node $(node --version)"

# â”€â”€ [4] Repo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[4/12] Clone / update repo (branch: ${BRANCH})"
cd "$WORK_DIR"
if [ -d "${REPO_DIR}/.git" ]; then
    print_warning "Repo exists â€” pulling latest"
    cd "$REPO_DIR"
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
    cd "$WORK_DIR"
else
    [ -d "$REPO_DIR" ] && rm -rf "$REPO_DIR"
    git clone --branch "$BRANCH" "$REPO_URL"
fi
chmod +x "${REPO_DIR}/deployment/"*.sh 2>/dev/null || true
print_success "Repo ready on $BRANCH"

# â”€â”€ [5] yarn + pm2 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[5/12] Install yarn + pm2"
npm install --global yarn pm2
print_success "yarn $(yarn --version)  pm2 $(pm2 --version)"

# â”€â”€ [6] Node deps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[6/12] Node.js dependencies"
cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
printf '{"extends":"next/core-web-vitals","rules":{"react/no-unescaped-entities":"off"}}\n' > .eslintrc.json
yarn
yarn add @carbon/react@latest sass@1.63.6 @carbon/icons-react@latest @carbon/pictograms-react@latest
npm install openai@^4.104.0 cors express@^4.21.2 http-proxy-middleware@^2.0.7
if [ -d src/llama-proxy ]; then
    cd src/llama-proxy && npm install && cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
fi
print_success "Dependencies installed"

# â”€â”€ [7] Build â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[7/12] Build Next.js"
cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
yarn build
print_success "Build complete"

# â”€â”€ [8] Python venv â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[8/12] Python / LLM venv"
cd "$WORK_DIR"
python3.12 -m venv llama.cpp.venv
source llama.cpp.venv/bin/activate
pip install --upgrade pip
pip install --prefer-binary torch openblas \
    --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux
deactivate
print_success "LLM Python venv ready"

# â”€â”€ [9] llama.cpp â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[9/12] Build llama.cpp"
cd "$WORK_DIR"
if [ -f "llama.cpp/build/bin/llama-server" ]; then
    print_warning "llama-server binary exists â€” skipping build (~15 min saved)"
else
    [ -d llama.cpp ] && rm -rf llama.cpp
    git clone https://github.com/ggml-org/llama.cpp.git
    cd llama.cpp
    git checkout b6122
    OB_LIB="${WORK_DIR}/llama.cpp.venv/lib/python3.12/site-packages/openblas/lib/libopenblas.so"
    OB_INC="${WORK_DIR}/llama.cpp.venv/lib/python3.12/site-packages/openblas/include"
    LD_LIBRARY_PATH=/opt/lib cmake -B build \
        -DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS \
        -DBLAS_LIBRARIES="$OB_LIB" -DBLAS_INCLUDE_DIRS="$OB_INC" \
        -DGGML_CUDA=OFF
    cmake --build build --config Release
    cd "$WORK_DIR"
fi
print_success "llama-server ready"

# â”€â”€ [10] Model â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[10/12] Download model"
mkdir -p "$MODEL_DIR"
if [ -f "${MODEL_DIR}/${MODEL_FILE}" ]; then
    print_warning "Model already present â€” skipping download (~10-20 min saved)"
else
    wget --quiet --show-progress "$MODEL_URL" -O "${MODEL_DIR}/${MODEL_FILE}"
fi
print_success "Model: $(du -h ${MODEL_DIR}/${MODEL_FILE} | cut -f1)"

# â”€â”€ [11] pm2 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[11/12] Start services via pm2"
cd "$WORK_DIR"
pm2 delete all 2>/dev/null || true

pm2 start "${WORK_DIR}/llama.cpp/build/bin/llama-server" \
    --name genai-llama --interpreter none \
    -- -m "${MODEL_DIR}/${MODEL_FILE}" --host 0.0.0.0 --port 8080

cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}/src/llama-proxy"
PORT=3001 LLAMA_URL="http://localhost:8080" PASSPORTEYE_URL="http://localhost:5000" \
NODE_ENV=production pm2 start node --name genai-proxy -- server_final.js

cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
PORT=3000 NODE_ENV=production \
LLAMA_URL="http://localhost:8080" SPYRE_URL="$SPYRE_URL" \
pm2 start node --name genai-nextjs -- server.js

pm2 save
print_success "pm2 process list saved"

# â”€â”€ [12] Verify â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print_step "[12/12] Verify"
sleep 8
pm2 list
for port in 8080 3001 3000; do
    lsof -Pi ":${port}" -sTCP:LISTEN -t >/dev/null 2>&1 \
        && print_success "Port ${port} listening âœ“" \
        || echo -e "${RED}âœ— Port ${port} not listening â€” check: pm2 logs${NC}"
done
if curl -sf http://localhost:8080/health >/dev/null 2>&1 \
   || curl -sf http://localhost:8080/v1/models >/dev/null 2>&1; then
    print_success "llama-server health OK"
else
    print_warning "llama-server still loading model â€” retry: curl http://localhost:8080/health"
fi
if curl -sf --connect-timeout 5 "${SPYRE_URL}/health" >/dev/null 2>&1 \
   || curl -sf --connect-timeout 5 "${SPYRE_URL}/v1/models" >/dev/null 2>&1; then
    print_success "Spyre reachable at ${SPYRE_URL} âœ“"
else
    print_warning "Spyre not reachable yet â€” ensure llama-server is running on 9.8.70.146"
fi

ELAPSED=$(( $(date +%s) - START ))
echo ""
echo -e "${GREEN}${BOLD}â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”${NC}"
echo -e "${GREEN}${BOLD}âœ…  Done in $(( ELAPSED/60 ))m $(( ELAPSED%60 ))s${NC}"
echo ""
echo "  ðŸŒ Demo:  http://9.8.70.150:3000"
echo "  âš¡ Spyre: ${SPYRE_URL}"
echo "  Toggle MMA â†” âš¡ Spyre in the header bar"
echo -e "${GREEN}${BOLD}â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”${NC}"
