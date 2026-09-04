# Getting Started — Carbon GenAI Demo on IBM Power

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
3. Search for **Carbon GenAI IBM Power**
4. Click **Install**

> If the collection is not yet in the marketplace, skip this step — the skill file is already included in the workspace you just cloned, and Bob will use it automatically.

---

## Step 3 — Reserve a TechZone environment (~15 min total)

**Option A — Let Bob do it (recommended):**

In Bob, say: *"Reserve a TechZone AI-Ready RHEL on IBM Power environment for me. Platform ID: `6a7aba1916c56f06e4b1e910`. Purpose: Test."*

Bob will reserve it via the TechZone MCP and notify you when it's Ready (~15 min provisioning). Once Ready, Bob can read the FQDN and SSH key directly from the reservation.

**Option B — Reserve manually** (IBM VPN required):

Go to: **https://techzone.ibm.com/collection/on-premises-power-systems-aix-ibm-i-and-linux-base-images**

- Select: **AI-Ready RHEL on IBM Power On-Premises**
- RHEL version: **RHEL 9.6** or **9.8** (recommended for compatibility)
- Power architecture: **Power10**
- CPUs: **8**, RAM: **50GB**
- Purpose: **Test** (12 hour max) or **Demo** (needs opportunity code, longer duration)
- Submit and wait for status **Ready** (~15 minutes)

Once Ready:
- **Copy the FQDN** — it looks like `pvm1-<key>.p<NNNN>.pok-systems.techzone.ibm.com`
- **Download the SSH key** — click **"User Private SSH Key"** and save the `.pem` file

---

## Step 4 — Tell Bob to deploy

Back in VS Code with the `Carbon-GenAI-Demos` workspace open, open Bob and say:

> *"Deploy the Carbon GenAI demo. My FQDN is `p1234-pvm1.p1234.cecc.ihost.com` and my SSH key is at `C:\Users\<you>\Downloads\<keyfile>.pem`."*

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

You should see the Carbon GenAI demo with 9 use cases ready to test.

---

## Something went wrong?

Just tell Bob what you see — paste any error message or describe what happened.  
Bob has full knowledge of the deployment and all known failure modes, and will guide you through a fix.

---

*Built with Bob (Roo-Cline AI Assistant) · EMEA AI on IBM Power Squad*
