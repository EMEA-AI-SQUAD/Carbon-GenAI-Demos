#!/bin/bash
# remote-deploy.sh - runs ON the LPAR via:
#   Get-Content remote-deploy.sh -Raw | ssh root@9.8.70.150 'bash -s'

set -euo pipefail

BRANCH="${BRANCH:-feature/lab1127-techxchange}"
REPO_URL="${REPO_URL:-https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos}"
SPYRE_URL="${SPYRE_URL:-http://9.8.70.146:8080}"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
step() { echo -e "\n${BOLD}${CYAN}>>> $*${NC}"; }
ok()   { echo -e "${GREEN}OK${NC} $*"; }
warn() { echo -e "${YELLOW}WARN${NC} $*"; }

START=$(date +%s)
REPO_DIR="Carbon-GenAI-Demos"
APP_DIR="carbon-ui"
MODEL_FILE="granite-4.0-micro-Q4_K_M.gguf"
MODEL_URL="https://huggingface.co/ibm-granite/granite-4.0-micro-GGUF/resolve/main/granite-4.0-micro-Q4_K_M.gguf"

# [0] Pick a working directory with enough space
step "[0/12] Select working directory"

pick_workdir() {
    # Returns the first mount point that has >= 20 GB free
    for candidate in /data /opt /var /tmp "$HOME"; do
        if [ -d "$candidate" ]; then
            FREE_GB=$(df -BG "$candidate" | awk 'NR==2{print $4}' | sed 's/G//')
            echo "  $candidate : ${FREE_GB}GB free" >&2
            if [ "${FREE_GB}" -ge 20 ]; then
                echo "$candidate"
                return
            fi
        fi
    done
    echo ""
}

echo "Scanning mount points for free space:"
WORK_DIR=$(pick_workdir)

if [ -z "$WORK_DIR" ]; then
    echo "ERROR: no mount point with >=20GB free found."
    echo "Current disk usage:"
    df -h
    exit 1
fi

ok "Using working directory: $WORK_DIR"
MODEL_DIR="${WORK_DIR}/models"
LOG_FILE="${HOME}/deployment/techxchange-deploy-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "${HOME}/deployment" "$MODEL_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1
echo "Log: $LOG_FILE | WORK_DIR: $WORK_DIR | Branch: $BRANCH | Spyre: $SPYRE_URL"

# [1] Pre-flight
step "[1/12] Pre-flight checks"
[ -f /etc/redhat-release ] || { echo "ERROR: requires RHEL/AlmaLinux"; exit 1; }
ok "OS: $(cat /etc/redhat-release)"
ok "Arch: $(uname -m)"
FREE=$(df -BG "$WORK_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
ok "Free space in $WORK_DIR: ${FREE}GB"

# [2] Install packages -- disable unreachable IBM repos
step "[2/12] Install required packages"
DNF_OPTS="--disablerepo=IBM_Power_Tools --disablerepo=Advance_Toolchain"

dnf install -y $DNF_OPTS \
    git gcc gcc-c++ make cmake automake ninja-build \
    gfortran curl-devel wget lsof \
    || warn "Some packages skipped (non-fatal)"

if ! command -v python3.12 >/dev/null 2>&1; then
    dnf install -y $DNF_OPTS python3.12 python3.12-pip python3.12-devel \
        || warn "python3.12 not available"
fi

dnf install -y $DNF_OPTS llvm-toolset 2>/dev/null \
    || warn "llvm-toolset not found -- cmake will use gcc"

# Node.js -- @carbon/themes requires Node >=22
NODE_MAJOR=0
if command -v node >/dev/null 2>&1; then
    NODE_MAJOR=$(node --version | sed 's/v//' | cut -d. -f1)
fi
if [ "${NODE_MAJOR}" -ge 22 ] 2>/dev/null; then
    ok "Node sufficient: $(node --version)"
else
    warn "Node v${NODE_MAJOR} -- need >=22; upgrading"
    dnf module reset  -y nodejs $DNF_OPTS 2>/dev/null || true
    if dnf module enable -y nodejs:22 $DNF_OPTS 2>/dev/null; then
        dnf install -y $DNF_OPTS nodejs npm
    else
        warn "nodejs:22 module not in AppStream -- trying nvm"
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
        nvm install 22
        nvm use 22
        nvm alias default 22
    fi
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
ok "Repo ready at ${WORK_DIR}/${REPO_DIR} on $BRANCH"

# [4] yarn + pm2
step "[4/12] Install yarn + pm2"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" || true
npm install --global yarn pm2
ok "yarn $(yarn --version)  pm2 $(pm2 --version)"

# [5] Node deps
step "[5/12] Node.js dependencies"
cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
printf '{"extends":"next/core-web-vitals","rules":{"react/no-unescaped-entities":"off"}}\n' > .eslintrc.json
yarn --ignore-engines
yarn add --ignore-engines \
    @carbon/react@latest sass@1.63.6 @carbon/icons-react@latest @carbon/pictograms-react@latest
npm install openai@^4.104.0 cors express@^4.21.2 http-proxy-middleware@^2.0.7
if [ -d src/llama-proxy ]; then
    cd src/llama-proxy && npm install && cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
fi
ok "Dependencies installed"

# [6] Build Next.js
step "[6/12] Build Next.js"
cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
yarn --ignore-engines build
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
    warn "python3.12 not found -- building llama.cpp without OpenBLAS"
fi

# [8] Build llama.cpp
step "[8/12] Build llama.cpp"
cd "$WORK_DIR"
if [ -f "llama.cpp/build/bin/llama-server" ]; then
    warn "llama-server binary exists -- skipping build (~15 min saved)"
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
        warn "OpenBLAS not found -- building without BLAS"
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
    warn "Model already present -- skipping download"
else
    wget --quiet --show-progress "$MODEL_URL" -O "${MODEL_DIR}/${MODEL_FILE}"
fi
ok "Model: $(du -h ${MODEL_DIR}/${MODEL_FILE} | cut -f1)"

# [10] Start services via pm2
step "[10/12] Start services via pm2"
cd "$WORK_DIR"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" || true
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
        || echo "FAIL: Port ${port} not listening -- check: pm2 logs"
done

if curl -sf http://localhost:8080/health >/dev/null 2>&1 \
   || curl -sf http://localhost:8080/v1/models >/dev/null 2>&1; then
    ok "llama-server health check passed"
else
    warn "llama-server may still be loading -- retry: curl http://localhost:8080/health"
fi

if curl -sf --connect-timeout 5 "${SPYRE_URL}/health" >/dev/null 2>&1 \
   || curl -sf --connect-timeout 5 "${SPYRE_URL}/v1/models" >/dev/null 2>&1; then
    ok "Spyre reachable at ${SPYRE_URL}"
else
    warn "Spyre not reachable -- ensure llama-server is running on 9.8.70.146"
fi

ELAPSED=$(( $(date +%s) - START ))
echo ""
echo "========================================================"
echo "  DONE in $(( ELAPSED/60 ))m $(( ELAPSED%60 ))s"
echo "  WORK_DIR: $WORK_DIR"
echo "  Demo:  http://9.8.70.150:3000"
echo "  Spyre: ${SPYRE_URL}"
echo "  Toggle MMA <-> Spyre in the header bar"
echo "========================================================"