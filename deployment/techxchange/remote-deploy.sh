#!/bin/bash
# remote-deploy.sh — TechXChange Lab 1127 deployment script
#
# Runs directly ON the LPAR (mma-bench / 9.8.70.150) as root.
# Can be piped in via SSH from a laptop:
#
#   ssh root@9.8.70.150 'bash -s' < deployment/techxchange/remote-deploy.sh
#
# Or run locally if already on the server:
#
#   bash /data/Carbon-GenAI-Demos/deployment/techxchange/remote-deploy.sh
#
# Environment variables (all optional — defaults shown):
#   BRANCH    feature/lab1127-techxchange
#   REPO_URL  https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos
#   SPYRE_URL http://9.8.70.146:8001

set -euo pipefail

BRANCH="${BRANCH:-feature/lab1127-techxchange}"
REPO_URL="${REPO_URL:-https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos}"
SPYRE_URL="${SPYRE_URL:-http://9.8.70.146:8001}"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
step() { echo -e "\n${BOLD}${CYAN}>>> $*${NC}"; }
ok()   { echo -e "${GREEN}OK${NC} $*"; }
warn() { echo -e "${YELLOW}WARN${NC} $*"; }
fail() { echo -e "${RED}FAIL${NC} $*"; exit 1; }

START=$(date +%s)
REPO_DIR="Carbon-GenAI-Demos"
APP_DIR="carbon-ui"
MODEL_FILE="granite-4.0-micro-Q4_K_M.gguf"
MODEL_URL="https://huggingface.co/ibm-granite/granite-4.0-micro-GGUF/resolve/main/granite-4.0-micro-Q4_K_M.gguf"

# ── [0] Pick working directory ─────────────────────────────────────────────
step "[0/11] Select working directory"

pick_workdir() {
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
[ -z "$WORK_DIR" ] && fail "No mount point with >=20GB free. Run: df -h"

ok "Working directory: $WORK_DIR"
MODEL_DIR="${WORK_DIR}/models"
LOG_FILE="${HOME}/deployment/techxchange-deploy-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "${HOME}/deployment" "$MODEL_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1
echo "Log: $LOG_FILE | Branch: $BRANCH | Spyre: $SPYRE_URL"

# Export so ecosystem.config.js picks them up via process.env
export WORK_DIR REPO_DIR SPYRE_URL

# ── [1] Pre-flight ─────────────────────────────────────────────────────────
step "[1/11] Pre-flight checks"
[ -f /etc/redhat-release ] || fail "Requires RHEL/AlmaLinux"
ok "OS: $(cat /etc/redhat-release)"
ok "Arch: $(uname -m)"
FREE=$(df -BG "$WORK_DIR" | awk 'NR==2{print $4}' | sed 's/G//')
ok "Free space in $WORK_DIR: ${FREE}GB"

# ── [2] System packages ────────────────────────────────────────────────────
step "[2/11] Install required packages"
DNF_OPTS="--disablerepo=IBM_Power_Tools --disablerepo=Advance_Toolchain"

dnf install -y $DNF_OPTS \
    git gcc gcc-c++ make cmake automake ninja-build \
    gfortran curl-devel wget lsof \
    || warn "Some packages skipped (non-fatal)"

command -v python3.12 >/dev/null 2>&1 \
    || dnf install -y $DNF_OPTS python3.12 python3.12-pip python3.12-devel \
    || warn "python3.12 not available — llama.cpp will build without OpenBLAS"

dnf install -y $DNF_OPTS llvm-toolset 2>/dev/null \
    || warn "llvm-toolset not found — cmake will use gcc"

# ── Node.js ────────────────────────────────────────────────────────────────
# @carbon/themes requires Node >=22. Check what's installed first — on
# mma-bench Node 22 is already at /usr/local/node/bin so we just need
# to ensure it's in PATH. Only install via dnf/nvm if genuinely missing.
NODE_BIN=""
for candidate in /usr/local/node/bin/node /usr/bin/node; do
    if [ -x "$candidate" ]; then
        NODE_VER=$("$candidate" --version | sed 's/v//' | cut -d. -f1)
        if [ "${NODE_VER}" -ge 22 ] 2>/dev/null; then
            NODE_BIN="$candidate"
            # Add the parent dir to PATH for this session
            export PATH="$(dirname $NODE_BIN):$PATH"
            break
        fi
    fi
done

if [ -z "$NODE_BIN" ]; then
    warn "Node >=22 not found at standard paths — trying dnf nodejs:22"
    dnf module reset  -y nodejs $DNF_OPTS 2>/dev/null || true
    if dnf module enable -y nodejs:22 $DNF_OPTS 2>/dev/null; then
        dnf install -y $DNF_OPTS nodejs npm
    else
        warn "nodejs:22 module not in AppStream — falling back to nvm"
        curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
        nvm install 22
        nvm use 22
        nvm alias default 22
    fi
fi

# Source nvm if it exists (covers nvm path on re-runs)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" || true

NODE_VER=$(node --version 2>/dev/null || echo "none")
ok "Node: $NODE_VER  ($(which node))"
[[ "$NODE_VER" == "none" ]] && fail "node not in PATH after install attempts"

# ── [3] Clone / update repo ────────────────────────────────────────────────
step "[3/11] Clone / update repo (branch: ${BRANCH})"
cd "$WORK_DIR"
if [ -d "${REPO_DIR}/.git" ]; then
    warn "Repo exists — pulling latest"
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

# ── [4] yarn + pm2 ────────────────────────────────────────────────────────
step "[4/11] Install yarn + pm2 globally"
npm install --global yarn pm2
ok "yarn $(yarn --version)  pm2 $(pm2 --version)"

# ── [5] Node.js dependencies ───────────────────────────────────────────────
step "[5/11] Node.js dependencies"
cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"

# Relax eslint so build succeeds on clean clone
printf '{"extends":"next/core-web-vitals","rules":{"react/no-unescaped-entities":"off"}}\n' > .eslintrc.json

# Install — use --ignore-engines in case yarn reports peer version mismatches
yarn --ignore-engines

# Ensure correct versions of Carbon packages and OpenAI SDK
yarn add --ignore-engines \
    @carbon/react@latest \
    sass@1.63.6 \
    @carbon/icons-react@latest \
    @carbon/pictograms-react@latest

npm install \
    openai@^4.104.0 \
    cors \
    express@^4.21.2 \
    http-proxy-middleware@^2.0.7

# Proxy server dependencies
if [ -d src/llama-proxy ]; then
    cd src/llama-proxy && npm install && cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"
fi
ok "Dependencies installed"

# ── [6] Build Next.js ──────────────────────────────────────────────────────
step "[6/11] Build Next.js application"
cd "${WORK_DIR}/${REPO_DIR}/${APP_DIR}"

# Use the local node_modules/.bin/next to avoid PATH issues with yarn build
# (some shells lose the npm global bin path mid-script)
if [ -x node_modules/.bin/next ]; then
    node_modules/.bin/next build
elif command -v yarn >/dev/null 2>&1; then
    yarn --ignore-engines build
else
    npx next build
fi
ok "Next.js build complete"

# ── [7] Python venv for llama.cpp OpenBLAS ────────────────────────────────
step "[7/11] Python / LLM venv"
cd "$WORK_DIR"
if command -v python3.12 >/dev/null 2>&1; then
    python3.12 -m venv llama.cpp.venv
    source llama.cpp.venv/bin/activate
    pip install --upgrade pip --quiet
    pip install --prefer-binary --quiet torch openblas \
        --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux
    deactivate
    ok "LLM Python venv ready"
else
    warn "python3.12 not found — building llama.cpp without OpenBLAS (slower)"
fi

# ── [8] Build llama.cpp ────────────────────────────────────────────────────
step "[8/11] Build llama.cpp"
cd "$WORK_DIR"
if [ -f "llama.cpp/build/bin/llama-server" ]; then
    warn "llama-server already built — skipping (~15 min saved)"
else
    [ -d llama.cpp ] && rm -rf llama.cpp
    git clone https://github.com/ggml-org/llama.cpp.git
    cd llama.cpp
    git checkout b6122
    OB_LIB="${WORK_DIR}/llama.cpp.venv/lib/python3.12/site-packages/openblas/lib/libopenblas.so"
    OB_INC="${WORK_DIR}/llama.cpp.venv/lib/python3.12/site-packages/openblas/include"
    if [ -f "$OB_LIB" ]; then
        LD_LIBRARY_PATH=/opt/lib cmake -B build \
            -DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS \
            -DBLAS_LIBRARIES="$OB_LIB" -DBLAS_INCLUDE_DIRS="$OB_INC" \
            -DGGML_CUDA=OFF
    else
        warn "OpenBLAS not found — building without BLAS"
        cmake -B build -DGGML_CUDA=OFF
    fi
    cmake --build build --config Release
    cd "$WORK_DIR"
fi
ok "llama-server ready at ${WORK_DIR}/llama.cpp/build/bin/llama-server"

# ── [9] Download Granite model ────────────────────────────────────────────
step "[9/11] Download Granite 4.0 Micro model (CPU path)"
if [ -f "${MODEL_DIR}/${MODEL_FILE}" ]; then
    warn "Model already present — skipping download"
else
    wget --quiet --show-progress "$MODEL_URL" -O "${MODEL_DIR}/${MODEL_FILE}"
fi
ok "Model: $(du -h ${MODEL_DIR}/${MODEL_FILE} | cut -f1)"

# ── [10] Start services via pm2 ecosystem ─────────────────────────────────
step "[10/11] Start services via pm2"
cd "$WORK_DIR"

# Re-source nvm in case PATH was reset
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" || true

# Stop any previous pm2 processes cleanly
pm2 delete all 2>/dev/null || true

# Start all three services from the ecosystem file.
# WORK_DIR, REPO_DIR and SPYRE_URL are already exported above so
# ecosystem.config.js will pick them up via process.env.
WORK_DIR="$WORK_DIR" REPO_DIR="$REPO_DIR" SPYRE_URL="$SPYRE_URL" \
pm2 start "${WORK_DIR}/${REPO_DIR}/deployment/ecosystem.config.js" \
    --only genai-llama,genai-proxy,genai-nextjs

pm2 save
ok "pm2 processes started and saved"

# ── [11] Verify ───────────────────────────────────────────────────────────
step "[11/11] Verify services"
sleep 8
pm2 list

echo ""
for port in 8080 3001 3000; do
    if lsof -Pi ":${port}" -sTCP:LISTEN -t >/dev/null 2>&1; then
        ok "Port ${port} listening"
    else
        echo -e "${RED}FAIL${NC}: Port ${port} not listening — check: pm2 logs"
    fi
done

echo ""
if curl -sf http://localhost:8080/health >/dev/null 2>&1 \
   || curl -sf http://localhost:8080/v1/models >/dev/null 2>&1; then
    ok "llama-server health check passed"
else
    warn "llama-server may still be loading the model — check: pm2 logs genai-llama"
fi

if curl -sf --connect-timeout 5 "${SPYRE_URL}/v1/models" >/dev/null 2>&1; then
    ok "Spyre reachable at ${SPYRE_URL} ✓"
else
    warn "Spyre not reachable at ${SPYRE_URL} — ensure ncat forwarder is running on 9.8.70.146"
fi

ELAPSED=$(( $(date +%s) - START ))
echo ""
echo "========================================================"
echo "  DONE in $(( ELAPSED/60 ))m $(( ELAPSED%60 ))s"
echo "  Demo:  http://9.8.70.150:3000"
echo "  Spyre: ${SPYRE_URL} (granite-4.1-8b-fp8)"
echo ""
echo "  Toggle in the header bar:  CPU  ↔  ⚡ Spyre"
echo ""
echo "  Useful pm2 commands:"
echo "    pm2 list                    — process status"
echo "    pm2 logs genai-nextjs       — Next.js log"
echo "    pm2 logs genai-llama        — LLM server log"
echo "    pm2 env <id>                — show env vars for a process"
echo "    pm2 restart all             — restart everything"
echo "    pm2 save                    — persist after reboot"
echo "========================================================"
