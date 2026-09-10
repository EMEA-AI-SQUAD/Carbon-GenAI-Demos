---
name: carbon-genai-ibm-power
title: "Carbon GenAI Demo on IBM Power - Granite AI on Power10/Power11"
description: >
  Deploy a fully self-contained AI demo - IBM Granite 4.0 Micro running on IBM
  Power10 or Power11, no cloud APIs, no watsonx.ai SaaS, no data leaving the
  client environment - in under 25 minutes from a fresh TechZone reservation.
  Requires Power10 or Power11 for the Matrix Math Accelerator (MMA). Includes
  10 use cases built with Carbon Design System: entity extraction, conversation
  intelligence, PII redaction, multilingual IT ops, document discovery, passport
  verification, brief building, RFP assistance, and talent acquisition.
author: EMEA AI on IBM Power Squad
version: 1.0.0
repository: https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos
tags:
  - ibm-power
  - granite
  - genai
  - llama-cpp
  - carbon-design-system
  - ibm-power10
  - ibm-power11
  - mma
  - data-sovereignty
  - ppc64le
  - rhel
  - pre-sales
  - platform-reality-demo
skills:
  - deploy-carbon-genai-power
techzone:
  platform_id: 6a7aba1916c56f06e4b1e910
  collection_id: 6261d3584670d7001e3d483a
  collection_url: https://techzone.ibm.com/collection/on-premises-power-systems-aix-ibm-i-and-linux-base-images
  environment: AI-Ready RHEL on IBM Power On-Premises
  infrastructure: systems-onprem
  provisioner: base-onpremise-powervc-vm (v2 - Bob can reserve automatically)
  status: Enabled
  note: >
    v2 TechZone environment - Bob can reserve automatically via the TechZone MCP.
    Platform provides Power10 hardware with RHEL 8/9/10 image options.
    Default: RHEL 10.2, 8 vCPUs, 50GB RAM, dedicated processor mode.
    For RHEL 9.x deployments specify powervc_image_name e.g. RHEL_9.6.
    Purpose Test = 12 hours maximum. Purpose Demo requires opportunity code.
    Previously used platform 66479c385e3bbb001e089937 (v1, disabled 2026-08-13) -
    superseded by this environment.
---

# Carbon GenAI Demo on IBM Power

For full setup instructions, see [COLLECTION.md](COLLECTION.md).

For the development journey, decisions, and deployment log, see [RECIPE-JOURNEY.md](RECIPE-JOURNEY.md).

For a one-page getting started guide, see [GETTING-STARTED.md](GETTING-STARTED.md).

## Quick Start

1. **Reserve** — Tell Bob: *"Reserve a TechZone AI-Ready RHEL on IBM Power environment for me."*
   Bob will use the TechZone MCP to book platform `6a7aba1916c56f06e4b1e910` automatically.
   Or reserve manually at https://techzone.ibm.com/collection/on-premises-power-systems-aix-ibm-i-and-linux-base-images
   and select **AI-Ready RHEL on IBM Power On-Premises**.
2. **Deploy** — Tell Bob your FQDN and SSH key path:
   *"Deploy the Carbon GenAI demo. My FQDN is pvm1-<key>.p<NNNN>.pok-systems.techzone.ibm.com
   and my SSH key is at <path>."*
3. **Demo** — Open `http://<fqdn>:3000` (IBM VPN required). All 10 use cases ready to run.

**Total human effort:** ~10 minutes. **Total elapsed:** ~30 minutes.
