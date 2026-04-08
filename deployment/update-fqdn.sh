#!/bin/bash

################################################################################
# Script: update-fqdn.sh
# Purpose: Update FQDN in proxy server configuration
# Author: Bob
# Date: 2026-04-08
################################################################################

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

HOME_DIR="$HOME"
REPO_DIR="Carbon-GenAI-Demos"
APP_DIR="carbon-ui"
PROXY_FILE="${HOME_DIR}/${REPO_DIR}/${APP_DIR}/src/llama-proxy/server_final.js"

echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}Update FQDN in Proxy Configuration${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get current FQDN
FQDN=$(hostname -f)
if [ -z "$FQDN" ]; then
    echo -e "${YELLOW}⚠${NC} Could not get FQDN, using hostname"
    FQDN=$(hostname)
fi

echo -e "${BLUE}ℹ${NC} Current FQDN: ${BOLD}$FQDN${NC}"
echo ""

# Check if proxy file exists
if [ ! -f "$PROXY_FILE" ]; then
    echo -e "${RED}✗${NC} Proxy file not found: $PROXY_FILE"
    exit 1
fi

# Backup the file if backup doesn't exist
if [ ! -f "${PROXY_FILE}.backup" ]; then
    cp "$PROXY_FILE" "${PROXY_FILE}.backup"
    echo -e "${GREEN}✓${NC} Created backup: ${PROXY_FILE}.backup"
fi

# Show current CORS origin
echo -e "${BOLD}Current CORS configuration:${NC}"
grep "origin:" "$PROXY_FILE" | head -1
echo ""

# Update the FQDN in the proxy file
echo -e "${BLUE}ℹ${NC} Updating FQDN in proxy configuration..."

# Replace the origin line (line 14)
sed -i "s|origin: 'http://[^:]*:3000'|origin: 'http://${FQDN}:3000'|g" "$PROXY_FILE"

# Replace the console.log line (line 97)
sed -i "s|Accepting requests from http://[^:]*:3000|Accepting requests from http://${FQDN}:3000|g" "$PROXY_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} FQDN updated successfully"
    echo ""
    echo -e "${BOLD}New CORS configuration:${NC}"
    grep "origin:" "$PROXY_FILE" | head -1
    echo ""
    echo -e "${YELLOW}⚠${NC} You need to restart the proxy server for changes to take effect:"
    echo -e "   ${BOLD}./restart-services.sh${NC}"
else
    echo -e "${RED}✗${NC} Failed to update FQDN"
    exit 1
fi

echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Made with Bob