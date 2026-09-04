# Use Case — IBM Power / GenAI / "On-Prem Granite AI for Regulated Clients"
Bob MODE: pre-sales-demo (Pre-Sales Demo Builder mode)

**Build Path:** Platform Reality Demo — IBM Power infrastructure + live model inference

**Why this is a strong platform reality demo:** IBM Granite 4.0 Micro running on IBM Power10 or Power11 — no cloud API, no watsonx.ai SaaS, no data leaving the client's environment — is the clearest possible answer to "but what about our data sovereignty requirements?" The "aha" moment is the first time a client pastes a document containing names, passport numbers, or financial data and watches it get processed entirely on their own Power hardware. The model is local. The answer comes back. No network call left the room. The Matrix Math Accelerator (MMA) in Power10/Power11 is what makes this practical — hardware-level AI acceleration without a separate GPU.

**Cluster:** GenAI & Foundation Models · **Industry:** Customisable per engagement (default: cross-industry; has been tailored for Electronics Distribution / Manufacturing) · **Output shape:** Live Carbon Design System web app + 10 interactive use cases + IBM Granite inference on Power10/Power11 + client-specific scenario data

> **Build path guardrail.** The deliverable is IBM Granite running on IBM Power hardware via llama.cpp. If the only IBM touchpoint is a cloud API call or a watsonx.ai SaaS endpoint, the build is WRONG. The entire value proposition is that the model runs on the client's own Power infrastructure. An x86 laptop mock cannot represent this story faithfully — see PROMPT #1 for the honest adaptation.

> **Customisation is the expected path, not the exception.** The generic version of this demo exists as a baseline. The Pre-Sales Demo Builder mode is designed to tailor the scenario data, sample inputs, and demo script to a specific client before deployment. A customised version has already been produced for Premier Farnell (Electronics Distribution). The Cluster and Industry fields above should be updated to reflect the specific engagement before presenting.

---

## EXECUTIVE NARRATIVE

Imagine you're a CISO at a European bank, or an IT Director at a regulated utilities company. It's Monday morning. Your team has been told AI is the future. But every vendor demo calls home to a US cloud. Every pilot requires data to leave your data centre. Every conversation about AI ends with your Legal team saying no.

You've seen the watsonx.ai slides. You already run IBM Power. Nobody has shown you what it looks like to run the model *on your own hardware.*

The goal is not to sell cloud AI to clients who can't use cloud AI.

The goal is to show that IBM Power already has the compute to run IBM's own foundation model — locally, privately, with no external dependencies — and that the UI to interact with it takes under 25 minutes to deploy from scratch.

---

## USE CASE DESCRIPTION

**The pitch in one line:**

> "Ten use cases covering entity extraction, conversation intelligence, PII redaction, KYC, document discovery, brief building, RFP assistance, and talent acquisition — running on IBM Granite 4.0 Micro on your IBM Power hardware, tailored to your client's industry, with no data leaving the building."

This is a platform reality demo, not a conceptual slide. It is a running Carbon Design System web application connecting to a live llama.cpp inference server on IBM Power10 (ppc64le). The model is IBM Granite 4.0 Micro in GGUF Q4_K_M quantisation (~2.5 GB). The demo loads in a browser. The client can type their own text — or the Pre-Sales Demo Builder mode can pre-load client-specific scenario data before deployment.

The architecture is deliberately minimal — three services, no orchestration layer, no watsonx.ai dependency — because the story is: *this runs on hardware you already own.*

**Components:**

- **IBM Granite 4.0 Micro (GGUF Q4_K_M)** — the model, running via llama.cpp on ppc64le with OpenBLAS optimisation. Exposed as an OpenAI-compatible REST API on port 8080.
- **Node.js proxy (port 3001)** — handles CORS between the browser and llama.cpp. All API calls resolve from `window.location.hostname` at runtime — zero hardcoded FQDNs in the source.
- **Next.js + Carbon Design System UI (port 3000)** — the demo interface. 10 use case tabs, structured prompt engineering per use case, clean IBM design language.
- **PassportEye OCR service (port 5000)** — optional Python service for the Passport Verification use case. Soft-fail wrapped — if it fails, all other 9 demos continue working.

The land-and-expand line: this architecture slots directly into a client's IBM Power10 or Power11 environment. The same pattern — model on Power, proxy, UI — is the foundation for a production AI inference layer. Note: Power9 and older do not include MMA and are not suitable for this workload. As PowerVS transitions its fleet to Power10/Power11 over time, cloud-hosted deployments will also become viable.

---

## PRE-LOADED USE CASES

The demo ships with 10 use cases across 4 navigation tabs. The sample data in each is the generic baseline — it should be replaced with client-relevant content using the Pre-Sales Demo Builder mode before a client-facing presentation (see PROMPT #0 below).

**Entity Extraction tab:**

**Use case 1 — Book Review / Content Cataloguing (customisable):**
Default input: a short English book review. Output: structured entities (title, author, genre, themes, sentiment). *For Farnell: replaced with component catalogue entry (supplier product description → part number, manufacturer, specs, stock level).*

**Use case 2 — Multilingual IT Ops (translation + priority):**
Input: an Italian or French helpdesk email. Output: English translation + priority classification (P1/P2/P3). Scenarios are pre-loaded in Italian and French; the presenter can substitute real examples from the client's own operations.

**Use case 3 — German Logistics Quote (data extraction + calculation):**
Input: a German logistics text (Hans Geis scenario — real IBM customer). Output: extracted shipment data + pallet calculation. Anchor scenario: keep this one — the Hans Geis IBM reference is a useful credibility point.

**PII Extraction tab:**

**Use case 4 — Fraud Complaint PII (PII detection and redaction):**
Input: a complaint letter containing personal data. Output: 8 detected PII types + redacted version of the text.

**Use case 5 — Passport Verification (OCR + structured extraction):**
Input: OCR text from a travel document. Output: structured identity record (name, DOB, nationality, passport number).

**Use case 6 — Document Discovery (risk classification):**
Input: a document or paragraph. Output: risk classification (HIGH / MEDIUM / LOW) with rationale. *For Farnell: replaced with an order management platform migration memo referencing GDPR review of 2.4M customer records.*

**Other tabs:**

**Use case 7 — Brief Builder (structured generation):**
Input: rough campaign launch notes. Output: a structured campaign brief (objective, audience, key messages, channels, KPIs).

**Use case 8 — RFP Assistant (proposal framing):**
Input: an extract from an RFP or tender document. Output: a structured proposal framework. *For Farnell: pre-loaded with an e-commerce platform modernisation RFP in the supplier role.*

**Use case 9 — Talent Acquisition (content generation):**
Input: a job title and brief description. Output: a full job description and candidate summary paragraph.

**Conversation Intelligence tab (3 sub-tabs):**

**Use case 10a — Sales Call Analysis:**
Input: a sales call transcript. Output: structured extraction — summary, industry classification, call-to-action, client details, budget, pain points, competitors mentioned.

**Use case 10b — Multilingual Customer Service Sentiment:**
Input: a German-language customer support call transcript. Output: English summary, sentiment journey (angry → satisfied), urgency, resolution status, compensation offered.

**Use case 10c — Meeting Intelligence & Action Items:**
Input: a product strategy meeting transcript. Output: meeting summary, key decisions, structured action items (task | owner | deadline), open questions, next meeting.

All inputs can be typed live or pre-loaded. The Conversation Intelligence tab's scenarios connect well to any client with contact centres, multilingual operations, or product teams — adjust the pre-loaded transcript to match the client's world.

---

## PREPARATION

**Required:**

- IBM Bob (Roo-Cline) in VS Code — with the `deploy-carbon-genai-power` skill loaded
- IBM VPN active — the TechZone `cecc.ihost.com` domain is IBM-intranet only
- An IBM Power TechZone environment (see PROMPT #2 for the reservation flow)
  - Platform: **AI-Ready RHEL on IBM Power On-Premises** (`6a7aba1916c56f06e4b1e910`)
  - Collection: https://techzone.ibm.com/collection/on-premises-power-systems-aix-ibm-i-and-linux-base-images
  - v2 environment — **Bob can reserve automatically** via the TechZone MCP
  - Default image: RHEL 10.2 on Power10, 8 vCPUs, 50GB RAM, dedicated processor
  - For RHEL 9.x: specify `RHEL_9.6` or `RHEL_9.8` at reservation time
- SSH client (OpenSSH on Linux/Mac, or OpenSSH on Windows — not PuTTY, which has key-format issues on this environment)
- Private SSH key downloaded from the TechZone reservation details page ("User Private SSH Key" button)

**Optional — environment variable for the deployment skill:**

```env
TECHZONE_FQDN=pvm1-<key>.p<NNNN>.pok-systems.techzone.ibm.com
SSH_KEY_PATH=<path-to-downloaded-key-file>
```

---

## PROMPT #0 — Tailor the demo for your client (recommended before any client engagement)

> **This is the step that makes the difference between a generic demo and a conversation.** The Pre-Sales Demo Builder mode can replace the default scenario data with client-relevant content — changing the Book Review tab into a Component Catalogue Entry for an electronics distributor, loading a client-specific GDPR migration document into Document Discovery, pre-loading the Conversation Intelligence tab with a transcript from the client's own industry. The Hans Geis logistics scenario and the Passport Verification scenario are anchor scenarios (real IBM reference customer and widely relatable KYC use case) — leave those in place.

Use the **Pre-Sales Demo Builder** mode.

```
Use the Pre-Sales Demo Builder mode.

I am preparing the IBM Power GenAI demo for a client engagement with [client name].

Client context:
- Company: [client name]
- Industry: [industry]
- Audience in the room: [e.g. Head of Infrastructure, CTO, IT Director]
- Key themes for this client: [e.g. GDPR compliance, multilingual operations, supply chain data]
- IBM products they already use: [e.g. IBM i, IBM Power, specific software]

Using this context, tailor the demo for this client:
1. Identify which of the 10 use cases map most naturally to their world
2. For the generic use cases (Book Review, Document Discovery, RFP Assistant,
   Conversation Intelligence), rewrite the pre-loaded sample data to use
   this client's industry, terminology, and plausible scenarios
3. Leave the Hans Geis logistics scenario and Passport Verification unchanged —
   these are anchor scenarios
4. Create a client-specific branch name (e.g. [client-slug]-demo) so the
   main branch stays clean for future engagements
5. Generate a DEMO_SCRIPT.md tailored to this client, with:
   - Speaker lines for each use case referencing their specific context
   - Suggested order of use cases based on their audience
   - Lines for handling likely objections from their personas
   - A suggested "what next" conversation for the close
6. Update the deployment instructions to clone from the client branch
```

**Stop point:** You should now have modified sample data files and a `DEMO_SCRIPT.md` that references the client by name. Check that the Hans Geis and Passport tabs are unchanged. Then proceed to PROMPT #2 to reserve and deploy.

---

## PROMPT #1 — Understand the architecture in context (no IBM Power environment needed)

> **Honest adaptation from the template:** The standard template asks for a "mock mode" that runs locally with no platform entitlement. This recipe cannot fully honour that intent — the story *is* IBM Power10/Power11 architecture. Running a generic LLM call from a laptop against a cloud endpoint does not demonstrate the data sovereignty and on-hardware inference point that is the entire reason this demo exists.
>
> What PROMPT #1 can do instead: build the UI and understand the prompt engineering, using a local llama.cpp instance if you happen to have one (e.g. on an Apple M-series Mac) **purely to validate the interface behaviour**. The demo must be presented on IBM Power to tell the right story.

Use the **Pre-Sales Demo Builder** mode.

```
Use the Pre-Sales Demo Builder mode and the deploy-carbon-genai-power skill.

I need to understand the Carbon GenAI IBM Power demo before I present it to a client.
I don't have my TechZone environment yet, so I want to do two things:

1. Walk me through the architecture — what are the four services, why each one
   exists, and what would break if any one of them were missing.

2. For the 10 use cases in this demo, generate a briefing card for each:
   - Use case name and tab location in the UI
   - What the client types in (give me a concrete example input)
   - What the model returns (describe the structure of the output)
   - Which client persona / industry this resonates with most
   - One sentence I can say out loud to the client before they type

Format as a DEMO_PREP.md file I can open on a second monitor during the demo. Include all 10 use cases.
```

**Stop point:** You should now have `DEMO_PREP.md` on disk with a briefing card for each of the 10 use cases, concrete example inputs, and a speaker line for each. Read through it. If any use case description surprises you, go back and ask Bob to clarify before you're in front of a client.

---

## PROMPT #1A — Validate the UI locally (optional, M-series Mac only)

> This step is truly optional and only possible if you have llama.cpp with a Granite GGUF already running locally (e.g. `llama-server -m granite-4.0-micro-Q4_K_M.gguf --port 8080`). It gives you a chance to test the UI interaction flow before your TechZone environment is ready. Skip this if you don't have a local llama.cpp setup.

```
My local llama-server is running on port 8080. Help me start the Carbon GenAI UI
against it so I can test the interface without a TechZone environment.

The workspace is already cloned at this path. Start the proxy on port 3001 and
the Next.js app on port 3000, pointing both at localhost:8080.
```

**Stop point:** If you can reach `http://localhost:3000` and the Book Review tab returns a response, the UI is working. Note: responses from an x86 model will work but are not representative of performance on IBM Power — this is interface validation only.

---

## PROMPT #2 — Reserve and preflight the TechZone environment

> **Bob can now reserve this environment automatically.** The platform has been migrated to a v2 TechZone environment (`base-onpremise-powervc-vm` provisioner). The previous v1 platform (`66479c385e3bbb001e089937`) is disabled and superseded.

Ask Bob to reserve first:

```
Use the Pre-Sales Demo Builder mode and the deploy-carbon-genai-power skill.

Reserve a TechZone IBM Power environment for the Carbon GenAI demo.
Platform ID: 6a7aba1916c56f06e4b1e910
Purpose: Test (or Demo if I have an opportunity code — ask me)
Start: now

Once it is Ready, run the preflight check:
1. SSH connectivity — confirm I can reach the environment and the architecture is ppc64le
2. Disk space — confirm at least 10 GB free (the model is ~2.5 GB, build artefacts ~3 GB)
3. RAM — confirm at least 4 GB available
4. Network — confirm outbound access to github.com and huggingface.co

Give me a green/red connectivity report. If anything is red, tell me what to do
before I proceed to PROMPT #3.
```

> **RHEL version note:** The default image is RHEL 10.2. The deployment script was validated on RHEL 9.4. If you want RHEL 9.x, tell Bob to specify `RHEL_9.6` or `RHEL_9.8` at reservation time. Testing on RHEL 10.2 is recommended as the new baseline going forward.

> **Duration note:** Purpose `Test` = 12 hours maximum (no opportunity code needed). Purpose `Demo` = longer duration, requires an opportunity code. For a quick deployment test, 12 hours is sufficient.

**If you prefer to reserve manually:**
Go to https://techzone.ibm.com/collection/on-premises-power-systems-aix-ibm-i-and-linux-base-images and select **AI-Ready RHEL on IBM Power On-Premises**. Choose RHEL version, set Power architecture to Power10, 8 CPUs, 50GB RAM. Once Ready, copy the FQDN and download the SSH key.

**Stop point:** You need a clean green report on all four checks before starting the deployment. If SSH fails, the most common cause is a stale host key (if the FQDN was used by a previous reservation) — see Known Issues for the fix.

---

## PROMPT #3 — Full deployment and demo verification

```
Use the Pre-Sales Demo Builder mode and the deploy-carbon-genai-power skill.

Deploy the Carbon GenAI demo to my TechZone IBM Power environment.

My environment:
- FQDN: pvm1-<key>.p<NNNN>.pok-systems.techzone.ibm.com
- SSH username: <OS User Name from reservation page>
- SSH key path: <path-to-downloaded-key-file>

Run the full deployment:
1. Stage the deployment script to the server
2. Launch the deployment in the background (it takes ~20 minutes on a clean instance)
3. Monitor the progress log every 2 minutes and report each step as it completes
4. Once all 15 steps are green, verify all four services are listening:
   - :8080 llama-server
   - :3001 Node.js proxy
   - :3000 Next.js web app
   - :5000 PassportEye OCR (soft-fail — report if absent, don't block)
5. Confirm the demo URL and test that the Book Review use case returns a response

Tell me when I can open http://<fqdn>:3000 and start presenting.
```

**Stop point:** You should see "All 15 steps green" in the deployment log, all four ports confirmed listening, and a successful test response from the Book Review use case. Total elapsed time from starting this prompt to demo-ready: ~20–25 minutes. If any step fails, paste the error to Bob — the deploy skill has documented workarounds for all known failure modes.

---

## EXPECTED OUTPUT

**Deployment artefacts (on TechZone server):**

```
~/deployment/
  remote-launch.sh       — staged launcher script
  deploy-live.log        — full deployment log (15 steps)

~/Carbon-GenAI-Demos/
  carbon-ui/             — Next.js + Carbon Design System app (built)
  carbon-ui/.next/       — production build output
  carbon-ui/llama-proxy/ — Node.js proxy server
  deployment/            — management scripts
  models/                — IBM Granite 4.0 Micro GGUF (downloaded)
  llama.cpp/             — built from source for ppc64le
```

**Running services:**

| Port | Service | How to verify |
|------|---------|--------------|
| 8080 | llama-server (IBM Granite) | `curl http://localhost:8080/health` returns `{"status":"ok"}` |
| 3001 | Node.js proxy | `curl http://localhost:3001/health` returns `{"status":"ok"}` |
| 3000 | Next.js web app | Open `http://<fqdn>:3000` in browser |
| 5000 | PassportEye OCR | `curl http://localhost:5000/health` returns `{"status":"ok"}` (soft-fail) |

**Documentation (in workspace):**

`DEMO_PREP.md`, `COLLECTION.md`, `GETTING-STARTED.md`, `RECIPE-JOURNEY.md`, `01-Carbon-GenAI-IBM-Power.md`

---

## DEMO SCRIPT

**Pre-demo setup (10 minutes before):**

- IBM VPN must be active
- Open `http://<fqdn>:3000` in Chrome or Edge — confirm the landing page loads
- Open a second browser tab to the deployment log (`ssh -i <key> cecuser@<fqdn> "tail -20 ~/deployment/deploy-live.log"`) — only needed if troubleshooting
- Have `DEMO_PREP.md` open on a second monitor or printed
- Brief the client: "This is running on IBM Power hardware. The model is on the server. Nothing leaves this environment."

**Step 1 — Landing page (1 min)**

Open the home page. Point out: Carbon Design System, IBM styling, tabs for each use case category. Say: *"Everything you're about to see is powered by IBM Granite — IBM's own foundation model — running on IBM Power hardware. No cloud, no API key, no data leaves."*

**Step 2 — Entity Extraction: Book Review (2 min)**

Click **Entity Extraction** → **Book Review**. Paste or type a short review (e.g. the client's own product, or a Wikipedia paragraph). Submit. Show the extracted entities. Let the client try one themselves.

**Step 3 — PII: Fraud Complaint Redaction (3 min)**

Click **PII Extraction** → **Fraud Complaint**. This is the use case that resonates most with regulated-industry clients. Type a complaint with a name, address, phone number, and credit card number. Submit. Show the 8 PII types detected and the redacted output. Say: *"That processing happened on your hardware. The text never left."*

**Step 4 — Multilingual IT Ops (2 min)**

Click **Entity Extraction** → **Multilingual IT Ops**. Paste a French or Italian support email (or generate one live). Show the English translation and priority classification. Good for clients with multilingual operations or shared service centres.

**Step 5 — Brief Builder or RFP Assistant (3 min, pick one)**

Choose based on the client's role: Brief Builder for marketing/comms, RFP Assistant for procurement/bid teams. These show structured document generation. Paste rough notes and show a formatted output.

**Step 6 — Client drives (5 min)**

Hand the keyboard to the client. Let them type their own text into any use case. This is the closing moment — once their data produces a structured output on their own hardware, the conversation shifts.

**Step — Close**

*"This is what IBM Power can do today. Nine use cases, one model, your data centre. The same architecture that deployed this demo in 20 minutes can be the foundation of your production AI inference layer."*

---

## SAMPLE PROMPTS / INPUTS

These are verbatim inputs you can paste into each use case during a demo. Replace bracketed values with client-relevant content.

**1. Book Review Analysis**

```
The Midnight Library by Matt Haig is a thought-provoking novel that explores
regret, choice, and second chances. Haig's writing is accessible yet deeply
philosophical, weaving a compelling narrative around Nora Seed's journey through
alternate lives. The pacing is measured but the emotional payoff is significant.
Recommended for readers who enjoy introspective fiction with a hopeful resolution.
```

Expected: title, author, genre (literary fiction), sentiment (positive), themes (regret, choice, identity), rating inference.

**2. Multilingual IT Ops**

```
Objet: Problème critique avec le système de facturation
Notre système de facturation ne répond plus depuis ce matin. Plusieurs clients
ne peuvent pas accéder à leurs factures et nous avons reçu des plaintes.
Le problème a commencé vers 08h30. Pouvez-vous intervenir immédiatement ?
```

Expected: English translation + priority P1 (billing system down, customer impact).

**3. German Logistics Quote**

```
Wir benötigen ein Angebot für den Transport von 48 Europaletten mit
Lebensmittelware von München nach Hamburg. Liefertermin: nächste Woche Dienstag.
Gesamtgewicht ca. 19.200 kg. Temperaturgeführter Transport nicht erforderlich.
Kontakt: Hans Weber, hans.weber@beispiel.de, Tel: 089-123456
```

Expected: origin, destination, pallet count (48), weight, deadline, contact details, and calculated load (2× standard 13.6m trailers needed).

**4. Fraud Complaint PII**

```
I am writing to report fraudulent activity on my account. My name is James
Robertson, date of birth 14/03/1978, and I reside at 42 Elm Street, Manchester,
M1 3AB. My account number ending 7821 and my Visa card number 4532 1234 5678 9012
(expiry 09/26, CVV 342) were used without my authorisation on 12 August.
My National Insurance number is AB123456C. Please contact me on 07712 345678
or at james.robertson@email.co.uk.
```

Expected: 8 PII types detected (name, DOB, address, account number, card number, NI number, phone, email) + redacted output.

**5. Passport Verification**

```
PASSPORT
GBR
Surname: SMITH
Given names: JOHN EDWARD
Nationality: BRITISH CITIZEN
Date of birth: 15 JAN 1985
Sex: M
Place of birth: LONDON
Date of issue: 10 MAR 2020
Date of expiry: 09 MAR 2030
Passport No: 123456789
```

Expected: structured identity record with all fields parsed.

**6. Document Discovery**

```
This internal memorandum discusses the proposed transfer of 45,000 customer
records including names, email addresses, and purchase histories to our new
CRM provider based in the United States. Legal review is pending. Data
retention policy has not yet been updated to reflect the new processing
agreement. GDPR Article 46 safeguards have not been confirmed as of the
date of this memo.
```

Expected: classification HIGH, rationale citing GDPR Article 46, cross-border transfer without confirmed safeguards.

**7. Brief Builder**

```
We're launching our new sustainable packaging range in October. Target audience
is B2B procurement managers in food manufacturing. Key message: 30% carbon
reduction vs. standard packaging, EU Green Deal compliant, same price point.
We have a trade show slot at Packaging Expo on 14 October. Budget: £50k.
Need social, email, and one paid campaign. Need approval by end of September.
```

Expected: structured campaign brief (objective, audience, key messages, channels, KPIs, timeline, approval milestone).

**8. RFP Assistant**

```
We are seeking proposals for the supply and implementation of an AI-assisted
document management system for our legal department. The system must integrate
with our existing Microsoft 365 environment, provide document classification,
support GDPR data subject access request workflows, and be deployable on our
private cloud infrastructure. Proposals should address data residency, security
accreditations, and a phased implementation plan. Deadline: 30 September.
```

Expected: proposal framework with sections (Executive Summary, Solution Overview, Technical Architecture, Data Residency & Security, Implementation Plan, Commercial).

**9. Talent Acquisition**

```
We need a Senior Data Engineer with 5+ years experience in Python and Apache Spark,
strong background in data pipeline architecture, experience with cloud data platforms
(AWS or Azure), and ideally financial services sector experience. The role is hybrid
(London, 3 days per week), salary £85-95k. We're a fast-growing fintech and this
person will be a technical lead within 18 months.
```

Expected: full job description with responsibilities, requirements, nice-to-haves, benefits + a candidate summary paragraph for outreach.

---

## WHAT GOOD LOOKS LIKE

A strong run should feel like watching a client's data stay in the room.

It should:

- Return structured, well-formatted output for every use case within 5–15 seconds (IBM Power10 with Q4_K_M quantisation at 4 threads gives comfortable interactive latency)
- Detect all 8 PII types correctly in the Fraud Complaint use case, including the NI number and CVV (not just the obvious fields)
- Produce a correctly calculated pallet count in the German Logistics use case (48 pallets = 2 full 13.6m trailers) — this tests numeric reasoning, not just extraction
- Translate the French IT Ops email accurately and assign P1 correctly (billing system down with customer impact is not P2)
- Generate a Brief Builder output where the KPIs are measurable and the timeline is coherent with the input dates

It should correctly decline to:

- Invent contact details or passport numbers not present in the input (the model should extract only what is there)
- Generate redacted text that leaves PII visible (partial redaction is a failure)

The output should not just be "AI generated text."

It should answer: *"Can IBM Granite, running on IBM Power, do the real task my team does today — and do it without sending a single byte outside my building?"*

---

## KNOWN ISSUES & WORKAROUNDS

**Issue:** PuTTY host key conflict — SSH fails with "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED"

Cause: TechZone reuses FQDNs across reservations. Your SSH known_hosts file has the old host key.

Workaround:
```powershell
ssh-keygen -R <fqdn>
# If PuTTY is also installed:
Remove-ItemProperty 'HKCU:\Software\SimonTatham\PuTTY\SshHostKeys' -Name "ssh-ed25519@22:<fqdn>"
```
Impact: None once cleared. Affects first SSH attempt to a recycled FQDN only.

---

**Issue:** Old v1 platform (`66479c385e3bbb001e089937`) is disabled

Cause: The original "Generative AI demos on IBM Power" collection used a v1 `systems-2` provisioner. It was disabled on 2026-08-13.

Workaround: Use platform `6a7aba1916c56f06e4b1e910` ("AI-Ready RHEL on IBM Power On-Premises") instead. Bob can reserve it automatically. See PROMPT #2.

Impact: None — the new platform is a direct functional replacement with better capabilities (choice of RHEL version, configurable RAM/CPU).

---

**Issue:** `yarn build` fails with TypeScript version conflict

Cause: npm/yarn resolves TypeScript 7.x which is incompatible with Next.js 13's `verifyTypeScriptSetup`.

Workaround: `package.json` pins TypeScript to exact version `5.9.3`. The deploy script does not run `yarn add typescript`. This is already fixed in the repo.

Impact: None if deploying from the current repo state. Would recur if `package.json` version is changed to a caret range.

---

**Issue:** Deployment script exits at step 7 with no error message

Cause: (Historical — fixed in commit cd804f8) A missing closing brace in `configure_proxy()` caused a bash parse error.

Workaround: Already fixed. Pull the latest version of the deploy script before running.

Impact: None on current repo. Documented for reference if a fork diverges from main.

---

## EXECUTIVE TAKEAWAY

At the end of this demo, the takeaway should be simple:

> *"Your data, your hardware, your model — IBM Power already has everything you need to run AI without giving up control of your data."*

---

## ADDITIONAL MATERIAL

- Related: [COLLECTION.md](COLLECTION.md) — marketplace collection README
- Related: [GETTING-STARTED.md](GETTING-STARTED.md) — one-page user guide
- Related: [RECIPE-JOURNEY.md](RECIPE-JOURNEY.md) — full deployment log and technical decisions
- Deployment skill: [`.bob/skills/deploy-carbon-genai-power.md`](.bob/skills/deploy-carbon-genai-power.md)
- TechZone platform (v2): https://techzone.ibm.com/collection/on-premises-power-systems-aix-ibm-i-and-linux-base-images
- Source repo: https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos
