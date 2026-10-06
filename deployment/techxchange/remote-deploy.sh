#!/bin/bash
# remote-deploy.sh - runs ON the LPAR via:
#   Get-Content remote-deploy.sh -Raw | ssh root@9.8.70.150 'bash -s'
# Do not run this directly on Windows.

set -euo pipefail

BRANCH="${BRANCH:-feature/lab1127-techxchange}"
REPO_URL="${REPO_URL:-https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos}"
SPYRE_URL="${SPYRE_URL:-http://9.8.70.146:8080}"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
step()    { echo -e "\n${BOLD}${CYAN}>>> $*${NC}"; }
ok()      { echo -e "${GREEN}OK${NC} $*"; }
warn()    { echo -e "${YELLOW}WARN${NC} $*"; }

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

echo "Log: $LOG_FILE | Branch: $BRANCH | Spyre: $SPYRE_URL"

# [1] Pre-flight
step "[1/12] Pre-flight checks"
[ -f /etc/redhat-release ] || { echo "ERROR: requires RHEL/AlmaLinux"; exit 1; }
ok "OS: $(cat /etc/redhat-release)"
ok "Arch: $(uname -m)"
FREE=$(df -BG "$WORK_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "${FREE}" -lt 5 ]; then
    echo -e "${RED}ERROR: only ${FREE}GB free â€” need at least 5GB (model is 3.7GB)${NC}"
    echo "Free up space first: du -sh ~/* | sort -rh | head -20"
    exit 1
fi
[ "${FREE}" -lt 10 ] && warn "Low disk: ${FREE}GB â€” may be tight" || ok "Disk: ${FREE}GB free"

# [2] Skip full system update â€” install only what we need
step "[2/12] Install required packages (skipping full dnf update)"
# Disable repos that are known-unreachable on this LPAR to avoid failures
DNF_OPTS="--disablerepo=IBM_Power_Tools"

dnf install -y $DNF_OPTS \
    git gcc gcc-c++ make cmake automake ninja-build \
    gfortran curl-devel wget lsof \
    || warn "Some packages may have been skipped (non-fatal)"

# Python 3.12
if ! command -v python3.12 >/dev/null 2>&1; then
    dnf install -y $DNF_OPTS python3.12 python3.12-pip python3.12-devel \
        || warn "python3.12 not available â€” llama.cpp Python deps may fail"
fi

# llvm-toolset (for clang/LLVM, needed by llama.cpp cmake)
dnf install -y $DNF_OPTS llvm-toolset 2>/dev/null || warn "llvm-toolset not found â€” cmake will use gcc"

# Node.js
if command -v node >/dev/null 2>&1; then
    ok "Node already installed: $(node --version)"
else
    warn "Node.js not found â€” installing via dnf module"
    dnf module enable -y nodejs:20 $DNF_OPTS 2>/dev/null || true
    dnf install -y $DNF_OPTS nodejs
    ok "Node $(node --version)"
fi

# [3] Repo
step "[3/12] Clone / update repo (branch: ${BRANCH})"
cd "$WORK_DIR"
if [ -d "${REPO_DIR}/.git" ]; then
    warn "Repo exists -- pulling latest"
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
ok "Repo ready on $BRANCH"

# [4] yarn + pm2
step "[4/12] Install yarn + pm2"
npm install --global yarn pm2
ok "yarn $(yarn --version)  pm2 $(pm2 --version)"

# [5] Node deps
step "[5/12] Node.js dependencies"
cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
printf '{"extends":"next/core-web-vitals","rules":{"react/no-unescaped-entities":"off"}}\n' > .eslintrc.json
yarn
yarn add @carbon/react@latest sass@1.63.6 @carbon/icons-react@latest @carbon/pictograms-react@latest
npm install openai@^4.104.0 cors express@^4.21.2 http-proxy-middleware@^2.0.7
if [ -d src/llama-proxy ]; then
    cd src/llama-proxy && npm install && cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
fi
ok "Dependencies installed"

# [6] Build Next.js
step "[6/12] Build Next.js"
cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
yarn build
ok "Build complete"

# [7] Python venv for llama.cpp OpenBLAS
step "[7/12] Python / LLM venv"
cd "$WORK_DIR"
if command -v python3.12 >/dev/null 2>&1; then
    python3.12 -m venv llama.cpp.venv
    source llama.cpp.venv/bin/activate
    pip install --upgrade pip
    pip install --prefer-binary torch openblas \
        --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux
    deactivate
    ok "LLM Python venv ready"
else
    warn "python3.12 not found -- llama.cpp will build without OpenBLAS (slower)"
fi

# [8] Build llama.cpp
step "[8/12] Build llama.cpp"
cd "$WORK_DIR"
if [ -f "llama.cpp/build/bin/llama-server" ]; then
    warn "llama-server binary already exists -- skipping build (~15 min saved)"
else
    [ -d llama.cpp ] && rm -rf llama.cpp
    git clone https://github.com/ggml-org/llama.cpp.git
    cd llama.cpp
    git checkout b6122
    if [ -f "${WORK_DIR}/llama.cpp.venv/lib/python3.12/site-packages/openblas/lib/libopenblas.so" ]; then
        OB_LIB="${WORK_DIR}/llama.cpp.venv/lib/python3.12/site-packages/openblas/lib/libopenblas.so"
        OB_INC="${WORK_DIR}/llama.cpp.venv/lib/python3.12/site-packages/openblas/include"
        LD_LIBRARY_PATH=/opt/lib cmake -B build \
            -DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS \
            -DBLAS_LIBRARIES="$OB_LIB" -DBLAS_INCLUDE_DIRS="$OB_INC" \
            -DGGML_CUDA=OFF
    else
        warn "OpenBLAS not found -- building llama.cpp without BLAS acceleration"
        cmake -B build -DGGML_CUDA=OFF
    fi
    cmake --build build --config Release
    cd "$WORK_DIR"
fi
ok "llama-server ready"

# [9] Download model
step "[9/12] Download Granite model"
mkdir -p "$MODEL_DIR"
if [ -f "${MODEL_DIR}/${MODEL_FILE}" ]; then
    warn "Model already present -- skipping download (~10-20 min saved)"
else
    wget --quiet --show-progress "$MODEL_URL" -O "${MODEL_DIR}/${MODEL_FILE}"
fi
ok "Model: $(du -h ${MODEL_DIR}/${MODEL_FILE} | cut -f1)"

# [10] pm2 services
step "[10/12] Start services via pm2"
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
ok "pm2 process list saved"

# [11] Verify
step "[11/12] Verify"
sleep 8
pm2 list
for port in 8080 3001 3000; do
    lsof -Pi ":${port}" -sTCP:LISTEN -t >/dev/null 2>&1 \
        && ok "Port ${port} listening" \
        || echo -e "${RED}FAIL Port ${port} not listening -- check: pm2 logs${NC}"
done

if curl -sf http://localhost:8080/health >/dev/null 2>&1 \
   || curl -sf http://localhost:8080/v1/models >/dev/null 2>&1; then
    ok "llama-server health check passed"
else
    warn "llama-server may still be loading the model -- retry: curl http://localhost:8080/health"
fi

if curl -sf --connect-timeout 5 "${SPYRE_URL}/health" >/dev/null 2>&1 \
   || curl -sf --connect-timeout 5 "${SPYRE_URL}/v1/models" >/dev/null 2>&1; then
    ok "Spyre reachable at ${SPYRE_URL}"
else
    warn "Spyre not reachable yet -- ensure llama-server is running on 9.8.70.146"
fi

ELAPSED=$(( $(date +%s) - START ))
echo ""
echo "========================================================"
echo "  DONE in $(( ELAPSED/60 ))m $(( ELAPSED%60 ))s"
echo ""
echo "  Demo:  http://9.8.70.150:3000"
echo "  Spyre: ${SPYRE_URL}"
echo "  Toggle MMA <-> Spyre in the header bar"
echo "========================================================"
