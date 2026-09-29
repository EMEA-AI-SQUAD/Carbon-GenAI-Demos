#!/bin/bash
# deploy-farnell-overlay.sh
# Overlays Farnell src on top of the base deploy, builds, starts on port 3002.
# Run AFTER deploy-carbon-genai.sh has fully completed.
#
# Expects farnell-src.zip to be present in $HOME, uploaded via:
#   scp -i <key> farnell-src.zip user@host:~/
#
# The zip is created on Windows from an OneDrive folder, so NTFS ACL metadata
# may land some extracted directories as mode 000. We chmod before copying.

set -e

FQDN="${1:-$(hostname -f)}"
FARNELL_DIR="$HOME/Carbon-GenAI-Demos-Farnell"
BASE_DIR="$HOME/Carbon-GenAI-Demos/carbon-ui"
LOG="$HOME/deployment/deploy-farnell.log"

mkdir -p "$HOME/deployment"
echo "[$(date)] Starting Farnell overlay deploy" | tee "$LOG"

# 1. Create Farnell dir as a copy of the base repo carbon-ui
echo "[$(date)] Copying base carbon-ui to Farnell dir..." | tee -a "$LOG"
sudo rm -rf "$FARNELL_DIR"
cp -r "$BASE_DIR" "$FARNELL_DIR"

# 2. Extract and overlay the Farnell src files
echo "[$(date)] Overlaying Farnell src..." | tee -a "$LOG"
rm -rf /tmp/farnell-src
unzip -o ~/farnell-src.zip -d /tmp/farnell-src >> "$LOG" 2>&1

# Fix NTFS ACL metadata that OneDrive zips carry onto Linux (dirs can land as mode 000)
sudo chmod -R u+rX /tmp/farnell-src

# zip contains src/... at top level — copy into place
cp -r /tmp/farnell-src/src/. "$FARNELL_DIR/src/"
echo "[$(date)] Src overlay complete" | tee -a "$LOG"

# 3. Overlay any config files (package.json, next.config.js etc) if zip present
if [ -f ~/farnell-config.zip ]; then
    rm -rf /tmp/farnell-config
    unzip -o ~/farnell-config.zip -d /tmp/farnell-config >> "$LOG" 2>&1
    sudo chmod -R u+rX /tmp/farnell-config
    find /tmp/farnell-config -maxdepth 1 \( -name "*.json" -o -name "*.js" \) -exec cp {} "$FARNELL_DIR/" \; 2>/dev/null || true
fi

# 4. Build
echo "[$(date)] Running yarn build for Farnell..." | tee -a "$LOG"
cd "$FARNELL_DIR"
yarn >> "$LOG" 2>&1
yarn build >> "$LOG" 2>&1
echo "[$(date)] Build complete" | tee -a "$LOG"

# 5. Start on port 3002 via pm2
pm2 delete nextjs-farnell 2>/dev/null || true
sleep 2
PORT=3002 pm2 start yarn --name nextjs-farnell -- start
pm2 save
sleep 8

if ss -tlnp | grep -q ':3002'; then
    echo "[$(date)] SUCCESS — Farnell demo running at http://${FQDN}:3002" | tee -a "$LOG"
else
    echo "[$(date)] WARNING — port 3002 not yet up, check: pm2 logs nextjs-farnell" | tee -a "$LOG"
fi

echo ""
echo "================================================"
echo " Base demo:    http://${FQDN}:3000"
echo " Farnell demo: http://${FQDN}:3002"
echo " Both use the same llama-server on :8080"
echo "================================================"
