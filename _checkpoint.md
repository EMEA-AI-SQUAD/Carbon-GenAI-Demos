# Checkpoint — Carbon GenAI IBM Power Recipe

> Last updated: 2026-09-10

---

## Status

**CE Marketplace PR submitted. Both demos live on TechZone. Ready for tomorrow's call.**

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

1. **Before Thursday** — deploy is running on the Denmark VM. Once complete (~38 min from start),
   push the Danish-tailored files and rebuild. You are currently on the `denmark-2026` local branch.
   Run these scp commands from the repo root:
   ```
   KEY="C:\Users\029878866\Downloads\techzone-power-key-denmark.pem"
   HOST="UY32QEF@pvm1-fso8l13k.p651.pok-systems.techzone.ibm.com"
   BASE="carbon-ui/src/app"
   scp -i "$KEY" $BASE/entextract/defaults.js         "$HOST:~/Carbon-GenAI-Demos/$BASE/entextract/defaults.js"
   scp -i "$KEY" $BASE/entextract/it-ops-emails.js    "$HOST:~/Carbon-GenAI-Demos/$BASE/entextract/it-ops-emails.js"
   scp -i "$KEY" $BASE/entextract/logistics-quote.js  "$HOST:~/Carbon-GenAI-Demos/$BASE/entextract/logistics-quote.js"
   scp -i "$KEY" $BASE/convintel/defaults.js           "$HOST:~/Carbon-GenAI-Demos/$BASE/convintel/defaults.js"
   scp -i "$KEY" $BASE/home/page.js                    "$HOST:~/Carbon-GenAI-Demos/$BASE/home/page.js"
   ssh -i "$KEY" "$HOST" "cd ~/Carbon-GenAI-Demos/carbon-ui && yarn build && pm2 restart nextjs-app"
   ```
   Demo at: `http://pvm1-fso8l13k.p651.pok-systems.techzone.ibm.com:3000` (IBM VPN required)

2. **After Thursday** — return local working copy to the generic demo:
   ```
   git checkout main
   ```
   The `denmark-2026` branch is preserved locally. See [`TAILORING.md`](TAILORING.md) for the full pattern.

3. **CE Marketplace PR** — awaiting review: `github.ibm.com/ClientEngineering/bob/pull/231`

4. **Send TechZone bug report** (optional / when time allows) — copy [`TECHZONE-BUG-REPORT.md`](TECHZONE-BUG-REPORT.md) to `techzone.help@ibm.com`

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
We are working on the Carbon GenAI IBM Power recipe for the CE Marketplace.
Read _checkpoint.md for full context.

Current status: Denmark VM deploying — pvm1-fso8l13k.p651.pok-systems.techzone.ibm.com (UY32QEF, RHEL 10.2,
key at C:\Users\029878866\Downloads\techzone-power-key-denmark.pem). Danish tailoring on local branch
denmark-2026 (not pushed). After Thursday run: git checkout main. CE Marketplace PR open at
github.ibm.com/ClientEngineering/bob/pull/231. IBM VPN required.
```
