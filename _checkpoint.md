# Checkpoint — Carbon GenAI IBM Power Recipe

> Last updated: 2026-10-05

---

## Status

**DGPCI Romania Power10 deployment FULLY OPERATIONAL on TechZone LPAR `pvm1-2ij8bu3k.p1308.pok-systems.techzone.ibm.com` (UOM7SE8, RHEL 10.2). All 7 containers healthy. Entity Extraction validated end-to-end (BYD Atto 3 — all 10 fields extracted). RAG knowledge base ingested. Carbon UI live on port 3000. Ready to demo.**

---

## What has been done

| Session | Key output |
|---|---|
| Jul 2026 | First end-to-end deployment validated on RHEL 9.4, p1279 environment (19m 14s) |
| Aug 2026 | v1 TechZone platform found disabled. RECIPE.md created. Barry doc started. |
| Aug 2026 | Full gap analysis vs. new Bob Recipe Template (published 2026-08-15). Recipe brief (`01-Carbon-GenAI-IBM-Power.md`) written — all 10 use cases, PROMPT #0–#3, demo script, sample inputs, known issues. All docs updated for v2 platform. |
| Sep 2026 | v2 TechZone platform (`6a7aba1916c56f06e4b1e910`) validated. RHEL 10.2 full deployment confirmed (38m 2s clean). All 4 services running. Granite 4.0 Micro LLM verified. Username handling fixed (`cecuser` → per-reservation). Barry doc updated. TechZone bug report drafted. Everything committed (`d639457`). |
| Sep 2026 (10th) | MCP reservation tested — confirmed `userVariables` bug (empty array → `TZ-FS5200_` image not found). Manual reservation works. Bug report updated with full API comparison evidence. `.carbonvenv` purged from all git history (175 commits, both remotes). `.gitattributes` added to prevent CRLF on shell scripts. New Farnell dual-deploy scripts added (`deploy-farnell-ui.sh`, `remote-launch-farnell.sh`). Both demos deployed and verified on `pvm1-sqqsd52k.p1210.pok-systems.techzone.ibm.com` (U3KAJZD, RHEL 10.2, reservation `6aa286be`, expires 2026-09-14). All 5 ports confirmed live. |
| Sep 2026 (10th, cont.) | All use case counts corrected to 18 across all docs. CE Marketplace PR opened: `github.ibm.com/ClientEngineering/bob/pull/231` — `Recipes/IBM-Power-GenAI/` with `README.md` and `01-IBM-Power-GenAI.md`. |
| Oct 2026 (2nd) | **DGPCI Romania Deployment Setup & AI Services Diagnostics**: Official `translate-service` (`icr.io/ai-services/translate-service:v0.0.13`), `postgres`, `ollama-service`, `opensearch-service`, and `rag-backend` verified live and healthy. Diagnosed `extract-service` (v0.0.17) startup dependencies: tight coupling to vLLM's `/tokenize` endpoint and `common/retry_utils.py` dependency on `opensearchpy`. Ready to test pinning an earlier version of `extract-service` (e.g., v0.0.16) or using the direct Ollama extraction route. |
| Oct 2026 (5th) | **Extract Service Probe Script**: Created `deployment/dgpci/try-extract.sh` — tries `extract-service:latest` (weekend fixes?), then `v0.0.16` (N-1, pre-tokenize refactor), then `localhost/dgpci-extract:latest` (our Ollama-patched build). No `-d` flag anywhere in the script to avoid hung sessions. Removed `-d` from `manage-dgpci.sh` start/restart and `deploy-dgpci.sh` up commands. |
| Oct 2026 (5th, cont.) | **Full stack operational**: Root-caused two extract-service failures: (1) `StderrMonitor` in `common/diagnostic_logger.py` uses `os.dup2` which deadlocks uvicorn worker forks — fixed with `ENV DISABLE_CRASH_HANDLER=1` in Containerfile; (2) `/var/cache/extract` volume permission error — fixed with `RUN mkdir -p ... && chown 1001:1001` in Containerfile. Added `opensearch-py>=2.4.0` to requirements (missing vs upstream service-base). Converted LPAR from tarball to proper `git clone --branch feature/dgpci-romania`. RAG knowledge base ingested via `podman exec` Python script into OpenSearch index `dgpci_199857dcd9c701aeeec9a1c10d76444b` (collection: `dgpci-regulations`). Validated: entity extraction (BYD Atto 3 — 10/10 fields, 22s), RAG search (Romanian regulation docs retrieved). Carbon UI live on port 3000. |

---

## Key files

| File | Purpose |
|---|---|
| [`01-Carbon-GenAI-IBM-Power.md`](01-Carbon-GenAI-IBM-Power.md) | **The recipe brief** — this is what gets submitted to the CE Marketplace (along with `RECIPE-README.md`) |
| [`RECIPE-README.md`](RECIPE-README.md) | One-paragraph marketplace blurb |
| [`RECIPE-CONTEXT-FOR-BARRY.md`](RECIPE-CONTEXT-FOR-BARRY.md) | Management summary — passed to Barry, forwarded to Florian |
| [`TECHZONE-BUG-REPORT.md`](TECHZONE-BUG-REPORT.md) | Draft email to `techzone.help@ibm.com` — MCP `userVariables` bug, ready to send |
| [`RHEL10-COMPATIBILITY.md`](RHEL10-COMPATIBILITY.md) | Analysis notes from RHEL 9→10 migration (historical reference) |
| [`RECIPE-JOURNEY.md`](RECIPE-JOURNEY.md) | Full development log — do not rewrite, only append |
| [`deployment/deploy-carbon-genai.sh`](deployment/deploy-carbon-genai.sh) | The deploy script — RHEL version detection for Node.js, LF line endings, validated on RHEL 10.2 |
| [`deployment/deploy-farnell-ui.sh`](deployment/deploy-farnell-ui.sh) | Deploys Farnell-tailored UI on port 3002, reusing shared llama-server |
| [`deployment/remote-launch-farnell.sh`](deployment/remote-launch-farnell.sh) | Remote launcher for Farnell UI deploy |
| [`.bob/skills/deploy-carbon-genai-power.md`](.bob/skills/deploy-carbon-genai-power.md) | Bob skill — v2 platform, per-reservation username, 10 use cases |

---

## TechZone reference

| Item | Value |
|---|---|
| Platform ID | `6a7aba1916c56f06e4b1e910` |
| Platform name | AI-Ready RHEL on IBM Power On-Premises |
| Collection ID | `6261d3584670d7001e3d483a` |
| Provisioner | `base-onpremise-powervc-vm` (v2) |
| Default image | RHEL 10.2 |
| Last test environment | `pvm1-sqqsd52k.p1210.pok-systems.techzone.ibm.com` (U3KAJZD, expires 2026-09-14) |
| SSH key | `C:\Users\029878866\Downloads\techzone-power-key.pem` |
| MCP bug report | `6a9ab558f920404955f890a1`, `6a9ab864c1a0571dc9285fd4`, `6aa2810c2304c2cc2ef9ce6d`, `6aa284ee4220415df51ab728` — `userVariables` not passed |

---

## Next steps

**All services are running — the demo is ready.**

Stack status (as of 2026-10-05):
- `postgres`, `ollama-service`, `opensearch-service`, `rag-backend`, `translate-service` — Up 2+ days, healthy
- `extract-service` — Up and healthy (fixed today)
- `dgpci-carbon-ui` — Up, serving on port 3000

Demo URL: `http://pvm1-2ij8bu3k.p1308.pok-systems.techzone.ibm.com:3000`

1. **If stack needs restart** (foreground — no `-d`; use tmux/screen):
   ```bash
   cd ~/Carbon-GenAI-Demos/deployment/dgpci
   tmux new -s demo
   ./manage-dgpci.sh start
   ```

2. **If extract-service needs rebuild** (e.g. after `git pull`):
   ```bash
   cd ~/Carbon-GenAI-Demos/deployment/dgpci
   git pull origin feature/dgpci-romania
   # Re-stage AI services source
   cp -r ~/project-ai-services/services/extract services/extract-service/extract
   cp -r ~/project-ai-services/services/common  services/extract-service/common
   podman build --tag localhost/dgpci-extract:latest services/extract-service/
   podman rm -f extract-service
   podman run -d --name extract-service --network dgpci_dgpci-net \
     --env LLM_ENDPOINT=http://ollama-service:11434 --env LLM_MODEL=granite4:latest \
     --env LLM_MAX_MODEL_LEN=32768 --env POSTGRES_HOST=postgres \
     --env POSTGRES_PORT=5432 --env POSTGRES_DB=extract_db \
     --env POSTGRES_USER=dgpci --env POSTGRES_PASSWORD=dgpci_secret \
     -p 6000:6000 --restart unless-stopped localhost/dgpci-extract:latest
   ```

3. **If RAG knowledge base needs re-ingesting**:
   ```bash
   # Copy kb files and ingest script into container
   podman cp deployment/dgpci/knowledge-base/fraude-vamale-vehicule.txt rag-backend:/tmp/
   podman cp deployment/dgpci/knowledge-base/producatori-vehicule-chineze.txt rag-backend:/tmp/
   podman cp deployment/dgpci/knowledge-base/reglementari-import-vehicule.txt rag-backend:/tmp/
   podman cp deployment/dgpci/ingest_kb.py rag-backend:/tmp/
   podman exec rag-backend python3 /tmp/ingest_kb.py
   ```
   RAG collection name: `dgpci-regulations`, index: `dgpci_199857dcd9c701aeeec9a1c10d76444b`

4. **Demo scenarios to validate**:
   - Entity Extraction (`/entextract`): paste `doc1-byd-atto3-legitimate.txt` → expect 10 fields extracted ✅
   - Translation (`/translate`): paste `doc2-mg4-chinese-language.txt` → Chinese → Romanian
   - RAG (`/rag` or `/rfpassistant`): ask *"Ce documente sunt necesare la importul unui vehicul din China?"* → regulation answer

---

## Branch state

| Branch | State | Purpose |
|---|---|---|
| `main` | Clean, in sync with GitHub | Generic reusable demo |
| `denmark-2026` | Local only, never push | Danish tailoring for Thursday session |

---

## Starting a new task

Paste this into the first message:

```
DGPCI Romania — IBM AI Services Demo: Build & Deployment Session

We are on branch feature/dgpci-romania of Carbon-GenAI-Demos.
Read _checkpoint.md for full context.

TechZone LPAR details:
- Host: pvm1-2ij8bu3k.p1308.pok-systems.techzone.ibm.com
- User: UOM7SE8
- Key: C:\Users\029878866\Downloads\techzone_id_rsa (password in your password manager)
- Current LPAR state: postgres (5432), ollama-service (11434), opensearch-service (9200), rag-backend (8081), and translate-service (9000) are healthy and running.
- ALL SERVICES RUNNING. Demo is ready on port 3000.
- extract-service fixed (DISABLE_CRASH_HANDLER=1 + cache dir chown in Containerfile)
- RAG knowledge base ingested (collection: dgpci-regulations)
- NOTE: -d flag removed from all podman-compose up. Use tmux/screen to detach.

The demo is live. See Next Steps in _checkpoint.md for restart / rebuild instructions if needed.
```
