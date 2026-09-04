---
name: deploy-carbon-genai-power
description: >
  Everything Bob needs to know to deploy, verify, and troubleshoot the
  Carbon GenAI demo on a fresh IBM Power TechZone environment. Covers
  the one manual step (TechZone reservation), SSH key authentication,
  the automated deployment script, service verification, and all known
  failure modes discovered during recipe development.
version: 1.0.0
author: EMEA AI on IBM Power Squad
---

# Skill: Deploy Carbon GenAI Demo on IBM Power

## What This Deploys

A four-service stack running entirely on IBM Power (ppc64le), no cloud
APIs, no watsonx.ai SaaS â€” Granite 4.0 Micro runs on the hardware itself:

```
Browser (port 3000)
    â”‚
    â–¼
Next.js app  (Carbon Design System UI - 10 demo use cases)
    â”‚
    â–¼ port 3001
Node.js proxy  (CORS + routing)
    â”‚
    â–¼ port 8080  (OpenAI-compatible API)
llama-server
  â””â”€â”€ IBM Granite 4.0 Micro (GGUF Q4_K_M, ~2.5 GB)
       running on IBM Power10 (ppc64le)

PassportEye OCR service (port 5000) â€” for passport verification demo
```

The client story: *your data stays on your Power infrastructure, the
model runs on your hardware, there is no external API dependency.*

---

## Step 1 — Reserve a TechZone Environment (~15 minutes total)

**Bob can reserve this automatically.** The environment uses platform `6a7aba1916c56f06e4b1e910`
("AI-Ready RHEL on IBM Power On-Premises") with the v2 `base-onpremise-powervc-vm` provisioner.

**Option A — Automated (recommended):**

Use the TechZone MCP to reserve:
```
Reserve a TechZone IBM Power environment for the Carbon GenAI demo.
Platform ID: 6a7aba1916c56f06e4b1e910
Purpose: Test
Start: now
```

Bob will call `techzone-create-request` and monitor until Ready. Once Ready, read the
FQDN and SSH key from the reservation output and proceed to Step 2.

**Option B — Manual:**

1. Go to: https://techzone.ibm.com/collection/on-premises-power-systems-aix-ibm-i-and-linux-base-images
2. Select: **AI-Ready RHEL on IBM Power On-Premises**
3. RHEL version: **RHEL 9.6** or **9.8** · Power architecture: **Power10** · 8 CPUs · 50GB RAM
4. Purpose: **Test** (12h max) or **Demo** (needs opportunity code)
5. Wait for status **Ready** (~15 minutes)

Once ready, from the reservation details page collect:
- **FQDN** — format: `pvm1-<key>.p<NNNN>.pok-systems.techzone.ibm.com`
- **Private SSH key** — click "User Private SSH Key" to download the `.pem` file

> **Note on FQDNs:** TechZone sometimes reuses FQDNs across reservations.
> If SSH complains about a host key conflict, clear the stale entry:
> ```powershell
> ssh-keygen -R <old-fqdn>
> ```

---

## Step 2 â€” Verify SSH Connectivity

Ask the seller to confirm with:

```powershell
ssh -i "<path-to-key.pem>" -o StrictHostKeyChecking=no <username>@<fqdn> "uname -m"
```

Expected response: `ppc64le`

The OS username is shown on the TechZone reservation details page as "OS User Name". On v2 environments it is generated per-reservation (e.g. `U5PYAWA`), not the fixed `cecuser` used by v1 environments. Always copy it from the reservation page.
IBM VPN must be active — `pok-systems.techzone.ibm.com` hosts (v2) are not reachable from the public internet.

Minimum environment requirements:
- Architecture: `ppc64le` (IBM Power)
- OS: RHEL 9.x or RHEL 10.2 (v2 default is RHEL 10.2)
- Free disk: â‰¥ 10 GB (`df -h /`)
- RAM: â‰¥ 4 GB free (`free -h`) â€” 123 GB is typical on these reservations

---

## Step 3 â€” Run the Deployment Script

The deployment is fully automated from this point. Bob drives it over SSH.

### Stage the launcher and start the deployment

```powershell
# Copy the launcher to the server
scp -i "<key.pem>" deployment/remote-launch.sh <username>@<fqdn>:/home/cecuser/remote-launch.sh

# Launch â€” this starts the deploy in the background and returns immediately
ssh -i "<key.pem>" -o StrictHostKeyChecking=no <username>@<fqdn> "bash ~/remote-launch.sh"
```

The launcher:
- Kills any prior deploy process
- Removes any existing `~/Carbon-GenAI-Demos` clone
- Clones fresh from `https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos`
- Starts `deploy-carbon-genai.sh` under `nohup` with output to `~/deployment/deploy-live.log`
- Returns the PID immediately

### Monitor progress

Tail the live log to show the seller what is happening:

```powershell
ssh -i "<key.pem>" -o StrictHostKeyChecking=no <username>@<fqdn> "tail -30 ~/deployment/deploy-live.log"
```

Call this every 30â€“60 seconds. The 15 steps and their expected durations:

| Step | Description | Typical duration |
|------|-------------|-----------------|
| 1 | Pre-flight checks | < 10s |
| 2 | System update (`dnf -y update`) | 3â€“8 min |
| 3 | Install system dependencies | 1â€“3 min |
| 4 | Python virtual environment | < 30s |
| 5 | Clone repository | < 30s |
| 6 | Node.js dependencies (yarn install) | 3â€“5 min |
| 7 | Next.js build (`yarn build`) | ~60s |
| 8 | Configure proxy + FQDN substitution | < 10s |
| 9 | LLM Python environment + PyTorch | 2â€“4 min |
| 10 | Build llama.cpp from source | 15â€“20 min |
| 11 | Download Granite 4.0 Micro model (~2.5 GB) | 5â€“10 min |
| 12 | Start llama-server (port 8080) | < 15s |
| 13 | Install + start PassportEye (port 5000) | 1â€“2 min |
| 14 | Start Node.js proxy (port 3001) | < 10s |
| 15 | Start Next.js production server (port 3000) | < 10s |

**Total on a clean instance:** ~35â€“50 minutes
**Total on re-run (cached packages, model, llama.cpp):** ~5 minutes

---

## Step 4 â€” Verify All Services Are Running

```powershell
ssh -i "<key.pem>" -o StrictHostKeyChecking=no <username>@<fqdn> "ss -tlnp | grep -E ':(3000|3001|5000|8080)'"
```

Expected output â€” all four ports listening:
```
LISTEN  0.0.0.0:5000   python3    (PassportEye)
LISTEN  0.0.0.0:8080   llama-server
LISTEN  0.0.0.0:3001   node       (proxy)
LISTEN  *:3000         node       (Next.js)
```

If any port is missing, check the deployment log:
```powershell
ssh -i "<key.pem>" -o StrictHostKeyChecking=no <username>@<fqdn> "grep -E 'ERROR|STEP' ~/deployment/deploy-live.log"
```

---

## Step 5 â€” Open the Demo

```
http://<fqdn>:3000
```

IBM VPN must be active. The demo runs in any modern browser.

---

## Known Failure Modes and Fixes

### LLM calls fail in browser with `ERR_NAME_NOT_RESOLVED` or `Connection error`
**Cause:** historic bug â€” old FQDN was hardcoded in source files and baked
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

### Node.js version too old â€” Express/package version errors
**Cause:** RHEL 9 AppStream defaults to Node 16. NodeSource does not
support ppc64le.
**Fix:** the script uses `dnf module enable nodejs:20` then
`dnf install nodejs`. This is already in the current deploy script.
Never use NodeSource on ppc64le.

### `configure_proxy` does not run / FQDN not substituted
**Cause:** historic bug â€” `configure_proxy()` was nested inside
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
If missing, re-run the deployment script â€” it will skip all already-complete
steps and only re-download the model.

### SSH connection times out before reaching the server
**Cause:** IBM VPN not active. The `cecc.ihost.com` domain is only
reachable on the IBM intranet.
**Fix:** connect to IBM VPN, then retry.

### PassportEye setup fails
**Cause:** `tesseract` may not be available in RHEL 9 AppStream for
ppc64le, or pip dependencies may fail to build.
**Status:** PassportEye setup has a soft-fail wrapper in the main script
â€” if it fails, the rest of the deployment continues. The Passport
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

## Repository and Architecture Notes

**Two GitHub remotes are kept in sync â€” always push to both:**
- `origin` â€” `https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos`
- `power-demos` â€” `https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos`

The deploy script clones from `ibm-power-demos-with-bob`. If fixes are
committed only to `EMEA-AI-SQUAD`, the deployed code will be stale.

**Key ppc64le constraints:**
- NodeSource does not support ppc64le â€” use `dnf module enable nodejs:20`
- PyTorch and OpenBLAS must come from IBM's wheels repo:
  `https://wheels.developerfirst.ibm.com/ppc64le/linux`
- llama.cpp must be built from source â€” no ppc64le binary releases
- All npm package versions are pinned for Node 20 compatibility;
  `http-proxy-middleware`, `openai`, and `express` all have recent
  major versions that require Node â‰¥22

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
| Entity Extraction | ðŸ“š Book Review Analysis | Short book review text |
| Entity Extraction | ðŸŒ Multilingual IT Ops | Italian or French support email |
| Entity Extraction | ðŸšš German Logistics Quote | Hans Geis sample logistics text |
| PII Extraction | ðŸ”’ Fraud Complaint | Text with name/address/card number |
| PII Extraction | ðŸ›‚ Passport Verification | Sample passport MRZ text |
| PII Extraction | ðŸ“„ Document Discovery | Any document text |
| Other | ðŸ“ Brief Builder | Campaign launch notes |
| Other | ðŸ“‹ RFP Assistant | RFP extract |
| Other | ðŸ‘” Talent Acquisition | Job title and description |

A healthy response is structured JSON or formatted text returned within
~5â€“15 seconds. A spinner that never resolves indicates the llama-server
is not running or the proxy is misconfigured.



