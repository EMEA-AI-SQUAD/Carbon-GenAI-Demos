# Carbon GenAI Demo on IBM Power

Deploy a fully self-contained AI demo — IBM Granite running on **IBM Power10 or Power11**, no cloud APIs, no watsonx.ai SaaS, no data leaving the client's environment — in under 25 minutes from a fresh TechZone reservation.

## Who this is for

IBM Client Engineering sellers and technical pre-sales engineers who need to show **IBM Granite AI running entirely on IBM Power10 or Power11 infrastructure**, particularly for clients in regulated industries or clients already running IBM Power who want to understand the private AI story. Power10 and Power11 include the Matrix Math Accelerator (MMA) which provides the hardware-level AI acceleration that makes practical LLM inference viable without a GPU.

## The demo

A Carbon Design System web application with **10 use cases across 4 tabs**, all powered by IBM Granite 4.0 Micro running locally via llama.cpp on ppc64le. The generic scenarios are a starting point — the Pre-Sales Demo Builder mode can tailor them to a specific client before deployment.

| Use Case | What it shows |
|----------|--------------|
| 📦 Entity Extraction (customisable) | Structured extraction from unstructured text — defaults to book review, easily tailored to client's domain (e.g. component catalogue, product data) |
| 🌍 Multilingual IT Ops | Translation + priority classification from French/Italian emails |
| 🚚 German Logistics Quote (Hans Geis) | Structured data extraction + calculation — real IBM customer reference |
| 🔒 Fraud Complaint PII | PII detection and redaction across 8 entity types |
| 🛂 Passport Verification | OCR-based identity data extraction (PassportEye) |
| 📄 Document Discovery | Risk classification (HIGH / MEDIUM / LOW) — scenario customisable |
| 📝 Brief Builder | Structured campaign brief from rough notes |
| 📋 RFP Assistant | Proposal framework from an RFP extract — scenario customisable |
| 👔 Talent Acquisition | Job description and candidate summary generation |
| 🎙️ Conversation Intelligence | 3 sub-tabs: sales call analysis, multilingual customer service sentiment, meeting intelligence & action items |

The client story: *your data stays on your Power infrastructure, the model runs on your hardware, there is no external API dependency — and the demo is tailored to your world before you walk in the room.*

## What you get

Installing this collection bundles the following into your workspace:

### Skills
- **deploy-carbon-genai-power** — everything Bob needs to deploy, verify, and troubleshoot the demo on a fresh IBM Power TechZone environment; covers SSH key authentication, the automated 15-step deployment script, service verification, and all known failure modes.

## Architecture

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
llama-server
  └── IBM Granite 4.0 Micro (GGUF Q4_K_M, ~2.5 GB)
       running on IBM Power10 (ppc64le)

PassportEye OCR service (port 5000)
```

No watsonx.ai. No API keys. No external dependencies.

## Get started

### Step 1 — Reserve a TechZone environment (~2 min effort, ~15 min wait)

**Option A — Let Bob reserve automatically (recommended):**

Tell Bob: *"Reserve a TechZone AI-Ready RHEL on IBM Power environment for me. Platform ID: `6a7aba1916c56f06e4b1e910`. Purpose: Test."*

Bob will book the environment via the TechZone MCP and tell you when it's Ready.

**Option B — Reserve manually:**

Go to: **https://techzone.ibm.com/collection/on-premises-power-systems-aix-ibm-i-and-linux-base-images**

Select: **AI-Ready RHEL on IBM Power On-Premises**

Fill in the form: RHEL version (9.6 or 9.8 recommended), Power10, 8 CPUs, 50GB RAM. Once Ready:
- Note the **FQDN** (format: `pvm1-<key>.p<NNNN>.pok-systems.techzone.ibm.com`)
- Download the **private SSH key** (click "User Private SSH Key") — use this key, not the password

> IBM VPN must be active throughout. The `cecc.ihost.com` domain is only reachable on the IBM intranet.

### Step 2 — Tell Bob to deploy

With this collection installed, simply tell Bob:

> *"Deploy the Carbon GenAI demo. My FQDN is `p<NNNN>-pvm1.p<NNNN>.cecc.ihost.com` and my SSH key is at `<path-to-key.pem>`."*

Bob will:
1. Verify SSH connectivity
2. Copy the launcher to the server
3. Start the automated 15-step deployment in the background (~20 min on a clean instance)
4. Monitor progress and report each step
5. Confirm all four services are listening
6. Give you the demo URL

### Step 3 — Open the demo

```
http://<your-fqdn>:3000
```

IBM VPN must be active. The demo runs in any modern browser.

---

## Notes for testers

- Total human effort: ~10 minutes. Total elapsed time: ~40 minutes (mostly waiting for TechZone provisioning and the llama.cpp build).
- The deployment has been validated on two completely fresh RHEL 9.4 / ppc64le TechZone instances.
- If SSH complains about a host key conflict (TechZone reuses FQDNs), run: `ssh-keygen -R <old-fqdn>`
- PassportEye (Passport Verification use case) has a soft-fail wrapper — if it fails, all other 8 demos still work.

---

*Maintained by the EMEA AI on IBM Power Squad.*
*Built with Bob (Roo-Cline AI Assistant).*
