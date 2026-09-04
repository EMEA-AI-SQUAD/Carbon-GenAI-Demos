# A New Way to Go to Customers
## IBM Power · Pre-Sales Demo Innovation · July 2025

---

### The challenge

Shannon's team has an increased target. Traditional approaches — generic product presentations, standard demos, reactive responses to RFPs — are not enough to differentiate IBM in a competitive market. We need to show up differently: faster, more relevant, and more credible than the competition from the first conversation.

---

### What we did — for one customer, in one day

For a scheduled meeting with **Premier Farnell** (part of Avnet, the $22B global electronics distributor), we built a fully tailored, live AI demo running on IBM Power — in a single working session.

**Step 1 — Customer intelligence (IBM Consulting Advantage)**
We uploaded Farnell's annual report and earnings presentation to IBM Consulting Advantage. ICA analysed their business priorities, financial pressures, and technology concerns — cyber resilience, operational continuity, AI readiness — and produced a focused intelligence brief in minutes rather than days.

**Step 2 — Demo tailoring (Bob — Pre-Sales Demo Builder)**
We took an existing IBM Power GenAI demo and, using Bob in Pre-Sales Demo Builder mode, replaced every generic scenario with one from Farnell's world:
- A Farnell component catalogue entry being processed by AI
- A panicked Italian warehouse manager with 300 orders blocked
- A French engineer raising a temperature alert for lithium-ion component storage in Lyon
- A Farnell GDPR data migration memo covering 2.4 million customer records
- An IBM RFP for Farnell's own e-commerce platform modernisation
- A job description for a Senior IBM i Developer working on Orbit

All of this was done on a customer-specific Git branch — the generic demo on `main` is untouched and reusable for the next customer.

**Step 3 — Deployment (Bob + TechZone)**
Bob deployed the tailored demo to a fresh IBM Power10 TechZone environment automatically — IBM Granite 4.0 running entirely on-prem, no cloud APIs, no data leaving the machine. The deployment takes under 40 minutes from a blank server.

**Step 4 — Narration script**
Bob produced a full demo narration script for the presenting SE, including session flow, per-scenario talking points, objection handling, and a "What Next" close built around the Power11 upgrade commercial narrative.

---

### The commercial narrative for Farnell

The session is structured in three acts:

| Act | Content | Purpose |
|---|---|---|
| 1 | Bob and the Premium Package | Solve IBM i skill gaps today — establish credibility |
| 2 | IBM Power11 presentation | The upgrade case — spare cores, platform headroom |
| 3 | Live AI demo | Proof — the headroom runs real AI, built with Bob |

The closing line: *"You already have the platform. The upgrade gives you the headroom. The question is just what you want to build on it first."*

---

### Why this matters beyond one customer

This is a **repeatable pattern**, not a one-off. The same workflow applies to any IBM Power customer conversation:

```
ICA intelligence brief  →  Bob tailors the demo  →  TechZone deploys it
        20 min                    30 min                  40 min
```

**Total preparation time: under 2 hours.** A customer walks into a meeting and sees their own world on screen — their industry, their scenarios, their language. That is not how IBM typically shows up. It should be.

The recipe is now documented, version-controlled, and shareable. Any SE with access to Bob and TechZone can run this playbook for their own customer.

---

### What's been built and where it lives

| Asset | Location |
|---|---|
| Generic IBM Power GenAI demo (reusable) | `main` branch — [github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos](https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos) |
| Farnell-tailored demo (live now) | `farnell-demo` branch — same repo |
| Live demo URL | `http://p1265-pvm1.p1265.cecc.ihost.com:3000` (IBM VPN) |
| Alex's narration script | [`FARNELL-DEMO-SCRIPT.md`](https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos/blob/farnell-demo/FARNELL-DEMO-SCRIPT.md) |
| Recipe and workflow documentation | [`COLLECTION.md`](https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos/blob/main/COLLECTION.md) |

---

### The ask

This approach works. It is fast, low-cost, and credible. The ask for Shannon is simple:

> **Make this the standard pre-sales motion for IBM Power customer engagements.**

ICA + Bob + TechZone + a tailored demo = a first meeting that feels like a partnership, not a vendor pitch. That is how we win new business against an increased target.

---

*Prepared by David Spurway · EMEA AI on IBM Power Squad · Built with Bob (Roo-Cline AI Assistant)*
