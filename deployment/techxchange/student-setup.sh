#!/bin/bash
# student-setup.sh — TechXchange Lab 1127, Part 3 (optional): Carbon GenAI Demos
#
# Prepares a student RHEL LPAR to run the Carbon GenAI Demos UI. It does NOT start
# the application: the lab guide has the student start it, so the backend settings
# (which LLM endpoint, which model name) are visible on the command line.
#
# What it does:
#   1. Installs Node.js 22 from the official nodejs.org ppc64le build (checksum verified).
#      The LPAR is not registered with Red Hat, so dnf cannot supply Node.
#   2. Installs yarn (the repo's lockfile is yarn.lock).
#   3. Clones this branch into ~/Carbon-GenAI-Demos (or updates it if already there).
#   4. Installs the Node dependencies and builds the Next.js app.
#
# Run as root on the student LPAR:
#   bash student-setup.sh
#
# Optional environment variables:
#   BRANCH    branch to clone   (default: feature/lab1127-techxchange)
#   REPO_URL  repository URL    (default: https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos.git)
#   NODE_MAJOR Node major version (default: 22 — @carbon/themes needs >= 22)

set -euo pipefail

BRANCH="${BRANCH:-feature/lab1127-techxchange}"
REPO_URL="${REPO_URL:-https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos.git}"
NODE_MAJOR="${NODE_MAJOR:-22}"
NODE_HOME="/usr/local/node"
REPO_DIR="$HOME/Carbon-GenAI-Demos"

step() { echo; echo ">>> $*"; }
ok()   { echo "OK   $*"; }
fail() { echo "FAIL $*" >&2; exit 1; }

START=$(date +%s)

# ── 1. Node.js ────────────────────────────────────────────────────────────────
step "[1/4] Node.js ${NODE_MAJOR}"
export PATH="${NODE_HOME}/bin:$PATH"

have_node=0
if command -v node >/dev/null 2>&1; then
    [ "$(node --version | sed 's/v//' | cut -d. -f1)" -ge "$NODE_MAJOR" ] && have_node=1
fi

if [ "$have_node" -eq 1 ]; then
    ok "Node $(node --version) already installed — skipping"
else
    [ "$(uname -m)" = "ppc64le" ] || fail "This script downloads the ppc64le build; this machine is $(uname -m)"
    BASE="https://nodejs.org/dist/latest-v${NODE_MAJOR}.x"

    # SHASUMS256.txt lists every file in the release with its checksum. We use it
    # both to find the current ppc64le filename and to verify what we download.
    LINE=$(curl -fsSL "${BASE}/SHASUMS256.txt" | grep 'linux-ppc64le.tar.gz$') \
        || fail "Could not read ${BASE}/SHASUMS256.txt (is nodejs.org reachable?)"
    SUM=$(echo "$LINE" | awk '{print $1}')
    FILE=$(echo "$LINE" | awk '{print $2}')

    echo "Downloading ${FILE} ..."
    curl -fsSL -o "/tmp/${FILE}" "${BASE}/${FILE}"
    echo "${SUM}  /tmp/${FILE}" | sha256sum -c - || fail "Checksum mismatch for ${FILE}"

    rm -rf "$NODE_HOME"
    mkdir -p "$NODE_HOME"
    tar -xzf "/tmp/${FILE}" -C "$NODE_HOME" --strip-components=1
    rm -f "/tmp/${FILE}"

    # Put Node on PATH for every future login shell, not just this script.
    echo "export PATH=${NODE_HOME}/bin:\$PATH" > /etc/profile.d/node.sh
    ok "Node $(node --version) installed to ${NODE_HOME}"
fi

# ── 2. yarn ───────────────────────────────────────────────────────────────────
step "[2/4] yarn"
if command -v yarn >/dev/null 2>&1; then
    ok "yarn $(yarn --version) already installed — skipping"
else
    npm install --global yarn
    ok "yarn $(yarn --version) installed"
fi

# ── 3. Clone the branch ───────────────────────────────────────────────────────
step "[3/4] Clone branch ${BRANCH}"
if [ -d "${REPO_DIR}/.git" ]; then
    git -C "$REPO_DIR" fetch origin "$BRANCH"
    git -C "$REPO_DIR" checkout "$BRANCH"
    git -C "$REPO_DIR" pull --ff-only origin "$BRANCH"
else
    git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$REPO_DIR"
fi
ok "Repository at ${REPO_DIR} ($(git -C "$REPO_DIR" log -1 --oneline))"

# ── 4. Install dependencies and build ─────────────────────────────────────────
step "[4/4] Install dependencies and build (a few minutes)"
cd "${REPO_DIR}/carbon-ui"
# --ignore-engines: some transitive packages declare Node ranges yarn is strict about.
yarn install --ignore-engines

# The repo's package.json pins @carbon/react 1.33.0, which predates the AILabel
# components the demo pages import (the build "succeeds" but the pages would break).
# These are the exact versions tested on a student LPAR; pinned so the lab does not
# drift if newer releases appear before the event.
yarn add --ignore-engines \
    @carbon/react@1.118.0 \
    @carbon/icons-react@11.90.0 \
    @carbon/pictograms-react@11.112.0

# Build, keep the log, and fail loudly if the Carbon imports are still broken.
yarn build 2>&1 | tee /tmp/carbon-build.log
if grep -q "Attempted import error" /tmp/carbon-build.log; then
    fail "Build has missing Carbon imports — see /tmp/carbon-build.log"
fi
ok "Build complete"

ELAPSED=$(( $(date +%s) - START ))
echo
echo "Setup finished in $(( ELAPSED/60 ))m $(( ELAPSED%60 ))s."
echo
echo "IMPORTANT: Node was added to the PATH for NEW login shells only."
echo "In this shell, run this now, before anything else:"
echo
echo "    source /etc/profile.d/node.sh"
echo
echo "Next: open port 3000, then start the app (see the lab guide)."
