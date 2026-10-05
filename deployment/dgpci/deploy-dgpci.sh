#!/bin/bash
# =============================================================================
# deploy-dgpci.sh — Bootstrap DGPCI Demo on a fresh RHEL IBM Power LPAR
# =============================================================================
# Run this ONCE after cloning the repo.
# Clones two additional repos:
#   - IBM/project-ai-services  (extract + translate service source)
#   - DSpurway/IBM-Power-RAG-Demos  (our rag-backend — proven on Power)
# Builds all images and starts the full stack.
#
# Usage (on the RHEL LPAR):
#   git clone https://github.com/DSpurway/Carbon-GenAI-Demos.git
#   cd Carbon-GenAI-Demos/deployment/dgpci
#   cp env.example .env          # edit passwords / model name if needed
#   chmod +x deploy-dgpci.sh manage-dgpci.sh init-schema.sh ingest-regulations.sh
#   ./deploy-dgpci.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_DIR="${HOME}/dgpci-deploy-logs"
LOG_FILE="${LOG_DIR}/deploy-$(date +%Y%m%d-%H%M%S).log"
START_TIME=$(date +%s)
TOTAL_STEPS=10
CURRENT_STEP=0

AI_SERVICES_REPO="https://github.com/IBM/project-ai-services.git"
AI_SERVICES_DIR="${HOME}/project-ai-services"

RAG_DEMOS_REPO="https://github.com/DSpurway/IBM-Power-RAG-Demos.git"
RAG_DEMOS_DIR="${HOME}/IBM-Power-RAG-Demos"

mkdir -p "${LOG_DIR}"

log()  { echo "[$(date '+%H:%M:%S')] $*" >> "${LOG_FILE}"; }
step() { CURRENT_STEP=$((CURRENT_STEP+1))
         echo -e "\n${BOLD}${CYAN}[${CURRENT_STEP}/${TOTAL_STEPS}]${NC} $*"
         log "STEP [${CURRENT_STEP}/${TOTAL_STEPS}] $*"; }
ok()   { echo -e "  ${GREEN}✓${NC} $*"; log "OK   $*"; }
warn() { echo -e "  ${YELLOW}⚠${NC}  $*"; log "WARN $*"; }
err()  { echo -e "  ${RED}✗${NC}  $*"; log "ERR  $*"; }
info() { echo -e "  ${BLUE}ℹ${NC}  $*"; log "INFO $*"; }

elapsed() {
    local s=$(( $(date +%s) - START_TIME ))
    printf "%dm %ds" $((s/60)) $((s%60))
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}${CYAN}  DGPCI Romania Demo — IBM Power Podman Deployment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Log: ${LOG_FILE}"
echo ""

# ── Pre-flight ────────────────────────────────────────────────────────────
step "Pre-flight checks"

if [[ "$(uname -m)" != "ppc64le" ]]; then
    warn "Architecture is $(uname -m) — expected ppc64le."
fi

if [[ ! -f "${SCRIPT_DIR}/.env" ]]; then
    warn ".env not found — copying env.example"
    cp "${SCRIPT_DIR}/env.example" "${SCRIPT_DIR}/.env"
fi

FREE_GB=$(df -BG "${HOME}" | awk 'NR==2 {gsub("G",""); print $4}')
if [[ "${FREE_GB}" -lt 30 ]]; then
    warn "Only ${FREE_GB}GB free. Stack needs ~30 GB (Ollama model + images)."
else
    ok "Disk: ${FREE_GB}GB available"
fi
ok "Pre-flight complete"

export PATH="${HOME}/.local/bin:${PATH}"

# ── Install Podman ────────────────────────────────────────────────────────
step "Installing Podman and podman-compose"

if command -v podman &>/dev/null; then
    ok "Podman: $(podman --version)"
else
    sudo dnf install -y podman >> "${LOG_FILE}" 2>&1
    ok "Podman installed"
fi

if command -v podman-compose &>/dev/null; then
    ok "podman-compose: $(podman-compose --version)"
else
    if ! sudo dnf install -y podman-compose >> "${LOG_FILE}" 2>&1; then
        pip3 install --user podman-compose >> "${LOG_FILE}" 2>&1
    fi
    ok "podman-compose installed"
fi

# ── Kernel tuning (OpenSearch) ────────────────────────────────────────────
step "Kernel tuning for OpenSearch"

loginctl enable-linger "$(whoami)" >> "${LOG_FILE}" 2>&1 || true

if ! grep -q "vm.max_map_count" /etc/sysctl.conf 2>/dev/null; then
    echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf >> "${LOG_FILE}"
fi
sudo sysctl -w vm.max_map_count=262144 >> "${LOG_FILE}" 2>&1 || warn "Could not set max_map_count"
ok "Kernel tuning done"

# ── Clone IBM AI Services source ──────────────────────────────────────────
step "Cloning IBM project-ai-services (extract + translate source)"

if [[ -d "${AI_SERVICES_DIR}" ]]; then
    info "Already cloned at ${AI_SERVICES_DIR} — pulling latest"
    git -C "${AI_SERVICES_DIR}" pull --ff-only >> "${LOG_FILE}" 2>&1 || warn "git pull failed (offline?)"
else
    info "Cloning ${AI_SERVICES_REPO}…"
    git clone --depth=1 "${AI_SERVICES_REPO}" "${AI_SERVICES_DIR}" >> "${LOG_FILE}" 2>&1
fi
ok "IBM AI Services source ready at ${AI_SERVICES_DIR}"

# ── Clone RAG-with-Notebook (our rag-backend) ────────────────────────────
step "Cloning IBM-Power-RAG-Demos (rag-backend source)"

if [[ -d "${RAG_DEMOS_DIR}" ]]; then
    info "Already cloned at ${RAG_DEMOS_DIR} — pulling latest"
    git -C "${RAG_DEMOS_DIR}" pull --ff-only >> "${LOG_FILE}" 2>&1 || warn "git pull failed (offline?)"
else
    info "Cloning ${RAG_DEMOS_REPO}…"
    git clone --depth=1 "${RAG_DEMOS_REPO}" "${RAG_DEMOS_DIR}" >> "${LOG_FILE}" 2>&1
fi
ok "IBM-Power-RAG-Demos source ready at ${RAG_DEMOS_DIR}"

# Stage the rag-backend into our build context
RAG_CTX="${SCRIPT_DIR}/services/rag-backend"
rm -rf "${RAG_CTX}"
cp -r "${RAG_DEMOS_DIR}/Part3-RAG-Sales-Manual/rag-backend" "${RAG_CTX}"
ok "rag-backend source staged at ${RAG_CTX}"

# ── Stage AI Services source into build contexts ─────────────────────────
step "Staging extract + translate source into Containerfile build contexts"

EXTRACT_CTX="${SCRIPT_DIR}/services/extract-service"
TRANSLATE_CTX="${SCRIPT_DIR}/services/translate-service"
AI_SVC="${AI_SERVICES_DIR}/services"

# Extract service — copy source + common
rm -rf "${EXTRACT_CTX}/extract" "${EXTRACT_CTX}/common"
cp -r "${AI_SVC}/extract" "${EXTRACT_CTX}/extract"
cp -r "${AI_SVC}/common"  "${EXTRACT_CTX}/common"
ok "Extract service source staged"

# Translate service — copy source + common
rm -rf "${TRANSLATE_CTX}/translate" "${TRANSLATE_CTX}/common"
cp -r "${AI_SVC}/translate" "${TRANSLATE_CTX}/translate"
cp -r "${AI_SVC}/common"    "${TRANSLATE_CTX}/common"

# Patch SUPPORTED_LANGUAGES default in settings.py to include chinese,romanian
# (the env var override handles this at runtime, but this makes the default visible)
info "Patching translate/settings.py language allowlist…"
TRANSLATE_SETTINGS="${TRANSLATE_CTX}/translate/settings.py"
if [[ -f "${TRANSLATE_SETTINGS}" ]]; then
    sed -i 's/default="english,german"/default="english,german,chinese,romanian"/' \
        "${TRANSLATE_SETTINGS}" >> "${LOG_FILE}" 2>&1
    ok "Language allowlist patched"
else
    warn "translate/settings.py not found — skipping patch (env var will handle it)"
fi

# Patch common/lang_utils.py to avoid hard import of spacy
for ctx in "${EXTRACT_CTX}" "${TRANSLATE_CTX}"; do
    LANG_UTILS="${ctx}/common/lang_utils.py"
    if [[ -f "${LANG_UTILS}" ]]; then
        sed -i 's/^import spacy/# import spacy/' "${LANG_UTILS}" 2>/dev/null || true
        sed -i 's/^from spacy.language import/# from spacy.language import/' "${LANG_UTILS}" 2>/dev/null || true
    fi
done

# Patch extract/utils/schema.py _tokenize to fall back gracefully on Ollama
# Patch extract/utils/schema.py _tokenize to fall back gracefully on Ollama
EXTRACT_SCHEMA_UTIL="${EXTRACT_CTX}/extract/utils/schema.py"
if [[ -f "${EXTRACT_SCHEMA_UTIL}" ]]; then
    sed -i 's/from common.llm_utils import tokenize_with_llm/return max(1, len(text) \/\/ 4) # /' "${EXTRACT_SCHEMA_UTIL}" 2>/dev/null || true
fi
if [[ -f "${EXTRACT_SCHEMA_UTIL}" ]]; then
    sed -i 's/from common.llm_utils import tokenize_with_llm/return max(1, len(text) \/\/ 4) # /' "${EXTRACT_SCHEMA_UTIL}" 2>/dev/null || true
fi
for ctx in "${EXTRACT_CTX}" "${TRANSLATE_CTX}"; do
    LANG_UTILS="${ctx}/common/lang_utils.py"
    if [[ -f "${LANG_UTILS}" ]]; then
        sed -i 's/^import spacy/# import spacy/' "${LANG_UTILS}" 2>/dev/null || true
        sed -i 's/^from spacy.language import/# from spacy.language import/' "${LANG_UTILS}" 2>/dev/null || true
    fi
done

# Patch translate/app.py lingua language detector setup to include Chinese + Romanian
TRANSLATE_APP="${TRANSLATE_CTX}/translate/app.py"
if [[ -f "${TRANSLATE_APP}" ]]; then
    info "Patching translate/app.py lingua detector languages…"
    sed -i 's/\[Language.ENGLISH, Language.GERMAN, Language.ITALIAN, Language.FRENCH\]/[Language.ENGLISH, Language.GERMAN, Language.ITALIAN, Language.FRENCH, Language.CHINESE, Language.ROMANIAN]/' \
        "${TRANSLATE_APP}" >> "${LOG_FILE}" 2>&1 || warn "Lingua patch skipped (pattern not found)"
fi
ok "Translate service source staged"

# ── Build extract service image ───────────────────────────────────────────
step "Building extract-service image"
info "Building (this takes 5–10 min on first run)…"
podman build \
    --tag localhost/dgpci-extract:latest \
    "${EXTRACT_CTX}" \
    2>&1 | tee -a "${LOG_FILE}"
ok "dgpci-extract image built"

# ── Build translate service image ─────────────────────────────────────────
step "Building translate-service image"
info "Building (5–10 min on first run)…"
podman build \
    --tag localhost/dgpci-translate:latest \
    "${TRANSLATE_CTX}" \
    2>&1 | tee -a "${LOG_FILE}"
ok "dgpci-translate image built"

# ── Build RAG backend image ───────────────────────────────────────────────
# Uses the rag-backend staged from RAG-with-Notebook (our proven Flask backend)
step "Building rag-backend image (from IBM-Power-RAG-Demos)"
info "Building rag-backend (~5 min)…"
podman build \
    --tag localhost/dgpci-rag-backend:latest \
    "${RAG_CTX}" \
    2>&1 | tee -a "${LOG_FILE}"
ok "rag-backend image built"

info "Building carbon-ui (Next.js build — ~4 min)…"
podman build \
    -f "${REPO_ROOT}/carbon-ui/Containerfile" \
    --tag localhost/dgpci-carbon-ui:latest \
    "${REPO_ROOT}/carbon-ui" \
    2>&1 | tee -a "${LOG_FILE}"
ok "carbon-ui image built"

# ── Start all services ────────────────────────────────────────────────────
step "Starting full stack"
cd "${SCRIPT_DIR}"
# No -d flag: foreground so a failed startup does not leave this session hung.
# podman-compose will stream logs here; Ctrl-C is safe.
podman-compose --env-file .env up 2>&1 | tee -a "${LOG_FILE}"

# Pull Granite model into Ollama (non-blocking — runs in background after stack starts)
OLLAMA_MODEL=$(grep -E '^OLLAMA_MODEL=' "${SCRIPT_DIR}/.env" | cut -d= -f2 | tr -d '"' || echo "granite4:latest")
info "Pulling LLM model '${OLLAMA_MODEL}' into Ollama (background, may take 10–20 min)…"
nohup bash -c "
    for i in \$(seq 1 30); do
        if curl -sf http://localhost:11434/api/version &>/dev/null; then
            podman exec ollama-service ollama pull '${OLLAMA_MODEL}'
            echo 'Model pull complete'
            break
        fi
        sleep 10
    done
" >> "${LOG_DIR}/ollama-pull.log" 2>&1 &
info "Ollama model pull running in background — check: tail -f ${LOG_DIR}/ollama-pull.log"

# Wait for OpenSearch
info "Waiting for OpenSearch (up to 2 min)…"
for i in $(seq 1 24); do
    if curl -sf http://localhost:9200/_cluster/health &>/dev/null; then
        ok "OpenSearch healthy"; break
    fi
    [[ $i -eq 24 ]] && warn "OpenSearch not yet healthy — check: podman logs opensearch-service"
    sleep 5
done

# ── Summary ───────────────────────────────────────────────────────────────
FQDN=$(hostname -f 2>/dev/null || hostname)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}${GREEN}  ✓ Deployment complete  ($(elapsed))${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  ${BOLD}Carbon UI (DGPCI Demo):${NC}     http://${FQDN}:3000"
echo -e "  ${BOLD}Entity Extraction API:${NC}      http://${FQDN}:6000/docs"
echo -e "  ${BOLD}Translation API:${NC}            http://${FQDN}:9000/docs"
echo -e "  ${BOLD}RAG Backend:${NC}               http://${FQDN}:8081"
echo -e "  ${BOLD}OpenSearch:${NC}                http://${FQDN}:9200"
echo -e "  ${BOLD}Ollama:${NC}                    http://${FQDN}:11434"
echo ""
echo -e "  ${BOLD}⚠  Ollama model pull still running in background${NC}"
echo -e "  Monitor: tail -f ${LOG_DIR}/ollama-pull.log"
echo -e "  The demo will work once the pull completes and Ollama is ready."
echo ""
echo -e "  ${BOLD}Next steps:${NC}"
echo -e "    Register extraction schema:  ./init-schema.sh"
echo -e "    Ingest regulation docs:      ./ingest-regulations.sh"
echo -e "    Check service status:        ./manage-dgpci.sh status"
echo ""
echo -e "  ${BOLD}Log:${NC} ${LOG_FILE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Made with Bob
