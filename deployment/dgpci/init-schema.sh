#!/bin/bash
# =============================================================================
# init-schema.sh — Register the vehicle import extraction schema
# Run ONCE after deploy-dgpci.sh completes and extract-service is healthy
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

EXTRACT_URL="${EXTRACT_URL:-http://localhost:6000}"

echo -e "${BOLD}${CYAN}Registering vehicle_import extraction schema…${NC}"

# Wait for extract service
for i in $(seq 1 20); do
    if curl -sf "${EXTRACT_URL}/health" &>/dev/null; then break; fi
    echo "  Waiting for extract-service… (${i}/20)"
    sleep 5
done

# Register the schema
RESPONSE=$(curl -sf -X POST "${EXTRACT_URL}/v1/schemas" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "vehicle_import",
    "description": "Extrage câmpuri cheie din documente de import vehicule",
    "json_schema": {
      "type": "object",
      "properties": {
        "numar_sasiu":        { "type": "string", "description": "Numărul de șasiu (VIN)" },
        "producator":         { "type": "string", "description": "Producătorul vehiculului" },
        "model":              { "type": "string", "description": "Modelul vehiculului" },
        "tip_motor":          { "type": "string", "description": "Tipul motorului" },
        "valoare_declarata":  { "type": "string", "description": "Valoarea declarată la import" },
        "moneda":             { "type": "string", "description": "Moneda valorii declarate" },
        "tara_origine":       { "type": "string", "description": "Țara de origine" },
        "data_import":        { "type": "string", "description": "Data importului" },
        "numar_motor":        { "type": "string", "description": "Numărul motorului" },
        "culoare":            { "type": "string", "description": "Culoarea vehiculului" }
      },
      "required": ["numar_sasiu", "producator", "model", "valoare_declarata", "tara_origine"]
    },
    "examples": [
      {
        "text": "Vehicle Import Declaration. Chassis No: LVVDB21B8ND123456. Manufacturer: BYD Auto Co Ltd. Model: Atto 3 EV. Engine Type: Electric Motor BYD-EV01. Engine No: BYD2023E789012. Declared Value: CNY 158000. Country of Origin: China. Import Date: 2024-03-15. Colour: Pearl White.",
        "output": {
          "numar_sasiu": "LVVDB21B8ND123456",
          "producator": "BYD Auto Co Ltd",
          "model": "Atto 3 EV",
          "tip_motor": "Electric Motor BYD-EV01",
          "valoare_declarata": "158000",
          "moneda": "CNY",
          "tara_origine": "China",
          "data_import": "2024-03-15",
          "numar_motor": "BYD2023E789012",
          "culoare": "Pearl White"
        }
      }
    ],
    "custom_prompt": "Dacă un câmp nu este prezent în text, returnează null pentru câmpurile opționale."
  }')

SCHEMA_ID=$(echo "${RESPONSE}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('schema_id',''))" 2>/dev/null || echo "")

if [[ -n "${SCHEMA_ID}" ]]; then
    echo -e "  ${GREEN}✓${NC} Schema 'vehicle_import' registered — ID: ${SCHEMA_ID}"
    # Save for reference
    echo "${SCHEMA_ID}" > "$(dirname "${BASH_SOURCE[0]}")/vehicle_schema_id.txt"
    echo -e "  ${GREEN}✓${NC} Schema ID saved to vehicle_schema_id.txt"
else
    echo "  Schema may already exist, or registration failed."
    echo "  Response: ${RESPONSE}"
fi

# Made with Bob
