#!/bin/bash
# =============================================================================
# try-extract.sh — Test entity extraction service images in priority order.
#
# Strategy (tried in order):
#   1. icr.io/ai-services/extract-service:latest   (newest — team may have fixed)
#   2. icr.io/ai-services/extract-service:v0.0.16  (N-1 — before vLLM tokenize refactor)
#   3. localhost/dgpci-extract:latest              (our local Ollama-patched build)
#
# Each candidate is started WITHOUT -d to avoid a hung session when the
# container fails to come up.  We use a background subshell + poll loop so
# the terminal stays responsive and we can kill the attempt cleanly.
#
# Usage:
#   chmod +x try-extract.sh
#   ./try-extract.sh
#
# On success the winning image tag is printed and the container is left running
# on port 6000.  Update EXTRACT_IMAGE in .env and restart the stack with:
#   ./manage-dgpci.sh restart   (or podman-compose up without -d)
# =============================================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC}  $*"; }
warn() { echo -e "  ${YELLOW}⚠${NC}   $*"; }
err()  { echo -e "  ${RED}✗${NC}  $*"; }
info() { echo -e "  ${BLUE}ℹ${NC}  $*"; }

# Load .env for Postgres credentials and Ollama model
ENV_FILE="${SCRIPT_DIR}/.env"
if [[ -f "${ENV_FILE}" ]]; then
    # shellcheck disable=SC1090
    set -a; source "${ENV_FILE}"; set +a
fi

POSTGRES_USER="${POSTGRES_USER:-dgpci}"
# Password read from .env at runtime — never hard-coded here
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-changeme}"
OLLAMA_MODEL="${OLLAMA_MODEL:-granite4:latest}"
CONTAINER_NAME="extract-probe"

# Images to try, in order
CANDIDATES=(
    "icr.io/ai-services/extract-service:latest"
    "icr.io/ai-services/extract-service:v0.0.16"
    "localhost/dgpci-extract:latest"
)

CANDIDATE_LABELS=(
    "AI Services latest (newest upstream — may have weekend fixes)"
    "AI Services v0.0.16 (N-1 — pre-tokenize-refactor)"
    "Local Ollama-patched build (our proven fallback)"
)

# ── Helpers ──────────────────────────────────────────────────────────────────

cleanup_probe() {
    if podman inspect "${CONTAINER_NAME}" &>/dev/null; then
        info "Stopping probe container…"
        podman stop "${CONTAINER_NAME}" &>/dev/null || true
        podman rm   "${CONTAINER_NAME}" &>/dev/null || true
    fi
}

# Poll health endpoint; return 0 on success, 1 on timeout.
# $1 = max seconds to wait
wait_for_health() {
    local max_wait="${1:-90}"
    local i=0
    while [[ $i -lt $max_wait ]]; do
        if curl -sf http://localhost:6000/health &>/dev/null; then
            return 0
        fi
        sleep 3
        i=$((i + 3))
    done
    return 1
}

# Try a single candidate image.  Returns 0 on success.
try_image() {
    local image="$1"
    local label="$2"

    echo ""
    echo -e "${BOLD}${CYAN}▶  Trying: ${image}${NC}"
    echo -e "   ${label}"
    echo ""

    # Remove any stale probe container
    cleanup_probe

    # Pull first (with timeout-friendly output — not -d, just foreground pull)
    info "Pulling image (streaming output so the session stays alive)…"
    if ! podman pull "${image}" 2>&1; then
        warn "Pull failed for ${image} — skipping."
        return 1
    fi
    ok "Image pulled."

    # Start the container in the BACKGROUND subshell (no -d flag on podman run —
    # we use "&" so the terminal is not blocked, but we keep stdout/stderr in a
    # temp log so we can show it on failure).
    local tmplog
    tmplog=$(mktemp /tmp/extract-probe-XXXXXX.log)

    info "Starting container (logs → ${tmplog})…"
    podman run \
        --name "${CONTAINER_NAME}" \
        --rm \
        --network dgpci_dgpci-net \
        --env LLM_ENDPOINT=http://ollama-service:11434 \
        --env LLM_MODEL="${OLLAMA_MODEL}" \
        --env LLM_MAX_MODEL_LEN=32768 \
        --env POSTGRES_HOST=postgres \
        --env POSTGRES_PORT=5432 \
        --env POSTGRES_DB=extract_db \
        --env POSTGRES_USER="${POSTGRES_USER}" \
        --env POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
        --env APP_LOG_LEVEL=INFO \
        -p 6000:6000 \
        "${image}" \
        >"${tmplog}" 2>&1 &

    local PID=$!

    info "Container PID=${PID} — polling /health (up to 90 s)…"
    if wait_for_health 90; then
        ok "Health check PASSED for ${image}"
        echo ""
        echo -e "${GREEN}${BOLD}  ✓ WINNER: ${image}${NC}"
        echo ""
        echo "  Update .env:"
        echo "    EXTRACT_IMAGE=${image}"
        echo ""
        echo "  Then run: ./manage-dgpci.sh restart"
        echo ""
        # Leave container running — caller can use or stop as needed
        echo "${image}" > "${SCRIPT_DIR}/.extract-winner"
        return 0
    else
        err "Health check FAILED for ${image} (90 s timeout)"
        echo ""
        echo "  Last 30 lines of container log:"
        echo "  ────────────────────────────────"
        tail -30 "${tmplog}" | sed 's/^/    /'
        echo "  ────────────────────────────────"
        echo ""
        # Kill the background container
        kill "${PID}" 2>/dev/null || true
        cleanup_probe
        rm -f "${tmplog}"
        return 1
    fi
}

# ── Main ─────────────────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}${CYAN}  DGPCI Entity Extraction — Image Probe${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Will try ${#CANDIDATES[@]} candidate images in order."
echo "  Each attempt times out after 90 s — no hanging sessions."
echo ""

# Make sure any pre-existing extract-service container is not on port 6000
if podman inspect extract-service &>/dev/null; then
    warn "extract-service container is running — stopping it to free port 6000"
    podman stop extract-service &>/dev/null || true
fi

WINNER=""
for i in "${!CANDIDATES[@]}"; do
    if try_image "${CANDIDATES[$i]}" "${CANDIDATE_LABELS[$i]}"; then
        WINNER="${CANDIDATES[$i]}"
        break
    fi
    warn "Candidate $((i+1))/${#CANDIDATES[@]} failed — trying next…"
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ -z "${WINNER}" ]]; then
    err "All ${#CANDIDATES[@]} candidates failed."
    echo ""
    echo "  Next step: check Ollama and Postgres are healthy:"
    echo "    ./manage-dgpci.sh status"
    echo "    podman logs ollama-service | tail -20"
    echo "    podman logs postgres | tail -20"
    echo ""
    exit 1
fi

echo -e "${BOLD}${GREEN}  Probe complete. Winner recorded in .extract-winner${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Made with Bob
