---
name: carbon-genai-ibm-power
title: "Carbon GenAI Demo on IBM Power - On-Prem Granite AI"
description: >
  Deploy a fully self-contained AI demo - IBM Granite 4.0 Micro running on-prem
  on IBM Power, no cloud APIs, no watsonx.ai SaaS, no data leaving the client
  environment - in under 25 minutes from a fresh TechZone reservation. Includes
  9 real CE use cases built with Carbon Design System: entity extraction,
  PII redaction, multilingual IT ops, document discovery, passport verification,
  brief building, RFP assistance, and talent acquisition.
author: EMEA AI on IBM Power Squad
version: 1.0.0
repository: https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos
tags:
  - ibm-power
  - granite
  - genai
  - llama-cpp
  - carbon-design-system
  - on-premises
  - data-sovereignty
  - ppc64le
  - rhel
  - pre-sales
  - platform-reality-demo
skills:
  - deploy-carbon-genai-power
techzone:
  platform_id: 66479c385e3bbb001e089937
  collection_url: https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power
  environment: RHEL 9 ready for AI on IBM Power10 (IaaS)
  infrastructure: systems-2
  provisioner: Systems V1 Provisioner (v1 - manual reservation required)
  status: DISABLED as of 2026-08-13
  note: >
    v1 TechZone environment - manual reservation required, Bob cannot book automatically.
    IMPORTANT: The environment is currently DISABLED on TechZone (status confirmed 2026-08-13).
    Collection owner is sebastian.lehrig1@ibm.com - on holiday until end of August 2026.
    Contact sebastian or the TechZone support alias (techzone.help@ibm.com) to re-enable.
    This is a blocker for any new reservations until resolved.
---

# Carbon GenAI Demo on IBM Power

> **Known issue (2026-08-13):** The TechZone environment (`RHEL 9 ready for AI on IBM Power10`)
> is currently **disabled**. New reservations are not possible until the collection owner
> re-enables it. Contact `techzone.help@ibm.com` or wait for `sebastian.lehrig1@ibm.com`
> to return from holiday (end of August 2026).

For full setup instructions, see [COLLECTION.md](COLLECTION.md).

For the development journey, decisions, and deployment log, see [RECIPE-JOURNEY.md](RECIPE-JOURNEY.md).

For a one-page getting started guide, see [GETTING-STARTED.md](GETTING-STARTED.md).

## Quick Start

1. **Reserve** — Manual reservation required (v1 environment, Bob cannot book automatically).
   Go to https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power
   and select **RHEL 9 ready for AI on IBM Power10 (IaaS)**.
   > Note: if the environment shows as unavailable, see the known issue above.
2. **Deploy** — Tell Bob your FQDN and SSH key path:
   *"Deploy the Carbon GenAI demo. My FQDN is p<NNNN>-pvm1.p<NNNN>.cecc.ihost.com
   and my SSH key is at <path>."*
3. **Demo** — Open `http://<fqdn>:3000` (IBM VPN required). All 9 use cases ready to run.

**Total human effort:** ~10 minutes. **Total elapsed:** ~40 minutes.
