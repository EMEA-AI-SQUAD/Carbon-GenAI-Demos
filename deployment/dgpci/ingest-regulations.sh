#!/bin/bash
# =============================================================================
# ingest-regulations.sh — Load regulation knowledge base into RAG (OpenSearch)
# Run after deploy-dgpci.sh and after Ollama has finished pulling the model
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAG_URL="${RAG_URL:-http://localhost:8081}"
KB_DIR="${SCRIPT_DIR}/knowledge-base"

echo -e "${BOLD}${CYAN}Ingesting DGPCI regulation knowledge base…${NC}"

# Wait for RAG backend
for i in $(seq 1 24); do
    if curl -sf "${RAG_URL}/health" &>/dev/null; then break; fi
    echo "  Waiting for rag-backend… (${i}/24)"
    sleep 5
done
echo -e "  ${GREEN}✓${NC} RAG backend healthy"

# Ingest each text file in the knowledge base directory
for filepath in "${KB_DIR}"/*.txt; do
    filename=$(basename "${filepath}")
    docname="${filename%.txt}"
    echo -e "  Ingesting: ${docname}…"

    RESPONSE=$(curl -sf -X POST "${RAG_URL}/ingest/text" \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": $(python3 -c "import json,sys; print(json.dumps(open('${filepath}').read()))"),
            \"metadata\": {\"source\": \"${filename}\", \"collection\": \"dgpci-regulations\"}
        }" 2>&1 || echo "ERROR")

    if [[ "${RESPONSE}" == *"ERROR"* ]]; then
        echo -e "  ${YELLOW}⚠${NC}  Failed to ingest ${docname} — check RAG backend logs"
    else
        echo -e "  ${GREEN}✓${NC} Ingested: ${docname}"
    fi
done

echo ""
echo -e "${BOLD}${GREEN}Knowledge base ingestion complete.${NC}"
echo -e "Test with: curl -X POST ${RAG_URL}/query -H 'Content-Type: application/json' \\"
echo -e "  -d '{\"query\": \"Ce documente sunt necesare la importul unui vehicul electric din China?\"}'"

# Made with Bob
