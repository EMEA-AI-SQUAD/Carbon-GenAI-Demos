# From Demo to Recipe — Carbon GenAI on IBM Power

> This document captures the journey of turning the Carbon GenAI Demos project into a
> Client Engineering Bob Marketplace recipe. It is a living record — written as decisions
> are made, constraints discovered, and steps completed — so the rationale is preserved
> for anyone who picks this up later.

---

## What We Are Building

A **Bob Marketplace recipe** that lets a seller or CE deploy the Carbon GenAI demo to a
fresh IBM Power TechZone environment with minimal manual steps. The end state is:

- A seller opens Bob, activates the recipe collection, describes the client context
- Bob guides them through the one manual step (TechZone reservation)
- Bob then drives the full deployment over SSH
- The demo is live at `http://<fqdn>:3000` in ~20 minutes

---

## Why This Demo, Why IBM Power

The demo was built to show IBM Granite AI running **entirely on-prem on IBM Power (PPC64LE)** —
no cloud API keys, no watsonx.ai SaaS, no data leaving the client's environment. This is a
deliberate and important differentiation for certain client conversations, particularly in
regulated industries and clients already running IBM Power infrastructure.

The demos included cover real CE use cases:
- Entity extraction (multilingual, logistics, book cataloguing)
- PII extraction and redaction (GDPR/CCPA compliance)
- Passport / KYC verification via OCR
- Document discovery and risk classification
- Brief Builder, RFP Assistant, Talent Acquisition

---

## Key Constraints and Decisions

### 1. watsonx.ai is not used — and that is intentional

The CE marketplace recipes generally assume watsonx.ai as the LLM backend. This recipe
deliberately does not. IBM Granite 4.0 Micro runs via **llama.cpp** on the IBM Power
hardware itself, exposed as an OpenAI-compatible API on port 8080.

This is a feature, not a gap. The story for the client is: *your data stays on your
Power infrastructure, the model runs on your hardware, and there is no external API
dependency.*

### 2. TechZone v1 — automated reservation is not possible today

The TechZone collection used (`Generative AI demos on IBM Power`, platform ID
`66479c385e3bbb001e089937`) is a **v1 TechZone environment**. The Bob TechZone MCP
only supports v2 API collections. This means Bob cannot make the reservation on the
seller's behalf.

**Decision:** The manual reservation step is explicitly documented and kept short
(~5 minutes of actual effort, ~15–30 minutes of provisioning wait). The recipe's
instructions make this the one human gate, with everything else automated by Bob.

This constraint should be revisited when / if this collection is migrated to v2.

### 3. SSH key authentication is required for Bob to drive deployment

The TechZone environment provides a password that contains special characters (`!`)
which are not reliably passable to SSH tools in automated pipelines on Windows.
The TechZone UI provides a **private SSH key download** on the reservation details page.

**Decision:** The recipe instructs the seller to download the private key from TechZone
and provide the path to Bob. Bob then uses `ssh -i <keyfile>` for all remote operations.
Password-based SSH is not used in the automated path.

---

## How the Recipe Works (Seller Experience)

1. **Seller activates** the Carbon GenAI IBM Power collection in Bob
2. **Seller goes to TechZone** — Bob provides the direct link and exact environment name
3. **Seller reserves** `RHEL 9 ready for AI on IBM Power10 (IaaS)` manually (~5 min form)
4. **Seller waits** for provisioning (~15–30 min — Bob can be doing other things)
5. **Seller provides** the FQDN and the downloaded private SSH key path to Bob
6. **Bob connects** via SSH and runs the deployment script remotely
7. **Bob monitors** progress and reports when the demo is live
8. **Seller opens** `http://<fqdn>:3000` — demo is running

Total human effort: ~15 minutes. Total elapsed time: ~35–50 minutes (mostly waiting).

---

## Architecture of the Deployed Demo

```
Browser (port 3000)
    │
    ▼
Next.js app  (Carbon Design System UI)
    │
    ▼ port 3001
Node.js proxy  (CORS + routing)
    │
    ▼ port 8080  (OpenAI-compatible API)
llama.cpp server
  └── IBM Granite 4.0 Micro (GGUF Q4_K_M)
       running on IBM Power (PPC64LE)
```

All four services start automatically via the deployment script. The proxy exists to
handle CORS between the Next.js frontend and the llama.cpp server.

---

## Technical Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 13 + Carbon Design System | `@carbon/react` |
| Proxy | Node.js + Express | CORS, request routing |
| LLM inference | llama.cpp with OpenBLAS | PPC64LE optimised |
| Model | IBM Granite 4.0 Micro (GGUF Q4_K_M) | ~2.5GB download from HuggingFace |
| OS | RHEL 9 on IBM Power10 (PPC64LE) | TechZone IaaS |

---

## What Bob Builds as a Recipe

Three Bob marketplace assets:

### 1. Deployment Skill (`deploy-carbon-genai-power`)
Encodes everything Bob needs to know about this specific deployment:
- TechZone environment spec and reservation URL
- SSH key authentication requirement
- Three-server architecture (ports 8080, 3001, 3000)
- Deployment script location and what it does
- FQDN update procedure for re-deployments
- How to verify the deployment is healthy
- Common failure modes and recovery steps

### 2. Pre-Sales Demo Mode (extends Pre-Sales Demo Builder)
A seller-facing persona that:
- Knows the IBM Power + Granite story
- Can narrate each demo use case for a client audience
- Knows how to guide deployment from scratch
- Understands when this demo is the right fit vs. watsonx.ai SaaS

### 3. Collection (`carbon-genai-ibm-power`)
Bundles the skill + mode into a single installable unit with a README that
is the "one page" a seller reads to understand what they are deploying and why.

---

## Deployment Log — First Recipe Run

| Date | Event |
|------|-------|
| 2026-07-09 | TechZone reservation created (Reservation ID: `6a4f7c6b5fea99009e6ed683`) |
| 2026-07-09 | Environment: `p1294-pvm1.p1294.cecc.ihost.com` (RHEL 9.4, ppc64le, 123GB RAM, 43GB free disk) |
| 2026-07-09 | SSH key authentication confirmed working via `ssh -i <pem>` |
| 2026-07-09 | PuTTY registry corruption issue discovered and resolved (corrupt dummy key from automation attempts) |
| 2026-07-09 | **Build failure 1:** RHEL 9 AppStream provides Node 16 by default; Express 5 requires ≥18. Fix: `dnf module enable nodejs:20`. NodeSource does not support ppc64le. |
| 2026-07-09 | **Build failure 2:** `http-proxy-middleware@4.x` requires Node ≥22; `openai@5.x` and `typescript@7.x` similarly too new. Fix: pin to `http-proxy-middleware@^2.0.7`, `openai@^4.104.0`, `typescript@^5.8.3`, `express@^4.21.2` in deploy script. |
| 2026-07-09 | **Build failure 3:** `tsconfig.json` contained `"ignoreDeprecations": "6.0"` — only valid in TypeScript 6+. Fix: remove that line. |
| 2026-07-09 | Next.js build **succeeded** — all 9 routes compiled cleanly |
| 2026-07-09 | FQDN configured across all 8 files via `update-all-fqdns.sh` |
| 2026-07-09 | Proxy server (port 3001) confirmed running |
| 2026-07-09 | **Paused here** — Next.js web app, llama.cpp build, Granite model download, PassportEye still to complete |
| 2026-07-09 | All fixes committed and pushed to GitHub (commits: `a0dc915`, `2322333`, `b99cceb`) |

---

## Open Items

- [ ] Complete first end-to-end deployment on this environment
- [ ] Validate all 9 demo use cases work on fresh RHEL 9.4 / ppc64le
- [ ] Write `deploy-carbon-genai-power` SKILL.md
- [ ] Write seller mode persona
- [ ] Write collection README
- [ ] Determine correct marketplace repo target (EMEA or default CE marketplace)
- [ ] Decide whether to keep EMEA-AI-SQUAD repo or migrate to `ibm-power-demos-with-bob`
- [ ] Revisit v2 TechZone migration when/if the collection is upgraded

---

*This document is maintained by the EMEA AI on IBM Power Squad.*
*Built with Bob (Roo-Cline AI Assistant).*

---

## Handoff Test Checklist

This checklist is for the team member doing the first full test. Work through it in order.
If anything fails, note it in the **Deployment Log** section below and open a GitHub issue.

### Phase 1 — Environment

> **Note on FQDNs:** Every TechZone reservation gets a unique FQDN. The one used during
> initial development (`p1294-pvm1.p1294.cecc.ihost.com`) is tied to a reservation that
> will expire and be deleted. **You need your own reservation and your own FQDN.**
> FQDNs are sometimes reused across reservations — if SSH complains about a host key
> conflict, clear the stale entry first:
> ```powershell
> ssh-keygen -R <old-fqdn>
> # and if you have PuTTY installed:
> Remove-ItemProperty 'HKCU:\Software\SimonTatham\PuTTY\SshHostKeys' -Name "ssh-ed25519@22:<old-fqdn>"
> ```

- [ ] New TechZone reservation created at [techzone.ibm.com/collection/generative-ai-demos-on-ibm-power](https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power)
- [ ] Environment selected: **RHEL 9 ready for AI on IBM Power10 (IaaS)**
- [ ] Reservation form filled slowly (2–3 seconds between fields to avoid "Checking availability" hang)
- [ ] Environment status is **Ready** (provisioning takes ~15–30 minutes)
- [ ] FQDN noted from reservation details page (format: `p<NNNN>-pvm1.p<NNNN>.cecc.ihost.com`)
- [ ] Private SSH key downloaded from reservation details page ("User Private SSH Key" button) — **do not use the password, use the key**
- [ ] SSH connectivity confirmed: `ssh -i <keyfile> cecuser@<your-fqdn> "uname -m"` returns `ppc64le`
      *(username is always `cecuser` on CE TechZone environments — the password changes per reservation but is not needed)*
- [ ] Disk space ≥ 10GB free: `df -h /`
- [ ] RAM ≥ 4GB: `free -h`

### Phase 2 — Deployment

- [ ] Deployment script staged and launched in background (see skill for exact commands)
- [ ] Log confirms all 16 steps completed with no ERRORs: `tail ~/deployment/deploy-live.log`
- [ ] All four ports listening:
  - [ ] `:8080` — llama-server (LLM)
  - [ ] `:3001` — Node.js proxy
  - [ ] `:3000` — Next.js web app
  - [ ] `:5000` — PassportEye OCR

### Phase 3 — Demo Use Cases

Open `http://<fqdn>:3000` in a browser and test each use case. For each one: submit a
sample input and confirm you get a structured AI response back (not an error or spinner
that never resolves).

**Entity Extraction tab:**
- [ ] 📚 Book Review Analysis — paste a short book review, confirm entities extracted
- [ ] 🌍 Multilingual IT Ops — paste an Italian or French support email, confirm translation + priority
- [ ] 🚚 German Logistics Quote — paste the Hans Geis sample text, confirm data + pallet calculation

**PII Extraction tab:**
- [ ] 🔒 Fraud Complaint PII — paste a complaint with name/address/card number, confirm 8 PII types detected and redacted text generated
- [ ] 🛂 Passport Verification — use the sample OCR text, confirm structured identity data returned
- [ ] 📄 Document Discovery — upload or paste a document, confirm risk classification (HIGH/MEDIUM/LOW)

**Other demos:**
- [ ] 📝 Brief Builder — paste campaign launch notes, confirm structured brief generated
- [ ] 📋 RFP Assistant — paste an RFP extract, confirm proposal framework generated
- [ ] 👔 Talent Acquisition — enter a job title/description, confirm job description and candidate summary

### Phase 4 — Recipe Assets

- [ ] [`RECIPE-JOURNEY.md`](RECIPE-JOURNEY.md) — readable and accurate
- [ ] [`.bob/skills/deploy-carbon-genai-power.md`](.bob/skills/deploy-carbon-genai-power.md) — skill loads correctly in Bob (`use_skill`)
- [ ] Deployment skill instructions match actual experience — note any gaps

### Phase 5 — Sign-off

- [ ] All 9 demo use cases pass
- [ ] No errors in deployment log
- [ ] Recipe journey document updated with test results and tester name
- [ ] Ready for marketplace submission

---

