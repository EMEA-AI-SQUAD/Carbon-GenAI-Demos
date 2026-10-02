# DGPCI Romania Demo — Deployment Guide

Demo pentru DGPCI (Direcția Generală Poliție Criminalitică și Investigații)  
IBM Power10 · RHEL · Podman · AI Services (Entity Extraction + Translation + RAG)

---

## What this demo shows

Three AI capabilities running **on-premises on IBM Power10** — no GPU, no cloud, data never leaves the DGPCI network:

| Screen | Service | Description |
|---|---|---|
| 🔍 **Extragere Entități** | IBM AI Services Extract | Extracts VIN, manufacturer, declared value, origin from vehicle import documents |
| 🌐 **Traducere Document** | IBM AI Services Translate | Translates Chinese vehicle documents to Romanian (+ English) |
| 📚 **Asistent Reglementări** | RAG on Granite 4.0 | Answers Romanian-language questions about import regulations and fraud indicators |

---

## Architecture

```
Carbon UI (port 3000)
    │
    ├── POST /api/extract    → extract-service:6000  (IBM AI Services Extract)
    ├── POST /api/translate  → translate-service:9000 (IBM AI Services Translate)
    └── POST /api/rag        → rag-backend:8081
                                    ├── ollama-service:11434  (Granite 4.0)
                                    └── opensearch-service:9200

Both extract + translate services also call ollama-service:11434 as their LLM backend.
postgres:5432  — job state DB for extract + translate services
```

---

## Prerequisites on the RHEL LPAR

- RHEL 9.x or 10.x on IBM Power10 (ppc64le)
- Minimum 32 GB RAM, 80 GB free disk
- Internet access (for pulling images and cloning repos)
- IBM VPN not required after deployment (all traffic is internal)

---

## Quick start

```bash
# 1. Clone this repo on the LPAR
git clone https://github.com/DSpurway/Carbon-GenAI-Demos.git
cd Carbon-GenAI-Demos/deployment/dgpci

# 2. Configure
cp env.example .env
# Edit .env if you want to change the Postgres password or model name

# 3. Deploy (takes ~40-60 min on first run — image builds + Ollama model pull)
chmod +x deploy-dgpci.sh manage-dgpci.sh init-schema.sh ingest-regulations.sh
./deploy-dgpci.sh

# 4. Once Ollama model pull is complete (check: tail -f ~/dgpci-deploy-logs/ollama-pull.log):
./init-schema.sh          # Register extraction schema (once only)
./ingest-regulations.sh   # Load regulation knowledge base into RAG (once only)

# 5. Check status
./manage-dgpci.sh status
```

---

## Demo document samples

Three ready-to-use documents are in `demo-documents/`:

| File | Scenario |
|---|---|
| `doc1-byd-atto3-legitimate.txt` | Legitimate BYD Atto 3 import — clean extraction demo |
| `doc2-mg4-chinese-language.txt` | Chinese-language MG4 declaration — translation demo |
| `doc3-omoda-suspicious.txt` | Suspicious Omoda 5 with low declared value + VIN anomalies |

---

## Key API endpoints (post-deploy)

| Service | URL | Purpose |
|---|---|---|
| Carbon UI | `http://<LPAR>:3000` | The demo frontend |
| Extract API docs | `http://<LPAR>:6000/docs` | Swagger UI for entity extraction |
| Translate API docs | `http://<LPAR>:9000/docs` | Swagger UI for translation |
| RAG Backend | `http://<LPAR>:8081/health` | Health check |
| OpenSearch | `http://<LPAR>:9200` | Vector store |
| Ollama | `http://<LPAR>:11434/api/version` | LLM health |

---

## Architecture notes

**Why Ollama instead of vLLM?**  
vLLM showed poor performance on CPU (Power10 without Spyre). Ollama with Granite 4.0 
performs reliably on CPU using Power10's MMA (Matrix Math Accelerator) units.

**Why PostgreSQL for extract/translate services?**  
The IBM AI Services source code requires PostgreSQL for job state persistence 
(async extraction jobs, translation job history). A single `postgres:16` container 
serves both services via separate databases (`extract_db`, `translate_db`).

**Why build extract + translate from source?**
The IBM AI Services Containerfiles reference `icr.io/ai-services-cicd/service-base`
(a private IBM CI/CD registry). Our `Containerfile`s replace this with the public
`registry.access.redhat.com/ubi9/python-312` image, which is available for ppc64le.
The deploy script clones `IBM/project-ai-services`, stages the Python source into the
build context, and builds with our public-base Containerfile.

**Why use our own rag-backend instead of the official chatbot service?**
The official `services/chatbot` requires a separate `similarity-service` microservice
plus a dedicated embedding model endpoint — too many moving parts for a demo. Our
`rag-backend` from `IBM-Power-RAG-Demos/Part3-RAG-Sales-Manual/rag-backend` has
OpenSearch + HuggingFace embeddings built in, already supports Ollama, and is proven
on RHEL on Power10. We use official where self-contained, our own where it adds value.

**Translation language support:**
The translate service defaults to English/German. The deploy script patches
`settings.py` to add Chinese and Romanian, and the `SUPPORTED_LANGUAGES` env var
is set accordingly in `podman-compose.yml`.

---

## Troubleshooting

```bash
# Check all service logs
./manage-dgpci.sh logs extract-service
./manage-dgpci.sh logs translate-service
./manage-dgpci.sh logs ollama-service
./manage-dgpci.sh logs postgres

# Test extraction directly
curl -X POST http://localhost:6000/v1/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "VIN: LVVDB21B8ND123456. Manufacturer: BYD. Value: CNY 158000.", "schema_name": "vehicle_import"}'

# Test translation directly
curl -X POST http://localhost:9000/v1/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "车辆识别代码", "source_language": "auto", "target_language": "Romanian"}'

# List Ollama models
curl http://localhost:11434/api/tags
```

---

Made with Bob
