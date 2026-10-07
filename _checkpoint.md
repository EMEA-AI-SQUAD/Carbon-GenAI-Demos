# Checkpoint — Carbon GenAI IBM Power Recipe

> Last updated: 2026-10-07

---

## Status

**TechXChange Lab 1127 Spyre toggle working end-to-end. Both CPU and Spyre backends live on mma-bench (150). Deployment script (`remote-deploy.sh`) updated and pushed.**

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
| Oct 2026 (7th) | TechXChange Lab 1127 Spyre toggle implemented. All 6 demo pages migrated from hardcoded port 3001 (OpenAI SDK) to `/api/chat` route. `SpyreContext` + `Toggle` added to Header. Model set to `ibm-granite/granite-4.1-8b-fp8`. ncat forwarder on 146:8001 → container 10.89.0.55:8000. `ecosystem.config.js` paths made dynamic via `WORK_DIR` env var. `remote-deploy.sh` rewritten: Node PATH fix (checks `/usr/local/node/bin` first), uses ecosystem.config.js for pm2 start, correct SPYRE_URL. All committed to `feature/lab1127-techxchange` (`ca77683`). Demo live and verified at `http://9.8.70.150:3000`. |

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

## Lab 1127 server reference

| Server | Hostname | IP | Role |
|---|---|---|---|
| mma-bench | p11-mma-rhel (150) | `9.8.70.150` | Next.js demo + llama.cpp CPU LLM |
| p11-mma-rhel (146) | p11-mma-rhel | `9.8.70.146` | Spyre cards + vLLM containers |

**Spyre container:** `llm-aa67fe1b75-llm` — `granite-4.1-8b-fp8` at `10.89.0.55:8000` (internal pod network)
**ncat forwarder** (must be running on 146): `nohup ncat -l 0.0.0.0 8001 --keep-open --sh-exec "ncat 10.89.0.55 8000" > /tmp/ncat-spyre.log 2>&1 &`
**Demo URL:** `http://9.8.70.150:3000`
**App location on 150:** `/data/Carbon-GenAI-Demos/carbon-ui`

---

## Next steps

1. **Make ncat forwarder permanent on 146** (before lab day — survives reboots):
   ```bash
   cat > /etc/systemd/system/spyre-proxy.service << 'EOF'
   [Unit]
   Description=ncat proxy: host:8001 → granite-4.1-8b-fp8 container
   After=network.target
   [Service]
   ExecStart=/usr/bin/ncat -l 0.0.0.0 8001 --keep-open --sh-exec "ncat 10.89.0.55 8000"
   Restart=always
   RestartSec=3
   [Install]
   WantedBy=multi-user.target
   EOF
   systemctl daemon-reload && systemctl enable --now spyre-proxy
   ```

2. **Run `pm2 save` on 150** after confirming all three processes are healthy, so they survive a reboot.

3. **CE Marketplace PR** — awaiting review: `github.ibm.com/ClientEngineering/bob/pull/231`

4. **Send TechZone bug report** (optional / when time allows) — copy [`TECHZONE-BUG-REPORT.md`](TECHZONE-BUG-REPORT.md) to `techzone.help@ibm.com`

---

## Branch state

| Branch | State | Purpose |
|---|---|---|
| `main` | Clean, in sync with GitHub | Generic reusable demo |
| `feature/lab1127-techxchange` | Active — created 2026-10-06 | TechXChange Lab 1127 — LPAR deploy + Spyre toggle |
| `feature/dgpci-romania` | Pushed — awaiting Romanian team feedback | DGPCI Romania / RAR demo |
| `denmark-2026` | Local only, never push | Danish tailoring for Thursday session |

---

## Starting a new task

Paste this into the first message:

```
We are working on the Carbon GenAI IBM Power demo / TechXChange Lab 1127.
Read _checkpoint.md for full context.

Current status: Spyre toggle working end-to-end on mma-bench (9.8.70.150).
Branch: feature/lab1127-techxchange (latest commit ca77683).
App lives at /data/Carbon-GenAI-Demos/carbon-ui on 150.
Spyre vLLM (granite-4.1-8b-fp8) on 146, reachable via ncat forwarder on 9.8.70.146:8001.
Still to do: make ncat forwarder a systemd unit on 146; run pm2 save on 150.
CE Marketplace PR open at github.ibm.com/ClientEngineering/bob/pull/231.
```
