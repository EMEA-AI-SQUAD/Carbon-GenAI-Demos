# Deployment Summary — 29 September 2026

## What we deployed

Two live GenAI demos on a single IBM Power10 TechZone VM, ready for the 11am call.

### VM details

| | |
|---|---|
| **Host** | `pvm1-jm07pj3k.p1206.pok-systems.techzone.ibm.com` |
| **Reservation** | Sales Manual Reader Dev (`6aba4269`) |
| **Spec** | RHEL 10.2, Power10, 8 vCPU dedicated, 50 GB RAM |
| **Expires** | 2026-10-02 |
| **Access** | IBM VPN required |

---

## Live URLs

| Demo | URL | What it shows |
|---|---|---|
| **Base Carbon GenAI** | `http://pvm1-jm07pj3k.p1206.pok-systems.techzone.ibm.com:3000` | Generic IBM Power + Granite story — 18 use cases across 6 pages |
| **Premier Farnell** | `http://pvm1-jm07pj3k.p1206.pok-systems.techzone.ibm.com:3002` | Same app, Farnell-tailored content — electronic components, ADC catalogue, Leeds distribution centre scenarios |

---

## What is running on the VM (pm2)

| Service | Port | What it is |
|---|---|---|
| `llama-server` | 8080 | llama.cpp serving IBM Granite 4.0 Micro (Q4_K_M, ~2 GB) natively on ppc64le |
| `proxy` | 3001 | Node.js CORS proxy — both UIs route LLM calls through here |
| `nextjs` | 3000 | Base Carbon GenAI demo (`main` branch) |
| `nextjs-farnell` | 3002 | Premier Farnell demo (same codebase, Farnell `src` overlaid) |
| `passporteye` | 5000 | Flask microservice for passport MRZ OCR (PII Extract page) |

Both UIs share the same LLM — no second model download or second llama-server needed.

---

## How we got here

The VM already had a separate IBM Power RAG demo deployed (Ollama + OpenSearch + RAG backend in Podman containers). We reused the same VM without touching any of that:

1. **Freed port 3001** — stopped the pre-existing `carbon-rag-ui` Podman container which was occupying it
2. **Full base deploy** — ran `deploy-carbon-genai.sh` (`main` branch) in the background: installed Node.js, yarn, pm2, built the Next.js app, compiled llama.cpp from source, downloaded Granite 4.0 Micro, started all services (~35 minutes)
3. **Farnell overlay** — zipped just the `src` folder from the local `Carbon-GenAI-Demos-Farnell` folder on this machine, `scp`'d it to the VM, overlaid it onto a copy of the base `carbon-ui`, ran `yarn build`, started on port 3002 (~3 minutes build)
4. **PassportEye** — started the OCR microservice using the venv that the base deploy had already created

---

## Bugs fixed along the way (committed to `main`)

### PassportEye was being silently skipped on every fresh deploy

**Root cause:** both `setup-passporteye.sh` and `start-passporteye-service.sh` computed the venv path using `BASH_SOURCE` path arithmetic. When called as subprocesses from `deploy-carbon-genai.sh`, the paths resolved incorrectly and neither matched `~/.passporteye-venv` where the venv was actually created.

**Fixes:**
- `setup-passporteye.sh` — venv path changed to explicit `$HOME/.passporteye-venv`
- `start-passporteye-service.sh` — same path fix; fragile path arithmetic removed; health check now retries for 20 seconds instead of a single check after 5s
- `deploy-carbon-genai.sh` — PassportEye failure is now a **hard stop** (`cleanup_on_error`) rather than a swallowed warning, so it can never be silently skipped again

### New script: `deploy-farnell-overlay.sh`

Added to `main` — documents and automates the process of deploying a second audience-tailored UI alongside the base deploy. Includes a `sudo chmod -R u+rX` step before every `cp` from an extracted zip, which is necessary because zips created from OneDrive folders on Windows carry NTFS ACL metadata that can cause directories to land as mode `000` on Linux.

---

## Key points for the demo

- The LLM (**IBM Granite 4.0 Micro**) is running **entirely on the IBM Power10 VM** — no cloud API, no watsonx.ai SaaS, no data leaving the VM
- Both demos use the **same model and the same llama-server process** — switching between `:3000` and `:3002` shows how the same infrastructure serves different audience-tailored applications simultaneously
- PassportEye on `:5000` enables the live passport MRZ extraction on the PII Extract page
- The Farnell demo content: electronic component catalogue entries, ADC part numbers, Leeds distribution centre stock, volume pricing — all extracted/redacted/analysed by Granite running on Power10

---

## If anything needs restarting

```
ssh -i C:\Users\029878866\Downloads\rag_key_p1206.pem U9XTAN2@pvm1-jm07pj3k.p1206.pok-systems.techzone.ibm.com

pm2 list                        # check all services
pm2 restart nextjs-farnell      # restart Farnell UI
pm2 restart nextjs              # restart base UI
pm2 logs nextjs-farnell         # check Farnell logs
```
