# IBM Power GenAI Demo

> **A quick-win demo built with Bob (Roo-Cline AI Assistant) to showcase IBM Granite AI running on IBM Power**
>
> This repo lives in **[ibm-power-demos-with-bob](https://github.com/ibm-power-demos-with-bob)** as an example of what you can build by telling Bob what you need. It was originally developed for the [EMEA AI on IBM Power Squad](https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos) and is shared here so others can point at it, use it, and customise it.

[![IBM Power](https://img.shields.io/badge/IBM-Power-blue?logo=ibm)](https://www.ibm.com/power)
[![Carbon Design System](https://img.shields.io/badge/Carbon-Design%20System-161616?logo=ibm)](https://carbondesignsystem.com/)
[![Next.js](https://img.shields.io/badge/Next.js-13-black?logo=next.js)](https://nextjs.org/)
[![IBM Granite](https://img.shields.io/badge/IBM-Granite%204.0-blue?logo=ibm)](https://huggingface.co/ibm-granite)
[![Built with Bob](https://img.shields.io/badge/Built%20with-Bob%20(Roo--Cline)-purple)](https://github.com/RooVetGit/Roo-Cline)

---

## 🎯 What This Is

A web application that demonstrates real-world AI use cases powered by **IBM Granite 4.0 Micro** running locally on **IBM Power (PPC64LE)**. No cloud API keys needed — the model runs entirely on-prem.

### Demos included

| Demo | Use Case | What Granite Does |
|------|----------|-------------------|
| 📚 Book Review Analysis | Content cataloguing | Extract structured entities from English reviews |
| 🌍 Multilingual IT Ops | Helpdesk automation | Translate + prioritise Italian/French support emails |
| 🚚 German Logistics Quote | Real customer scenario (Hans Geis) | Extract data **and** perform pallet calculations |
| 🔒 Fraud Complaint PII | GDPR/CCPA compliance | Extract & redact 8 types of PII, generate redacted text |
| 🛂 Passport Verification | KYC / visitor registration | Parse OCR text into structured identity data |
| 📄 Document Discovery | Legacy GDPR audit | Scan documents, classify risk (HIGH/MEDIUM/LOW), redact |
| 📝 Brief Builder | Marketing campaigns | Convert launch notes → structured campaign briefs |
| 📋 RFP Assistant | Sales / bid teams | Transform RFP requirements → proposal frameworks |
| 👔 Talent Acquisition | Recruitment | Generate job descriptions and candidate summaries |

---

## 🚀 Quick Start — deploy on IBM Power in 3 commands

**Prerequisites:** an IBM Power RHEL 9 environment — grab one free from TechZone (details below).

```bash
curl -O https://raw.githubusercontent.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos/main/deployment/deploy-carbon-genai.sh
chmod +x deploy-carbon-genai.sh
./deploy-carbon-genai.sh
```

The script (~800 lines, fully automated) will:
1. Install system dependencies (Python 3.12, Node.js, GCC, OpenBLAS)
2. Clone this repo and build the Next.js web app
3. Build `llama.cpp` with PPC64LE OpenBLAS optimisation
4. Download **IBM Granite 4.0 Micro** (GGUF, Q4_K_M quantisation) from HuggingFace
5. Start all three servers (LLM on port 8080, proxy on 3001, web app on 3000)

**Estimated time:** ~15–20 minutes | **Access:** `http://<your-server-fqdn>:3000`

---

## 🖥️ TechZone Environment

You need an IBM Power environment before deploying. The easiest way is a free TechZone reservation:

1. Go to [techzone.ibm.com](https://techzone.ibm.com)
2. Search for **"Generative AI demos on IBM Power"**
3. Reserve **"RHEL 9 ready for AI on IBM Power10 (IaaS)"**
4. Wait ~15–30 minutes for provisioning
5. SSH in and run the 3-command deployment above

> ⚠️ Fill the TechZone reservation form slowly — wait 2–3 seconds between fields to avoid UI glitches.

Full details in [`deployment/TECHZONE_RESERVATION_GUIDE.md`](deployment/TECHZONE_RESERVATION_GUIDE.md).

---

## 🏗️ Architecture

```
Browser (Carbon Design UI, port 3000)
    │
    ▼
Next.js App Server  ──────────────────────────┐
    │                                         │
    ▼ API calls (port 3001)                   │
Node.js Proxy Server (CORS + routing)         │
    │                                         │
    ▼ OpenAI-compatible API (port 8080)       │
llama.cpp Server                              │
  └─ IBM Granite 4.0 Micro (GGUF)            │
     Running on IBM Power (PPC64LE) ──────────┘
```

---

## 📁 Repo Structure

```
Carbon-GenAI-Demos/
├── carbon-ui/                  # Next.js + Carbon Design System app
│   └── src/app/
│       ├── entextract/         # Entity extraction demos (3 tabs)
│       ├── piiextract/         # PII extraction demos (3 tabs)
│       ├── briefbuilder/       # Campaign brief generation
│       ├── rfpassistant/       # RFP response assistant
│       ├── talentacquisition/  # Hiring content generation
│       ├── home/               # Landing page
│       └── llama-proxy/        # Node.js proxy server
├── deployment/                 # Deployment automation
│   ├── deploy-carbon-genai.sh  # Main script (one-command deploy)
│   ├── stop-server.sh
│   ├── check-status.sh
│   ├── update-all-fqdns.sh     # Update endpoints for a new environment
│   └── README.md
└── README.md                   # This file
```

---

## ⚙️ Management Commands

```bash
# Check everything is running
./deployment/check-status.sh

# Stop all servers
./deployment/stop-server.sh

# Update API endpoints after re-provisioning a TechZone environment
./deployment/update-all-fqdns.sh <new-fqdn>
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 13, Carbon Design System (`@carbon/react`), Sass |
| Proxy | Node.js + Express (CORS, request routing) |
| LLM Inference | llama.cpp with OpenBLAS (PPC64LE optimised) |
| Model | IBM Granite 4.0 Micro — GGUF Q4_K_M |
| OS / Arch | RHEL 9 on IBM Power (PPC64LE) |

---

## 🤖 About This Demo and "Built with Bob"

This demo was built through collaboration between the **EMEA AI on IBM Power Squad** and **Bob (Roo-Cline AI Assistant)**:

- **David Spurway (Squad Lead)** — vision, requirements, architecture, testing
- **Henrik Mader** — Node.js proxy server and API integration
- **Rinah-Jayne Nuamah** — IT Ops demo foundation and user testing
- **Bob (Roo-Cline)** — Next.js app, deployment script, documentation, prompts

It is shared here in `ibm-power-demos-with-bob` as a **reference example** — something others can point at, run, and customise. The longer-term plan for this organisation is to host demos that are fully _recipe-driven_: you describe what you need to Bob using the Pre-Sales Demo Builder mode, and Bob builds the whole thing using structured skills targeting IBM Power capabilities.

This demo was built before those skills and mode existed, but it shows the end result and deployment pipeline clearly. The tailoring workflow (ICA → Bob → customer branch) is now part of the recipe and documented in `COLLECTION.md`.

---

## 🔗 Related Links

- [Original EMEA AI Squad repo](https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos)
- [IBM Granite models on HuggingFace](https://huggingface.co/ibm-granite)
- [Carbon Design System](https://carbondesignsystem.com/)
- [TechZone — Generative AI on IBM Power collection](https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power)
- [Hans Geis logistics IBM case study](https://www.ibm.com/downloads/documents/us-en/1443d5dc5ecf4367)
- [Roo-Cline / Bob](https://github.com/RooVetGit/Roo-Cline)

---

## 📄 Licence

Provided as-is for demonstration purposes.
- Carbon Design System: Apache 2.0
- llama.cpp: MIT
- IBM Granite models: [IBM Granite Licence](https://huggingface.co/ibm-granite)

---

*Built by the EMEA AI on IBM Power Squad with Bob (Roo-Cline AI Assistant)*
