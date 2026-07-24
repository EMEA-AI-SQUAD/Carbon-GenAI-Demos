# Getting Started — IBM Power GenAI Demo

This guide gets you from zero to a running demo in under 30 minutes.  
You will do two short manual steps; Bob handles everything else.

---

## Before you begin

You will need:
- **Bob (Roo-Cline)** installed in VS Code — you already have this ✅
- **IBM VPN** active throughout — the TechZone environment is only reachable on the IBM intranet
- **Git** installed — to clone the repository ([download here](https://git-scm.com/downloads) if needed)

---

## Step 1 — Get the workspace onto your machine

Open a terminal and run:

```bash
git clone https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos
```

Then open that folder in VS Code:

```bash
code Carbon-GenAI-Demos
```

> **Windows users:** if you don't have a terminal handy, open VS Code, press `Ctrl+Shift+P`, type `Git: Clone`, paste `https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos` and choose a folder when prompted. VS Code will offer to open it automatically.

---

## Step 2 — Install the collection in Bob

1. Open Bob (the chat panel on the right side of VS Code)
2. Click the **Marketplace** icon (the shopping bag icon at the top of the Bob panel)
3. Search for **IBM Power GenAI**
4. Click **Install**

> If the collection is not yet in the marketplace, skip this step — the skill file is already included in the workspace you just cloned, and Bob will use it automatically.

---

## Optional but recommended — Tailor the demo for your customer

The demo ships with realistic sample data, but it lands **significantly better** when the scenarios reflect your specific customer's world. This takes 20–30 minutes before deploying and makes a real difference in the room.

**How to do it:**

1. Open [IBM Consulting Advantage](https://w3.ibm.com/#/apps/consulting-advantage) on IBM VPN
2. Start a new chat and ask it to focus on your customer's country/region
3. Upload the customer's annual report and most recent earnings or financial presentation
4. Ask: *"Summarise this company's key business priorities, operational challenges, and technology investment themes"*
5. Copy the response back into Bob and say:
   > *"Using this ICA summary, tailor the IBM Power GenAI demo for [customer name]. I am presenting to [audience — e.g. Head of Infrastructure, Head of Development, IBM i team]."*

Bob will identify which demo scenarios to update and make the changes on a customer-specific branch, leaving the generic `main` version untouched for future use.

---

## Step 3 — Reserve a TechZone environment (~5 min, then ~20 min wait)

Go to this link on IBM VPN:

**https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power**

- Select: **RHEL 9 ready for AI on IBM Power10 (IaaS)**
- Fill in the reservation form (go slowly — 2–3 seconds between fields)
- Purpose: **Test** or **Demo**
- Duration: 2 weeks is fine
- Submit and wait for the status to show **Ready** (~20 minutes)

Once it shows Ready, from the reservation details page:
- **Copy the FQDN** — it looks like `p1234-pvm1.p1234.cecc.ihost.com`
- **Download the SSH key** — click the **"User Private SSH Key"** button and save the `.pem` file somewhere you can find it (e.g. your Downloads folder)

---

## Step 4 — Tell Bob to deploy

Back in VS Code with the workspace open, open Bob and say:

> *"Deploy the IBM Power GenAI demo. My FQDN is `p1234-pvm1.p1234.cecc.ihost.com` and my SSH key is at `C:\Users\<you>\Downloads\<keyfile>.pem`."*

(Replace the FQDN and key path with your actual values.)

Bob will:
1. Verify the SSH connection to your TechZone environment
2. Start the automated deployment in the background
3. Check in every minute or so and show you what's happening
4. Tell you when the demo is live — usually around 20 minutes

---

## Step 5 — Open the demo

Once Bob confirms everything is running, open this URL in your browser (IBM VPN must be active):

```
http://<your-fqdn>:3000
```

You should see the IBM Power GenAI demo with 9 use cases ready to test.

---

## Something went wrong?

Just tell Bob what you see — paste any error message or describe what happened.  
Bob has full knowledge of the deployment and all known failure modes, and will guide you through a fix.

---

*Built with Bob (Roo-Cline AI Assistant) · EMEA AI on IBM Power Squad*
