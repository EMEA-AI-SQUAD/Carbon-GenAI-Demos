#!/bin/bash

################################################################################
# Script: update-all-fqdns.sh
# Purpose: Update FQDN in all demo pages and proxy configuration
# Author: Bob
# Date: 2026-04-21
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
BASE_PATH="${HOME_DIR}/${REPO_DIR}/${APP_DIR}"

echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}Update FQDN in All Demo Pages and Proxy${NC}"
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

# Files to update
FILES=(
    "src/app/briefbuilder/page.js"
    "src/app/convintel/page.js"
    "src/app/entextract/page.js"
    "src/app/piiextract/page.js"
    "src/app/piiextract/passporteye-extraction.js"
    "src/app/rfpassistant/page.js"
    "src/app/talentacquisition/page.js"
    "src/llama-proxy/server_final.js"
)

echo -e "${BLUE}ℹ${NC} Updating FQDN in ${#FILES[@]} files..."
echo ""

UPDATED=0
FAILED=0

for file in "${FILES[@]}"; do
    FULL_PATH="${BASE_PATH}/${file}"
    
    if [ ! -f "$FULL_PATH" ]; then
        echo -e "${YELLOW}⚠${NC} File not found: $file"
        ((FAILED++))
        continue
    fi
    
    # Create backup if it doesn't exist
    if [ ! -f "${FULL_PATH}.backup" ]; then
        cp "$FULL_PATH" "${FULL_PATH}.backup"
    fi
    
    # Update the file - replace any p13XX-pvm1.p13XX.cecc.ihost.com with current FQDN
    sed -i "s|http://p[0-9]*-pvm[0-9]*.p[0-9]*.cecc.ihost.com|http://${FQDN}|g" "$FULL_PATH"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Updated: $file"
        ((UPDATED++))
    else
        echo -e "${RED}✗${NC} Failed: $file"
        ((FAILED++))
    fi
done

echo ""
echo -e "${BOLD}Summary:${NC}"
echo -e "  ${GREEN}✓${NC} Updated: $UPDATED files"
if [ $FAILED -gt 0 ]; then
    echo -e "  ${RED}✗${NC} Failed: $FAILED files"
fi

echo ""
echo -e "${YELLOW}⚠${NC} Next steps:"
echo -e "   1. Rebuild the application: ${BOLD}cd ${BASE_PATH} && npm run build${NC}"
echo -e "   2. Restart services: ${BOLD}cd ${HOME_DIR}/${REPO_DIR}/deployment && ./restart-services.sh${NC}"

echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Made with Bob