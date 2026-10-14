export const DEFAULTS = {
  free_form_text: `Cockroach Labs Architecture Review: Enterprise Database Modernisation & Continuum Assessment
Date: October 14, 2026, 14:00-15:00 CET
Participants: Rob Reid (VP Solutions Engineering, Cockroach Labs), Jag Jhajj (Principal Solutions Architect, Cockroach Labs), Dr. Elena Vance (Head of Core Banking Infrastructure, Global Financial Group)

Rob Reid: Good afternoon Elena. Thanks for setting up this session. We are thrilled to discuss how Global Financial Group can scale its mission-critical ledger and payment estates using CockroachDB and the new Cockroach Continuum architecture.

Elena Vance: Thanks Rob, hello Jag. To give you context: we currently operate over 450 database instances across Europe and North America—split between legacy Oracle RAC and AWS Aurora PostgreSQL. Our board has mandated two strict directives for 2027: first, zero cross-region downtime with active-active resilience under DORA compliance; second, total data sovereignty where European customer balances never leave local sovereign boundaries.

Jag Jhajj: That is right in our core sweet spot. CockroachDB was architected precisely for active-active multi-region topologies with strong serializable ACID consistency. With Cockroach Continuum and cluster virtualization, we can consolidate your 450 instances into unified, elastic estates on shared or dedicated infrastructure—reducing administrative sprawl significantly.

Elena Vance: One of our biggest pain points with Aurora was unexpected storage provisioning overhead and slow failovers during regional cloud disruptions. How does Continuum address that?

Jag Jhajj: Continuum introduces Cockroach Plenum, our usage-based storage layer. You pay strictly for the bytes stored, eliminating pre-provisioned storage buffers and saving an estimated 35-40% on storage TCO. Furthermore, failover is not a manual or minutes-long failover event; Raft consensus leaseholders automatically rebalance across healthy nodes in milliseconds.

Rob Reid: In addition, Elena, with Cockroach Aegis—our agentic AI database operator—your DBAs evolve from reactive firefighting to estate architects. Aegis monitors telemetry continuously across all regions, proactively detecting hotspots, rebalancing ranges, and providing automated SQL index tuning recommendations.

Elena Vance: That agentic aspect is fascinating. We are also evaluating running local AI models on our IBM Power infrastructure to query audit trails and transaction telemetry directly within our on-premises private clouds. What is the timeline and migration path?

Jag Jhajj: Because CockroachDB is wire-compatible with PostgreSQL, your application rewrite is minimal. We propose a 90-day pilot focusing on your tier-1 SEPA instant payments pipeline (approx. 4,500 TPS), targeting full production migration by Q2 2027.

Elena Vance: Our budget allocation for this modernisation program is approximately €1.8M annually. Can you prepare a formal technical validation proposal with the Aegis telemetry architecture and TCO breakdown by next Tuesday?

Rob Reid: Absolutely, Elena. Jag and I will compile the complete architecture document, migration benchmarks from Oracle/Aurora, and pilot milestones, and email them to you before Monday close of business.

Elena Vance: Excellent. Let's schedule our technical deep-dive for next Thursday at 10:00 CET.

Jag Jhajj: Perfect. Looking forward to it!`,
  entities: [
    { label: "Conversation Summary", definition: "A concise 2-3 sentence summary of the key points discussed in the conversation" },
    { label: "Industry Classification", definition: "The client's industry sector. Choose from: Finance, Manufacturing, Healthcare, Retail, Technology, Energy, Logistics, Education, Government, Other" },
    { label: "Call-to-Action", definition: "The primary next step or action required. Choose from: Send Proposal, Schedule Demo, Follow-up Call, Send Pricing, Technical Discussion, Contract Review, No Action Needed" },
    { label: "Client Name", definition: "Full name of the client contact person" },
    { label: "Client Company", definition: "Name of the client's organization" },
    { label: "Client Role", definition: "Job title or role of the client contact" },
    { label: "Budget Range", definition: "Stated or implied budget amount for the project" },
    { label: "Timeline", definition: "Expected implementation or decision timeline" },
    { label: "Key Pain Points", definition: "Main challenges or problems the client is trying to solve (e.g. DORA compliance, storage TCO, regional failover)" },
    { label: "Key Technologies Discussed", definition: "Database and infrastructure technologies mentioned (e.g. CockroachDB, Continuum, Aegis, Oracle RAC, Aurora)" },
    { label: "", definition: "" } // optional spare row for the UI
  ]
};

// Tab 2: Multilingual Customer Service with Sentiment Analysis
export const SALES_CALL = {
  free_form_text: `Kundenservice: Guten Tag, hier ist Markus von Cockroach Labs Enterprise Support. Wie kann ich Ihnen heute helfen?

Kunde: Hallo Markus! Hier ist Christian Berger von Swiss FinTech Payments. Wir sehen seit 15 Minuten einen dramatischen Latenzanstieg auf unserem 9-Knoten-CockroachDB-Cluster in Frankfurt und Zürich! Unsere P99-Latenz ist von 4ms auf über 380ms gesprungen!

Kundenservice: Guten Tag Herr Berger, ich verstehe den Ernst der Lage vollkommen. Ich öffne sofort das Dashboard Ihres Produktionsclusters. Können Sie mir kurz Ihre Cluster-ID bestätigen?

Kunde: Ja, es ist Cluster 'ch-prod-banking-04'. Unsere Instant-Payment-Transaktionen laufen ins Timeout, das kostet uns pro Minute tausende Franken! Bitte helfen Sie uns sofort!

Kundenservice: Ich sehe den Cluster jetzt live. Die 9 Knoten sind alle gesund, aber ich sehe auf Knoten 3 in Zürich eine extreme Auslastung bei Raft-Leaseholder-Anfragen. Es sieht so aus, als ob ein unausgeglichener Batch-Job läuft, der Hotspots auf dem Range der Transaktionstabelle erzeugt.

Kunde: Ah! Unser Data-Science-Team hat vorhin einen unindizierten Analyse-Lauf für Betrugserkennung gestartet!

Kundenservice: Genau das ist die Ursache. Ich aktiviere jetzt über Cockroach Aegis eine dynamische Range-Split-Empfehlung und drossele die Priorität des Batch-Benutzers auf Hintergrundniveau, damit Ihre OLTP-Zahlungen wieder freie Bahn haben.

[2 Minuten später]

Kundenservice: So, der Range-Split ist durch und die Leaseholder sind wieder gleichmäßig über Frankfurt und Zürich verteilt. Können Sie die P99-Latenz überprüfen?

Kunde: Unglaublich! Die Latenz ist sofort wieder auf 3,8 Millisekunden gefallen! Alle Zahlungen fließen wieder ohne Verzögerung. Vielen herzlichen Dank für die blitzschnelle Ursachenanalyse!

Kundenservice: Sehr gerne, Herr Berger. Ich hinterlege im Ticket auch eine Empfehlung für einen sekundären Index für Ihr Analytics-Team, damit solche Abfragen künftig isoliert bleiben.

Kunde: Großartig, Markus! Sie haben uns den Tag gerettet. Auf Wiederhören!`,
  entities: [
    { label: "Conversation Summary (English)", definition: "A concise 2-3 sentence summary of the conversation in English, regardless of the original language" },
    { label: "Original Language", definition: "The primary language of the conversation. Choose from: English, German, French, Spanish, Italian, Dutch, Portuguese, Other" },
    { label: "Initial Sentiment", definition: "Customer's emotional state at the start. Choose from: Very Positive, Positive, Neutral, Frustrated, Angry, Very Angry" },
    { label: "Final Sentiment", definition: "Customer's emotional state at the end. Choose from: Very Positive, Positive, Neutral, Frustrated, Angry, Very Angry" },
    { label: "Sentiment Journey", definition: "Brief description of how sentiment changed during the conversation" },
    { label: "Urgency Level", definition: "Priority of the issue. Choose from: Critical, High, Medium, Low" },
    { label: "Issue Category", definition: "Type of problem. Choose from: Database Latency, Hotspot Contention, Raft Rebalancing, Outage, Billing, General Inquiry" },
    { label: "Resolution Status", definition: "Outcome of the conversation. Choose from: Resolved, Partially Resolved, Escalated, Pending Follow-up, Unresolved" },
    { label: "Customer Satisfaction", definition: "Implied satisfaction at end. Choose from: Very Satisfied, Satisfied, Neutral, Dissatisfied, Very Dissatisfied" },
    { label: "Root Cause Identified", definition: "Technical explanation of what triggered the issue" },
    { label: "Follow-up Required", definition: "Whether additional follow-up is needed. Choose from: Yes, No" },
    { label: "", definition: "" } // optional spare row for the UI
  ]
};

// Tab 3: Meeting Intelligence & Action Items
export const SUPPORT_TICKET = {
  free_form_text: `Cockroach Continuum & AI-Ready Estate Architecture Strategy Session
Date: October 14, 2026, 11:00-12:30 CET
Attendees: Rob Reid (VP Engineering, Cockroach Labs), Jag Jhajj (Solutions Architect), David Spurway (IBM Power AI Squad Lead), Marcus Weber (Cloud Architect)

Rob Reid: Welcome everyone. Today's goal is to align on the technical reference architecture combining CockroachDB distributed data estates with IBM Power sovereign AI inference.

Jag Jhajj: On the database side, Cockroach Continuum provides cluster virtualization, allowing multi-tenant enterprise applications to run on isolated virtual databases while sharing elastic compute. When combined with our pgvector search extension, enterprise AI agents can store contextual embeddings directly in CockroachDB.

David Spurway: From the IBM Power perspective, running IBM Granite 4.0 on Power10 and Power11 using Matrix Math Accelerators allows clients to execute LLM reasoning and agentic workflows right beside the database. There is zero cloud latency, zero data egress risk, and no GPU power penalty.

Marcus Weber: For our European banking customers governed by the EU AI Act and DORA, this architecture is a massive breakthrough: resilient multi-region database consistency paired with sovereign, on-premises AI inference.

Rob Reid: Let's establish action items:
1. Jag to produce the reference topology diagram for Cockroach Continuum + IBM Power MMA by Friday.
2. David to benchmark Granite 4.0 inference throughput for telemetry parsing by next Wednesday.
3. Marcus to draft the compliance whitepaper on DORA resilience and zero-egress data sovereignty.

Jag Jhajj: Agreed. I will also incorporate benchmarks from our DoorDash and OpenAI customer proof points.

David Spurway: Sounds fantastic. We'll reconvene next Thursday at 15:00 CET for the final review.`,
  entities: [
    { label: "Meeting Summary", definition: "A concise 2-3 sentence summary of the meeting's key discussion points and outcomes" },
    { label: "Meeting Type", definition: "Category of meeting. Choose from: Planning, Review, Brainstorm, Decision-making, Status Update, Strategy, Other" },
    { label: "Key Decisions Made", definition: "List of important decisions reached during the meeting with brief context" },
    { label: "Action Item 1", definition: "First action item with format: 'Task description | Owner | Deadline'" },
    { label: "Action Item 2", definition: "Second action item with format: 'Task description | Owner | Deadline'" },
    { label: "Action Item 3", definition: "Third action item with format: 'Task description | Owner | Deadline'" },
    { label: "Key Technologies", definition: "Technologies and architectures discussed (CockroachDB, Continuum, IBM Power, Granite 4.0, pgvector)" },
    { label: "Regulatory Context", definition: "Compliance regulations mentioned (e.g. DORA, EU AI Act, GDPR)" },
    { label: "Next Meeting", definition: "Date and agenda for the next meeting if mentioned" },
    { label: "", definition: "" } // optional spare row for the UI
  ]
};

// Made with Bob
