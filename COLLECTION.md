# IBM Power GenAI Demo

Deploy a fully self-contained AI demo — IBM Granite running **on-prem on IBM Power**, no cloud APIs, no watsonx.ai SaaS, no data leaving the client's environment — in under 25 minutes from a fresh TechZone reservation.

## Who this is for

IBM Client Engineering sellers and technical pre-sales engineers who need to show **IBM Granite AI running entirely on IBM Power infrastructure**, particularly for clients in regulated industries or clients already running IBM Power who want to understand the on-prem AI story.

## The demo

A web application with **9 real CE use cases**, all powered by IBM Granite 4.0 Micro running locally via llama.cpp on ppc64le:

| Use Case | What it shows |
|----------|--------------|
| 📦 Component Catalogue Entry | Entity extraction from unstructured product descriptions |
| 🌍 Multilingual IT Ops | Translation + priority classification from French/Italian emails |
| 🚚 German Logistics Quote (Hans Geis) | Structured data extraction + calculation — real IBM customer case study |
| 🔒 Fraud Complaint PII | PII detection and redaction across 8 entity types |
| 🛂 Passport Verification | OCR-based identity data extraction (PassportEye) |
| 📄 Document Discovery | Risk classification (HIGH / MEDIUM / LOW) |
| 📝 Brief Builder | Structured campaign brief from rough notes |
| 📋 RFP Assistant | Proposal framework from an RFP extract |
| 👔 Talent Acquisition | Job description and candidate summary generation |

The client story: *your data stays on your Power infrastructure, the model runs on your hardware, there is no external API dependency.*

## What you get

Installing this collection bundles the following into your workspace:

### Skills
- **deploy-ibm-power-genai** — everything Bob needs to deploy, verify, and troubleshoot the demo on a fresh IBM Power TechZone environment; covers SSH key authentication, the automated 15-step deployment script, service verification, and all known failure modes.

## Architecture

```
Browser (port 3000)
    │
    ▼
Next.js app  (IBM Design System UI)
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

---

## Recommended workflow — using this with the Pre-Sales Demo Builder mode

This demo delivers the most impact when used alongside Bob's **Pre-Sales Demo Builder mode** and a customer intelligence step before deployment. The pattern below takes 30–45 minutes of preparation and meaningfully improves what happens in the room.

### Step 0 — Gather customer intelligence with IBM Consulting Advantage

Before deploying, use [IBM Consulting Advantage](https://w3.ibm.com/#/apps/consulting-advantage) (IBM VPN required) to generate a client intelligence summary:

1. Open ICA and start a new chat
2. Ask it to focus on the customer's country/region context
3. Upload the customer's **annual report** and most recent **earnings or financial presentation** (PDF)
4. Ask: *"Summarise this company's key business priorities, operational challenges, and technology investment themes relevant to an IBM Power / IBM i conversation"*
5. Copy the ICA response — this becomes your tailoring prompt for Bob

This step is valuable because it translates large documents (often 100+ pages) into a focused intelligence brief that Bob can act on directly, without loading raw reports into context.

### Step 0b — Tailor the demo with Bob (Pre-Sales Demo Builder mode)

Switch Bob to **Pre-Sales Demo Builder** mode, then paste your ICA summary and say:

> *"Using this customer intelligence summary, tailor the IBM Power GenAI demo for [customer name]. My audience includes [e.g. Head of Infrastructure, Head of Development, IBM i team]. Keep the real customer reference scenarios (Hans Geis, Mr. Bean passport) as they are — those are useful icebreakers. Update the generic scenarios to reflect this customer's world."*

Bob will:
- Identify which of the 9 demo scenarios are generic (safe to tailor)
- Identify which are anchored to real customers (leave untouched)
- Rewrite the sample data and scenario framing for your customer
- Create a customer-specific branch so `main` stays clean for future engagements
- Update the deployment scripts to deploy from that branch

### Step 1 — Reserve a TechZone environment (~5 min effort, ~20 min wait)

Go to: **https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power**

Select: **RHEL 9 ready for AI on IBM Power10 (IaaS)**

Fill in the reservation form and wait for status **Ready**. Once ready, from the reservation details page:
- Note the **FQDN** (format: `p<NNNN>-pvm1.p<NNNN>.cecc.ihost.com`)
- Download the **private SSH key** (click "User Private SSH Key") — use this key, not the password

> IBM VPN must be active throughout. The `cecc.ihost.com` domain is only reachable on the IBM intranet.

### Step 2 — Tell Bob to deploy

With this collection installed, simply tell Bob:

> *"Deploy the IBM Power GenAI demo. My FQDN is `p<NNNN>-pvm1.p<NNNN>.cecc.ihost.com` and my SSH key is at `<path-to-key.pem>`."*

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
