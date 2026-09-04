# Why the CE Marketplace Has No IBM Power Recipes Yet

> For Barry — EMEA AI on IBM Power Squad · September 2026

---

## The short answer

The work exists. Four recipes are in various stages of readiness. None have been submitted because **the definition of what a "recipe" is kept changing**, and we were building against moving goalposts. That changed when an official template was published on 2026-08-15. We now have a clear target, and the gap to submission is one handoff test and a PR.

---

## What the team has built

| Recipe | What it does | Readiness |
|---|---|---|
| **Carbon GenAI on IBM Power** *(David)* | IBM Granite 4.0 running on Power10/11 — 10 use cases, Carbon Design System UI, deployed in ~38 min on a clean instance. Already customised for Premier Farnell. | ✅ **Recipe brief complete. Deployed and validated on RHEL 10.2 (2026-09-04).** Awaiting handoff test, then PR. |
| **PowerSC + HashiCorp Vault** *(David)* | Before/after certificate security demo on real PowerSC infrastructure — 150 certificates replaced, live compliance score improvement. | Close to submission. Needs final testing against the new template. |
| **watsonx.data on IBM Power** *(David)* | Live federated data demo across IBM i, PostgreSQL/EDB, and Iceberg — cyber and logistics signal detection. Two variants: IBM i path and Oracle-on-AIX path. | Work in progress. Recipe structure in place, aligning to template as development continues. |
| **IBM i Ansible Lab** *(Joris)* | Hands-on lab: Bob drives Ansible automation against a live IBM i TechZone environment. Health checks, PTF discovery. | Pre-run review done, issues logged. Classifies as a **Lab** (not a Recipe) — submission path is `LABs/` in the CE marketplace. Joris resolving template access. Will be a demo with an outcome, not just a lab step-through. |

---

## Why nothing has been submitted yet

### 1. The format kept changing

When the team started, there was no official template. We built to the examples already in the CE Marketplace (Instana-Retail, Maximo-Manufacturing, QRadar-FinancialServices). Those are single-prompt recipes with a short README.

An official **Bob Recipe Template** was published on 2026-08-15. It is significantly more structured — it requires a 3-prompt sequence, a click-path demo script, verbatim sample inputs per use case, and a formal executive takeaway. None of the currently published CE marketplace recipes follow this template either. We are now the first team aligning to it.

### 2. TechZone has been more complicated than expected

Every IBM Power recipe depends on a TechZone environment. We have worked through several TechZone issues:

| Issue | Recipes affected | Status |
|---|---|---|
| **v1 provisioner** — original Carbon GenAI environment used a v1 provisioner that Bob's TechZone MCP cannot automate | Carbon GenAI | ✅ Resolved — migrated to v2 platform `6a7aba1916c56f06e4b1e910` (2026-09-04). Manual reservation confirmed working. |
| **Bob MCP auto-reservation bug** — MCP does not pass `userVariables` (including `powervc_image_name`) to the v2 on-prem provisioner; the default image alias is missing from the Poughkeepsie inventory | Carbon GenAI | Bug reported to `techzone.help@ibm.com`. Manual reservation is the reliable path in the recipe; MCP auto-reservation is documented as Option A with a clear fallback. |
| **v1 provisioner** — PowerSC+Vault environment still on v1 | PowerSC+Vault | Manual reservation required; v2 migration under investigation |
| **MCP silent failure on Certified Base Images** — IBM i environments accept a booking via MCP but silently fail to provision; confirmed TechZone bug | IBM i Ansible Lab | Manual reservation required; bug raised with TechZone MCP team |

### 3. IBM Power recipes are genuinely more complex than what's in the marketplace today

Every existing CE marketplace recipe targets a SaaS platform. "Mock mode" means running a local stub — no platform access needed. For IBM Power recipes, the *point* is the hardware. Power10/Power11 includes the Matrix Math Accelerator (MMA) for AI inference. You cannot replicate that on an x86 laptop, and you cannot yet get Power10+ through PowerVS (fleet is still largely Power9). The template's "mock mode" concept had to be honestly adapted rather than pretended.

---

## Where things stand now

| Action | Owner | Status |
|---|---|---|
| Carbon GenAI recipe brief complete — aligned to new template | David | ✅ Done |
| Carbon GenAI TechZone migrated to v2 | David | ✅ Done (2026-09-04) |
| Carbon GenAI full deployment validated on RHEL 10.2 | David | ✅ Done (2026-09-04, 38 min clean install, all 4 services, Granite LLM confirmed) |
| Carbon GenAI end-to-end handoff test (second person, fresh environment) | TBD | **Next step** |
| Carbon GenAI PR to CE marketplace | David | After handoff test |
| PowerSC + Vault — final testing against new template | David | Next 2 weeks |
| watsonx.data — ongoing development, aligning to template in parallel | David | Ongoing |
| IBM i Ansible — align to template as Lab submission, resolve access | Joris | In progress |

---

## The bottom line

The team has been doing the right work. The recipes are real, they have been tested on real infrastructure, and one has already been tailored for a live client engagement (Premier Farnell). The Carbon GenAI recipe can be run today — end-to-end, on RHEL 10.2, in about 40 minutes from a cold start. The submission gap is a handoff test and a PR.

---

*EMEA AI on IBM Power Squad · September 2026*
