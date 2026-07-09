---
name: deploy-carbon-genai-power
description: >
  Deploy the Carbon GenAI demo to a fresh RHEL 9 IBM Power TechZone environment.
  Covers TechZone reservation (manual, v1 API), SSH key auth, running the deployment
  script remotely, monitoring progress, and verifying all three services are healthy.
  Use when a seller or CE wants to stand up the Carbon GenAI IBM Power demo.
---

# Carbon GenAI IBM Power — Deployment Skill

## Overview

This skill guides the full deployment of the Carbon GenAI demo onto a fresh IBM Power
TechZone environment. The demo runs IBM Granite 4.0 Micro via llama.cpp on RHEL 9
(PPC64LE) — no watsonx.ai, no cloud API keys.

---

## Step 1 — TechZone Reservation (Manual)

> ⚠️ The TechZone MCP cannot automate this reservation — the collection uses the v1 API.
> This is the one manual step. It takes ~5 minutes of form-filling and ~15–30 minutes
> to provision.

**Direct link:**
`https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power`

**Environment to select:** `RHEL 9 ready for AI on IBM Power10 (IaaS)`
**Platform ID:** `66479c385e3bbb001e089937`

**Form tips:**
- Wait 2–3 seconds between fields — the form validates in the background
- Purpose: Demo (requires ISC Opportunity Number) or Test
- Geography: any — pick the closest region
- Duration: 7 days minimum recommended

**After provisioning, collect:**
- FQDN (e.g. `p1294-pvm1.p1294.cecc.ihost.com`) — unique per reservation, changes each time
- **Private SSH key** — download from the reservation details page ("User Private SSH Key" button)

**Fixed across all CE TechZone environments:**
- Username is always `cecuser`
- A password is shown on the reservation page but **do not use it** — it contains special
  characters that break automated SSH pipelines. The downloaded private key is the correct
  and only reliable authentication method.

---

## Step 2 — SSH Connectivity

**Always use key-based auth.** The TechZone-provided password contains special characters
that are not reliably passable in automated SSH pipelines on Windows.

```powershell
# Test connectivity (Windows)
ssh -i "C:\path\to\pem_user_privatekey_download.pem" -o StrictHostKeyChecking=no cecuser@<fqdn> "echo OK && uname -m"
```

Expected output: `OK` then `ppc64le`

**If the host key causes issues** (reused FQDN from a previous reservation):
```powershell
ssh-keygen -R <fqdn>
ssh-keygen -R <ip-address>
```
Also clear PuTTY registry if plink is being used:
```powershell
Remove-ItemProperty 'HKCU:\Software\SimonTatham\PuTTY\SshHostKeys' -Name "ssh-ed25519@22:<fqdn>"
```

---

## Step 3 — Run the Deployment Script

The deployment script lives at:
`https://raw.githubusercontent.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos/main/deployment/deploy-carbon-genai.sh`

**Stage and launch (run as a background job so SSH disconnect doesn't kill it):**
```powershell
# Stage the script
ssh -i "<keyfile>" -o StrictHostKeyChecking=no cecuser@<fqdn> `
  "curl -fsSL https://raw.githubusercontent.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos/main/deployment/deploy-carbon-genai.sh -o ~/deploy-carbon-genai.sh && chmod +x ~/deploy-carbon-genai.sh && echo STAGED"

# Launch in background
ssh -i "<keyfile>" -o StrictHostKeyChecking=no cecuser@<fqdn> `
  "mkdir -p ~/deployment && nohup bash ~/deploy-carbon-genai.sh > ~/deployment/deploy-live.log 2>&1 & echo STARTED PID:\$!"
```

**What the script does (16 steps, ~15–20 minutes):**
1. Pre-flight checks (OS, architecture, sudo, internet, disk space)
2. `dnf -y update` system packages
3. Install: Python 3.12, Node.js, GCC, CMake, OpenBLAS, git, wget
4. Create Python virtual environment (`carbon.venv`)
5. Clone repo from `ibm-power-demos-with-bob/Carbon-GenAI-Demos`
6. Install Node.js dependencies (Yarn, Carbon packages, Express, OpenAI SDK)
7. Build Next.js application (`yarn build`)
8. Configure proxy + update FQDN in all app pages
9. Create LLM Python virtual environment (`llama.cpp.venv`)
10. Install PyTorch + OpenBLAS (IBM PPC64LE wheels)
11. Clone and build llama.cpp at commit `b6122` with OpenBLAS
12. Download IBM Granite 4.0 Micro GGUF (`granite-4.0-micro-Q4_K_M.gguf`, ~2.5GB)
13. Start llama-server on port 8080
14. Set up PassportEye OCR service (port 5000)
15. Start proxy server on port 3001
16. Start Next.js production server on port 3000

---

## Step 4 — Monitor Progress

```powershell
# Tail the live log
ssh -i "<keyfile>" -o StrictHostKeyChecking=no cecuser@<fqdn> "tail -f ~/deployment/deploy-live.log"
```

Key log markers to watch for:
- `[1/16] 🔍 Running pre-flight checks` — started
- `[10/16] 🔨 Building llama.cpp` — longest step (~8–10 min)
- `[12/16] 📥 Downloading LLM model` — second longest (~2–5 min on good connection)
- `✅ Deployment Summary` — complete

---

## Step 5 — Verify Deployment

```powershell
ssh -i "<keyfile>" -o StrictHostKeyChecking=no cecuser@<fqdn> `
  "lsof -i :3000,3001,8080,5000 -sTCP:LISTEN 2>/dev/null | awk '{print \$1, \$9}' | sort -u"
```

Expected — four listening ports:
```
llama-ser  *:8080    (LLM server)
node       *:3001    (proxy)
node       *:3000    (web app)
python3    *:5000    (PassportEye)
```

**Access the demo:** `http://<fqdn>:3000`

---

## Re-Deployment / New Environment

When the TechZone reservation expires and a new one is provisioned with a different FQDN,
the deployment script handles everything automatically — it re-clones the repo and
reconfigures the FQDN in the proxy and app pages.

If only updating the FQDN on an already-deployed environment:
```bash
# On the server
cd ~/Carbon-GenAI-Demos
./deployment/update-all-fqdns.sh <new-fqdn>
```

---

## Common Failure Modes

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `Access denied` on SSH | Password used instead of key, or key not yet accepted | Use `-i <keyfile>`, ensure key is chmod 600 |
| Form stuck on "Checking availability" | TechZone form filled too fast | Refresh, start over, wait 2–3s between fields |
| llama.cpp build fails | Missing compiler or disk space | Check `~/deployment/*.log`, verify `df -h` |
| Port 3000 not listening | Next.js build failed | Check log for ESLint/TypeScript errors |
| LLM server crashes at startup | Model file corrupt or incomplete | Re-download: `wget <MODEL_URL> -O /tmp/models/granite-4.0-micro-Q4_K_M.gguf` |

---

## Key URLs and IDs

| Item | Value |
|------|-------|
| TechZone Collection | https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power |
| Platform ID | `66479c385e3bbb001e089937` |
| GitHub repo | https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos |
| Model (HuggingFace) | https://huggingface.co/ibm-granite/granite-4.0-micro-GGUF |
| Model file | `granite-4.0-micro-Q4_K_M.gguf` |
| Demo URL (post-deploy) | `http://<fqdn>:3000` |
