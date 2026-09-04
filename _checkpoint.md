# Checkpoint — Carbon GenAI IBM Power Recipe

> Last updated: 2026-09-04

---

## Status

**The recipe is complete and validated. Waiting for handoff test feedback from Florian's CE team before opening the PR to the CE Marketplace.**

---

## What has been done

| Session | Key output |
|---|---|
| Jul 2026 | First end-to-end deployment validated on RHEL 9.4, p1279 environment (19m 14s) |
| Aug 2026 | v1 TechZone platform found disabled. RECIPE.md created. Barry doc started. |
| Aug 2026 | Full gap analysis vs. new Bob Recipe Template (published 2026-08-15). Recipe brief (`01-Carbon-GenAI-IBM-Power.md`) written — all 10 use cases, PROMPT #0–#3, demo script, sample inputs, known issues. All docs updated for v2 platform. |
| Sep 2026 | v2 TechZone platform (`6a7aba1916c56f06e4b1e910`) validated. RHEL 10.2 full deployment confirmed (38m 2s clean). All 4 services running. Granite 4.0 Micro LLM verified. Username handling fixed (`cecuser` → per-reservation). Barry doc updated. TechZone bug report drafted. Everything committed (`d639457`). |

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
| Last test environment | `pvm1-13218m1k.p1298.pok-systems.techzone.ibm.com` (expired 2026-09-05) |
| MCP bug report | `6a9ab558f920404955f890a1`, `6a9ab864c1a0571dc9285fd4` — `userVariables` not passed |

---

## Next steps

1. **Wait for Florian's handoff test result**
   - Pass: open PR to `ClientEngineering/bob`
   - Fail: fix the reported gap, re-test, then PR

2. **Send TechZone bug report** — copy [`TECHZONE-BUG-REPORT.md`](TECHZONE-BUG-REPORT.md) to `techzone.help@ibm.com`

3. **Open the PR** — target: `ClientEngineering/bob` → `Recipes/Carbon-GenAI-IBM-Power/`
   - `01-Carbon-GenAI-IBM-Power.md` (renamed or kept as-is per marketplace convention)
   - `README.md` (content from `RECIPE-README.md`)

---

## Starting a new task

Paste this into the first message:

```
We are working on the Carbon GenAI IBM Power recipe for the CE Marketplace.
Read _checkpoint.md for full context.

Current status: recipe complete and validated on RHEL 10.2 (38 min clean deploy, all 4 services, Granite LLM confirmed). Waiting for handoff test feedback from Florian's CE team. When that comes back, the next step is opening a PR to ClientEngineering/bob.

[Paste any feedback from Florian here, or describe what you need to do next.]
```
