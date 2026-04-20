export const DEFAULTS = {
  free_form_text: `Campaign request: Create a launch brief for a new product feature called Smart Route Optimizer.

Product details:
- Feature: Smart Route Optimizer
- Product: FleetFlow logistics platform
- What it does: Uses AI to recommend more efficient delivery routes based on traffic, depot constraints, weather, and delivery priority
- Primary benefit: Reduces fuel usage and late deliveries while helping dispatchers plan faster
- Launch type: Existing product feature launch
- Launch timing: Mid-May
- Target audience: Operations directors, dispatch managers, and logistics transformation leads at mid-sized transport and distribution companies
- Geography: UK and Northern Europe
- Differentiators:
  1. Runs recommendations inside the customer's existing planning workflow
  2. Gives planners explanations for why route changes are suggested
  3. Designed for companies that need data to stay within their own environment
- Customer pain points:
  1. Rising fuel costs
  2. Frequent route changes due to delays and road disruptions
  3. Too much manual planning effort
  4. Pressure to improve service reliability and sustainability KPIs

Tone and style:
- Tone: Confident, practical, business-focused
- Style: Clear, concise, enterprise B2B marketing language
- Avoid: Hype, buzzwords, unsupported claims

Required output guidance:
- Emphasize business outcomes over technical detail
- Include a clear primary message and supporting proof points
- Make the CTA suitable for a feature launch campaign
- Assume this brief will be used by campaign, content, digital, and sales teams`,
  entities: [
    { label: 'Brief Title', definition: 'A concise title for the campaign brief' },
    { label: 'Campaign Objective', definition: 'The primary business goal of the campaign in 1-2 sentences' },
    { label: 'Target Audience', definition: 'Who the campaign is for, including roles, segment, and geography' },
    { label: 'Key Message', definition: 'The single most important message the audience should remember' },
    { label: 'Supporting Messages', definition: 'Three short supporting proof points or sub-messages' },
    { label: 'Tone and Style Guidance', definition: 'Instructions describing the desired tone, style, and wording approach' },
    { label: 'Call to Action', definition: 'Primary CTA the campaign should drive' },
    { label: 'Channels and Assets', definition: 'Recommended channels/assets to activate for this brief' },
    { label: 'Success Measures', definition: 'Suggested KPIs or success metrics for the campaign' },
    { label: '', definition: '' },
  ],
};

export const EVENT_CAMPAIGN = {
  free_form_text: `Campaign request: Build an event campaign brief for our presence at the Future of Manufacturing Summit in Munich.

Event details:
- Event: Future of Manufacturing Summit
- Format: In-person industry conference with sponsorship booth and speaking session
- Date: 18-19 June
- Location: Munich
- Company goal: Generate qualified meetings and pipeline for our industrial AI monitoring solution
- Audience: Plant managers, heads of operations, digital transformation leads, and manufacturing IT leaders
- Main offer: AI-powered equipment anomaly detection running on-premises
- Business problem solved: Reduces unplanned downtime and improves maintenance decision-making
- Key differentiators:
  1. On-premises deployment for data-sensitive manufacturing environments
  2. Fast time to insight from existing machine data
  3. Works alongside current operational systems without major replacement
- Desired outcomes:
  1. Book executive meetings at the event
  2. Drive post-event demo requests
  3. Build awareness before the keynote session
- Available channels:
  1. Email
  2. LinkedIn paid and organic
  3. SDR outreach
  4. Landing page
  5. Event signage and booth messaging
- Tone: Senior, credible, outcome-driven
- Style: Executive B2B, direct, modern, no jargon overload`,
  entities: [
    { label: 'Brief Title', definition: 'A concise title for the event campaign brief' },
    { label: 'Event Objective', definition: 'What the company needs to achieve before, during, and after the event' },
    { label: 'Audience and Personas', definition: 'Key event audience segments and buyer personas to target' },
    { label: 'Core Event Message', definition: 'Primary campaign message for the event audience' },
    { label: 'Pre-Event Plan', definition: 'Recommended actions and messaging before the event' },
    { label: 'At-Event Plan', definition: 'Recommended engagement approach during the event' },
    { label: 'Post-Event Follow-Up', definition: 'Suggested follow-up sequence and CTA after the event' },
    { label: 'Content and Asset Needs', definition: 'Key assets required to execute the event campaign' },
    { label: 'Success Measures', definition: 'Suggested KPIs to evaluate event campaign performance' },
    { label: '', definition: '' },
  ],
};

export const PARTNER_ENABLEMENT = {
  free_form_text: `Campaign request: Create a partner enablement brief for a joint solution launch with NorthBridge Consulting.

Partner details:
- Partner: NorthBridge Consulting
- Joint offer: Advisory plus implementation package for our secure document intelligence platform
- Launch goal: Enable NorthBridge sales and marketing teams to position the joint solution to financial services clients
- Target audience: Banking operations leaders, compliance teams, and transformation sponsors
- Joint value proposition:
  1. Faster document-heavy process modernization
  2. Stronger governance and auditability
  3. Lower risk by keeping sensitive information within controlled environments
- Enablement needs:
  1. Clear positioning statement
  2. Sales talk track
  3. Campaign themes for partner outreach
  4. Recommended launch assets
- Constraints:
  1. Messaging must reflect both brands
  2. Claims must stay conservative and credible
  3. Output should be useful for internal enablement first, then adaptable for external use
- Tone: Collaborative, trusted-advisor, enterprise-ready
- Style: Concise, practical, partner-friendly, compliant
- Timing: Partner kickoff in two weeks`,
  entities: [
    { label: 'Brief Title', definition: 'A concise title for the partner enablement brief' },
    { label: 'Launch Objective', definition: 'The purpose of the joint launch and desired business outcome' },
    { label: 'Target Audience', definition: 'Who the partner motion should target and why they care' },
    { label: 'Joint Value Proposition', definition: 'A concise statement of the combined partner solution value' },
    { label: 'Positioning Guidance', definition: 'How the offer should be positioned by partner-facing teams' },
    { label: 'Partner Messaging Themes', definition: 'Three messaging themes partners can use in outreach and conversations' },
    { label: 'Recommended Assets', definition: 'Suggested enablement or campaign assets required for launch' },
    { label: 'Suggested CTA', definition: 'Best next step to ask of the audience' },
    { label: 'Execution Notes', definition: 'Important guidance, constraints, or coordination notes for launch execution' },
    { label: '', definition: '' },
  ],
};

// Made with Bob