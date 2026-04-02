#!/bin/bash

################################################################################
# Script: update-and-rebuild.sh
# Purpose: Pull latest code, rebuild, and restart services
# Usage: ./update-and-rebuild.sh
################################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="Carbon-GenAI-Demos"
APP_DIR="carbon-ui"

echo "🔄 Updating Carbon GenAI Demo..."
echo ""

# Navigate to repo root
cd "${SCRIPT_DIR}/.." || exit 1

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin feature/conversation-intelligence
echo "✅ Git pull complete"
echo ""

# Stop services
echo "🛑 Stopping services..."
cd "${SCRIPT_DIR}"
./stop-server.sh
echo "✅ Services stopped"
echo ""

# Navigate to app directory
cd "${SCRIPT_DIR}/${REPO_DIR}/${APP_DIR}" || exit 1

# Rebuild the application
echo "🏗️  Rebuilding Next.js application..."
echo "This may take 2-3 minutes..."
yarn build
echo "✅ Build complete"
echo ""

# Start production server
echo "🚀 Starting production server..."
nohup yarn start > /dev/null 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "${SCRIPT_DIR}/carbon-dev-server.pid"
echo "✅ Production server started (PID: $SERVER_PID)"
echo ""

# Start proxy server
echo "🔌 Starting proxy server..."
cd "${SCRIPT_DIR}/${REPO_DIR}/${APP_DIR}/src/llama-proxy"
nohup node server_final.js > /dev/null 2>&1 &
PROXY_PID=$!
echo "$PROXY_PID" > "${SCRIPT_DIR}/proxy-server.pid"
echo "✅ Proxy server started (PID: $PROXY_PID)"
echo ""

# Verify PassportEye is running
if pgrep -f "passport_service.py" > /dev/null; then
    echo "✅ PassportEye service is running"
else
    echo "⚠️  PassportEye service not running, starting it..."
    cd "${SCRIPT_DIR}"
    ./start-passporteye-service.sh
fi
echo ""

echo "✅ Update complete!"
echo ""
echo "📝 Next steps:"
echo "1. Open browser to: http://p1362-pvm1.p1362.cecc.ihost.com:3001/piiextract"
echo "2. Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo "3. Navigate to Passport Verification tab"
echo "4. Upload your passport image"
echo "5. Click 'Extract Passport Information'"
echo "6. Verification status should appear next to the extracted data"
echo ""

# Made with Bob
