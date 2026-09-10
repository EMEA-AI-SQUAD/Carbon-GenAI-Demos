#!/bin/bash
# deploy-farnell-ui.sh
# Deploys the Farnell-tailored UI on port 3002, reusing the already-running
# llama-server (8080) and proxy (3001) from the base demo deploy.
# Run this AFTER deploy-carbon-genai.sh has completed successfully.
#
# Usage: bash ~/Carbon-GenAI-Demos/deployment/deploy-farnell-ui.sh <FQDN>
# e.g.:  bash ~/Carbon-GenAI-Demos/deployment/deploy-farnell-ui.sh pvm1-abc123.p1234.pok-systems.techzone.ibm.com

set -e

FQDN="${1:-localhost}"
FARNELL_DIR="$HOME/Carbon-GenAI-Demos-Farnell"
LOG="$HOME/deployment/deploy-farnell.log"

echo "[$(date)] Starting Farnell UI deploy on port 3002" | tee -a "$LOG"

# --- Clone farnell-demo branch ---
echo "[$(date)] Cloning farnell-demo branch..." | tee -a "$LOG"
rm -rf "$FARNELL_DIR"
git clone --branch farnell-demo https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos "$FARNELL_DIR" >> "$LOG" 2>&1
echo "[$(date)] Clone complete." | tee -a "$LOG"

# --- Install Node dependencies ---
echo "[$(date)] Running yarn install..." | tee -a "$LOG"
cd "$FARNELL_DIR/carbon-ui"
yarn install >> "$LOG" 2>&1
echo "[$(date)] yarn install complete." | tee -a "$LOG"

# --- Build ---
echo "[$(date)] Running yarn build..." | tee -a "$LOG"
yarn build >> "$LOG" 2>&1
echo "[$(date)] Build complete." | tee -a "$LOG"

# --- Stop any previous Farnell Next.js pm2 instance ---
pm2 delete nextjs-farnell 2>/dev/null || true
sleep 2

# --- Start Next.js on port 3002 via pm2 ---
echo "[$(date)] Starting Next.js (Farnell) on port 3002 via pm2..." | tee -a "$LOG"
PORT=3002 pm2 start yarn --name nextjs-farnell -- start
echo "[$(date)] pm2 start issued for nextjs-farnell" | tee -a "$LOG"

sleep 8

# --- Verify port 3002 is listening ---
if ss -tlnp | grep -q ':3002'; then
    echo "[$(date)] SUCCESS — Farnell demo running at http://${FQDN}:3002" | tee -a "$LOG"
else
    echo "[$(date)] WARNING — port 3002 not detected yet. Check: pm2 logs nextjs-farnell" | tee -a "$LOG"
fi

echo ""
echo "=========================================="
echo " Farnell demo: http://${FQDN}:3002"
echo " Generic demo: http://${FQDN}:3000"
echo " Both use the same llama-server on :8080"
echo "=========================================="
