export const DEFAULTS = {
  free_form_text: `Campaign request: Create an executive modernisation brief for migrating our enterprise database estate to Cockroach Continuum on IBM Power.

Project details:
- Project: Continuum Estate Modernisation & Sovereign AI Architecture
- Organization: Global Banking Corporation
- Current footprint: 450+ legacy Oracle RAC and Amazon Aurora PostgreSQL clusters across Frankfurt, Dublin, and London
- Target architecture: Cockroach Continuum with Cluster Virtualization, Cockroach Plenum elastic storage, and IBM Granite 4.0 sovereign inference
- Primary objectives:
  1. Eliminate cross-region single points of failure with active-active distributed SQL
  2. Comply with EU DORA and GDPR digital operational resilience regulations
  3. Reduce database operational costs by 35% through Plenum usage-based storage (pay for bytes stored, not headroom)
  4. Empower DBAs with Cockroach Aegis AI agent for automated telemetry triage and capacity governance
- Timeline & Milestones:
  - Phase 1 (Q4 2026): 90-day pilot on SEPA Instant Payments (4,500 TPS)
  - Phase 2 (Q1-Q2 2027): Core banking ledger and cards transactional pipeline migration
- Success Metrics:
  - 99.9999% availability (zero unplanned downtime)
  - Sub-10ms p99 latency across all European regions
  - 100% elimination of cloud egress fees and data residency non-compliance

Tone and style:
- Tone: Strategic, architectural, confident, enterprise-grade
- Style: Clear executive summary, bulleted technical deliverables, and risk mitigation roadmap`,
  entities: [
    { label: 'Brief Title', definition: 'A concise title for the modernisation brief' },
    { label: 'Executive Objective', definition: 'The primary business and architectural goal in 1-2 sentences' },
    { label: 'Current State vs Target Architecture', definition: 'Summary of transition from legacy footprint (Oracle/Aurora) to Cockroach Continuum' },
    { label: 'Core Business Benefits', definition: 'Top 3 business outcomes (e.g., zero downtime, 35% TCO reduction, DORA compliance)' },
    { label: 'Key Technologies', definition: 'Core technical components (CockroachDB, Continuum, Plenum, Aegis, IBM Power MMA)' },
    { label: 'Implementation Timeline & Milestones', definition: 'Phased rollout schedule and key pilot targets' },
    { label: 'Risk Mitigation & Compliance', definition: 'How data sovereignty, active-active failover, and DORA requirements are satisfied' },
    { label: 'Success Metrics & KPIs', definition: 'Specific quantitative targets (availability, latency, cost reduction)' },
    { label: '', definition: '' },
  ],
};

export const EVENT_CAMPAIGN = {
  free_form_text: `Campaign request: Build an event campaign brief for our presence at the Future of Distributed Data & AI Summit.

Event details:
- Event: Distributed SQL & Sovereign AI Summit
- Format: In-person industry conference with sponsorship booth and keynote presentation
- Date: 18-19 November
- Location: London
- Company goal: Showcase CockroachDB + IBM Power hybrid sovereign architecture to 500+ enterprise CDOs, CTOs, and Lead DBAs
- Main offer: Active-Active Multi-Region Distributed Transactions + Sovereign On-Premises GenAI Inference
- Business problem solved: Eliminates data replication latency, cloud egress charges, and compliance friction
- Desired outcomes:
  1. Book 25+ executive architecture workshops
  2. Launch joint customer reference case study
  3. Drive pilot registrations for Cockroach Continuum
- Tone: Innovative, visionary, enterprise-hardened`,
  entities: [
    { label: 'Brief Title', definition: 'A concise title for the event campaign brief' },
    { label: 'Event Objective', definition: 'What the company needs to achieve before, during, and after the event' },
    { label: 'Audience and Personas', definition: 'Key event audience segments and buyer personas to target' },
    { label: 'Core Event Message', definition: 'Primary campaign message for the event audience' },
    { label: 'Pre-Event Plan', definition: 'Recommended actions and messaging before the event' },
    { label: 'At-Event Plan', definition: 'Recommended engagement approach during the event' },
    { label: 'Post-Event Follow-Up', definition: 'Suggested follow-up sequence and CTA after the event' },
    { label: 'Success Measures', definition: 'Suggested KPIs to evaluate event campaign performance' },
    { label: '', definition: '' },
  ],
};

export const PARTNER_ENABLEMENT = {
  free_form_text: `Campaign request: Create a partner enablement brief for joint go-to-market between Cockroach Labs and IBM Systems EMEA.

Partner details:
- Partners: Cockroach Labs & IBM Systems AI Squad
- Joint offer: The Zero-Downtime Sovereign Stack (Cockroach Continuum + IBM Power10/Power11)
- Target audience: Financial Services, Telecom, and Healthcare Enterprise Architects
- Joint value proposition:
  1. Distributed SQL scale with zero cloud vendor lock-in
  2. On-chip Matrix Math Acceleration for private GenAI inference without GPUs
  3. Total regulatory compliance for DORA, GDPR, and NIS2
- Enablement needs:
  1. Joint architectural whitepaper and benchmark data
  2. Field sales battlecard
  3. Customer presentation deck
- Tone: Collaborative, strategic, enterprise-ready`,
  entities: [
    { label: 'Brief Title', definition: 'A concise title for the partner enablement brief' },
    { label: 'Launch Objective', definition: 'The purpose of the joint launch and desired business outcome' },
    { label: 'Target Audience', definition: 'Who the partner motion should target and why they care' },
    { label: 'Joint Value Proposition', definition: 'A concise statement of the combined partner solution value' },
    { label: 'Positioning Guidance', definition: 'How the offer should be positioned by partner-facing teams' },
    { label: 'Partner Messaging Themes', definition: 'Three messaging themes partners can use in outreach and conversations' },
    { label: 'Recommended Assets', definition: 'Suggested enablement or campaign assets required for launch' },
    { label: 'Suggested CTA', definition: 'Best next step to ask of the audience' },
    { label: '', definition: '' },
  ],
};

// Made with Bob
