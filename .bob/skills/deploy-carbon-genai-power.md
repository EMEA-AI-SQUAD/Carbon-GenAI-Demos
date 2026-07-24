---
name: deploy-ibm-power-genai
description: >
  Everything Bob needs to know to deploy, verify, and troubleshoot the
  IBM Power GenAI demo on a fresh IBM Power TechZone environment. Covers
  the one manual step (TechZone reservation), SSH key authentication,
  the automated deployment script, service verification, all known
  failure modes, and the recommended ICA tailoring workflow for
  customer-specific engagements.
version: 1.1.0
author: EMEA AI on IBM Power Squad
---

# Skill: Deploy IBM Power GenAI Demo

## What This Deploys

A four-service stack running entirely on IBM Power (ppc64le), no cloud
APIs, no watsonx.ai SaaS — Granite 4.0 Micro runs on the hardware itself:

```
Browser (port 3000)
    │
    ▼
Next.js app  (IBM Design System UI — 9 demo use cases)
    │
    ▼ port 3001
Node.js proxy  (CORS + routing)
    │
    ▼ port 8080  (OpenAI-compatible API)
llama-server
  └── IBM Granite 4.0 Micro (GGUF Q4_K_M, ~2.5 GB)
       running on IBM Power10 (ppc64le)

PassportEye OCR service (port 5000) — for passport verification demo
```

The client story: *your data stays on your Power infrastructure, the
model runs on your hardware, there is no external API dependency.*

---

## Step 1 — Reserve a TechZone Environment (Manual — ~5 minutes effort)

Bob cannot make this reservation automatically. The TechZone collection
is a v1 environment; the TechZone MCP only supports v2 API collections.

1. Go to: https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power
2. Select: **RHEL 9 ready for AI on IBM Power10 (IaaS)**
3. Fill in the reservation form — go slowly (2–3 seconds between fields)
   to avoid the "Checking availability" hang
4. Purpose: **Test** or **Demo** as appropriate
5. Duration: 1–2 weeks is sufficient
6. Wait for status **Ready** — provisioning takes ~15–30 minutes

Once ready, from the reservation details page collect:
- **FQDN** — format: `p<NNNN>-pvm1.p<NNNN>.cecc.ihost.com`
- **Private SSH key** — click "User Private SSH Key" button to download
  the `.pem` file. Use this key, not the password. The password contains
  `!` characters which break automated SSH pipelines on Windows.

> **Note on FQDNs:** TechZone sometimes reuses FQDNs across reservations.
> If SSH complains about a host key conflict, clear the stale entry:
> ```powershell
> ssh-keygen -R <old-fqdn>
> ```

---

## Step 2 — Verify SSH Connectivity

Ask the seller to confirm with:

```powershell
ssh -i "<path-to-key.pem>" -o StrictHostKeyChecking=no cecuser@<fqdn> "uname -m"
```

Expected response: `ppc64le`

The username is always `cecuser` on CE TechZone environments.
IBM VPN must be active — `cecc.ihost.com` hosts are not reachable
from the public internet.

Minimum environment requirements:
- Architecture: `ppc64le` (IBM Power)
- OS: RHEL 9.x
- Free disk: ≥ 10 GB (`df -h /`)
- RAM: ≥ 4 GB free (`free -h`) — 123 GB is typical on these reservations

---

## Step 3 — Run the Deployment Script

The deployment is fully automated from this point. Bob drives it over SSH.

### Stage the launcher and start the deployment

```powershell
# Copy the launcher to the server
scp -i "<key.pem>" deployment/remote-launch.sh cecuser@<fqdn>:/home/cecuser/remote-launch.sh

# Launch — this starts the deploy in the background and returns immediately
ssh -i "<key.pem>" -o StrictHostKeyChecking=no cecuser@<fqdn> "bash ~/remote-launch.sh"
```

The launcher:
- Kills any prior deploy process
- Removes any existing `~/Carbon-GenAI-Demos` clone
- Clones fresh from the configured branch of `https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos`
- Starts `deploy-carbon-genai.sh` under `nohup` with output to `~/deployment/deploy-live.log`
- Returns the PID immediately

### Monitor progress

Tail the live log to show the seller what is happening:

```powershell
ssh -i "<key.pem>" -o StrictHostKeyChecking=no cecuser@<fqdn> "tail -30 ~/deployment/deploy-live.log"
```

Call this every 30–60 seconds. The 15 steps and their expected durations:

| Step | Description | Typical duration |
|------|-------------|-----------------|
| 1 | Pre-flight checks | < 10s |
| 2 | System update (`dnf -y update`) | 3–8 min |
| 3 | Install system dependencies | 1–3 min |
| 4 | Python virtual environment | < 30s |
| 5 | Clone repository | < 30s |
| 6 | Node.js dependencies (yarn install) | 3–5 min |
| 7 | Next.js build (`yarn build`) | ~60s |
| 8 | Configure proxy + FQDN substitution | < 10s |
| 9 | LLM Python environment + PyTorch | 2–4 min |
| 10 | Build llama.cpp from source | 15–20 min |
| 11 | Download Granite 4.0 Micro model (~2.5 GB) | 5–10 min |
| 12 | Start llama-server (port 8080) | < 15s |
| 13 | Install + start PassportEye (port 5000) | 1–2 min |
| 14 | Start Node.js proxy (port 3001) | < 10s |
| 15 | Start Next.js production server (port 3000) | < 10s |

**Total on a clean instance:** ~35–50 minutes
**Total on re-run (cached packages, model, llama.cpp):** ~5 minutes

---

## Step 4 — Verify All Services Are Running

```powershell
ssh -i "<key.pem>" -o StrictHostKeyChecking=no cecuser@<fqdn> "ss -tlnp | grep -E ':(3000|3001|5000|8080)'"
```

Expected output — all four ports listening:
```
LISTEN  0.0.0.0:5000   python3    (PassportEye)
LISTEN  0.0.0.0:8080   llama-server
LISTEN  0.0.0.0:3001   node       (proxy)
LISTEN  *:3000         node       (Next.js)
```

If any port is missing, check the deployment log:
```powershell
ssh -i "<key.pem>" -o StrictHostKeyChecking=no cecuser@<fqdn> "grep -E 'ERROR|STEP' ~/deployment/deploy-live.log"
```

---

## Step 5 — Open the Demo

```
http://<fqdn>:3000
```

IBM VPN must be active. The demo runs in any modern browser.

---

## Known Failure Modes and Fixes

### LLM calls fail in browser with `ERR_NAME_NOT_RESOLVED` or `Connection error`
**Cause:** historic bug — old FQDN was hardcoded in source files and baked
into the Next.js build. Fully resolved: all API URLs are now derived from
`window.location.hostname` at browser runtime. No hostname is compiled
into the built JS. This error should not recur on any new reservation.
If it does, check for hardcoded hostnames:
```bash
grep -r "cecc.ihost.com" ~/Carbon-GenAI-Demos/carbon-ui/src
```

### `yarn build` fails with `ERR_INVALID_ARG_TYPE` / TypeScript error
**Cause:** yarn resolved TypeScript 7.x instead of 5.9.3.
**Fix:** `yarn.lock` is now committed and pins TypeScript to 5.9.3 exactly.
If this recurs, check that `yarn.lock` is present in the cloned repo.

### `yarn start` fails with `Command "start" not found`
**Cause:** script running from wrong directory.
**Fix:** resolved in commit `e5a03d1`. If this recurs, check the
`start_dev_server()` function has a `cd` to the app directory.

### Node.js version too old — Express/package version errors
**Cause:** RHEL 9 AppStream defaults to Node 16. NodeSource does not
support ppc64le.
**Fix:** the script uses `dnf module enable nodejs:20` then
`dnf install nodejs`. This is already in the current deploy script.
Never use NodeSource on ppc64le.

### `configure_proxy` does not run / FQDN not substituted
**Cause:** historic bug — `configure_proxy()` was nested inside
`build_application()`. Fixed in commit `cd804f8`.

### llama-server dies immediately after start
**Cause:** model file not fully downloaded, or downloaded to `/tmp/models`
which was cleared by a reboot.
**Fix:** model is now downloaded to `~/models` which persists across
reboots. Check with:
```bash
ls -lh ~/models/granite-4.0-micro-Q4_K_M.gguf
# expected: ~2.5 GB
```
If missing, re-run the deployment script — it will skip all already-complete
steps and only re-download the model.

### SSH connection times out before reaching the server
**Cause:** IBM VPN not active. The `cecc.ihost.com` domain is only
reachable on the IBM intranet.
**Fix:** connect to IBM VPN, then retry.

### PassportEye setup fails
**Cause:** `tesseract` may not be available in RHEL 9 AppStream for
ppc64le, or pip dependencies may fail to build.
**Status:** PassportEye setup has a soft-fail wrapper in the main script
— if it fails, the rest of the deployment continues. The Passport
Verification use case will not work but all other 8 demos will.
**Fix:** run `bash ~/Carbon-GenAI-Demos/deployment/setup-passporteye.sh`
manually after deployment and inspect the output.

### Port 3000 or 3001 already in use on a re-deploy
**Cause:** previous deploy's processes still running.
**Fix:** `bash ~/Carbon-GenAI-Demos/deployment/stop-server.sh` then
re-run the deployment, or kill individual processes:
```bash
kill $(cat ~/carbon-dev-server.pid)   # Next.js
kill $(cat ~/proxy-server.pid)        # proxy
kill $(cat ~/llama-server.pid)        # llama-server
```

---

## Customer Tailoring Workflow

Before deploying for a specific client engagement, it is strongly recommended
to tailor the demo sample data. The generic `main` branch ships with realistic
but industry-neutral defaults. Customer-tailored versions live on separate
branches (e.g. `farnell-demo`) so `main` stays clean for reuse.

### How to tailor using ICA and Pre-Sales Demo Builder

1. **Switch Bob to Pre-Sales Demo Builder mode**
2. **Gather intelligence via IBM Consulting Advantage** (IBM VPN required):
   - Go to https://w3.ibm.com/#/apps/consulting-advantage
   - Start a new chat — ask it to focus on the customer's country/region
   - Upload the customer's annual report and most recent earnings presentation (PDF)
   - Ask: *"Summarise this company's key business priorities, operational challenges, and technology investment themes relevant to an IBM Power / IBM i conversation"*
   - Copy the ICA response
3. **Paste the ICA summary into Bob** and say:
   > *"Using this customer intelligence summary, tailor the IBM Power GenAI demo for [customer name]. My audience includes [roles]. Keep the real customer reference scenarios (Hans Geis, Mr. Bean passport) as they are — those are useful icebreakers. Update the generic scenarios to reflect this customer's world."*
4. Bob will create a customer-specific branch and update the deployment scripts automatically.
5. Deploy from the customer branch — `main` is untouched.

### Which scenarios are safe to tailor

| Demo | Status | Notes |
|------|--------|-------|
| Entity Extraction — Book Review / Component Entry | ✅ Tailor freely | Generic by default |
| Entity Extraction — IT Ops emails (Italian/French) | ✅ Tailor freely | Generic by default |
| Entity Extraction — German Logistics (Hans Geis) | 🔒 Leave as-is | Real IBM customer case study |
| PII — Fraud Complaint | ✅ Tailor freely | Generic by default |
| PII — Passport Verification (Mr. Bean) | 🔒 Leave as-is | Crowd-pleaser, intentionally light-hearted |
| PII — Document Discovery | ✅ Tailor freely | Generic by default |
| Brief Builder | ✅ Tailor freely | Generic by default |
| RFP Assistant | ✅ Tailor freely | Generic by default |
| Talent Acquisition | ✅ Tailor freely | Generic by default |

## Repository and Architecture Notes

**Two GitHub remotes are kept in sync — always push to both:**
- `origin` — `https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos`
- `power-demos` — `https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos`

The deploy script clones from `ibm-power-demos-with-bob`. If fixes are
committed only to `EMEA-AI-SQUAD`, the deployed code will be stale.

**Key ppc64le constraints:**
- NodeSource does not support ppc64le — use `dnf module enable nodejs:20`
- PyTorch and OpenBLAS must come from IBM's wheels repo:
  `https://wheels.developerfirst.ibm.com/ppc64le/linux`
- llama.cpp must be built from source — no ppc64le binary releases
- All npm package versions are pinned for Node 20 compatibility;
  `http-proxy-middleware`, `openai`, and `express` all have recent
  major versions that require Node ≥22

**No watsonx.ai, no API keys:**
This deployment is intentionally self-contained. The LLM runs locally
via llama.cpp. There are no environment variables to configure for
the AI inference path.

---

## Demo Use Cases Quick Reference

Open `http://<fqdn>:3000` and verify each tab loads and returns
a structured AI response:

| Tab | Use Case | What to submit |
|-----|----------|----------------|
| Entity Extraction | 📦 Component / Product Entry | Product description text |
| Entity Extraction | 🌍 Multilingual IT Ops | Italian or French support email |
| Entity Extraction | 🚚 German Logistics Quote | Hans Geis sample logistics text |
| PII Extraction | 🔒 Fraud Complaint | Text with name/address/card number |
| PII Extraction | 🛂 Passport Verification | Sample passport MRZ text |
| PII Extraction | 📄 Document Discovery | Any document text |
| Other | 📝 Brief Builder | Campaign launch notes |
| Other | 📋 RFP Assistant | RFP extract |
| Other | 👔 Talent Acquisition | Job title and description |

A healthy response is structured JSON or formatted text returned within
~5–15 seconds. A spinner that never resolves indicates the llama-server
is not running or the proxy is misconfigured.
