export const DEFAULTS = {
  free_form_text: `Sales Agent: Good afternoon, this is Sophie Laurent from G2 EMEA. Am I speaking with Thomas Müller?

Client: Yes, speaking. Hello Sophie.

Sales Agent: Excellent! Thank you for taking my call. I'm reaching out because you recently downloaded our buyer intent report for the financial services sector. I wanted to see if you had a chance to review it and whether you'd like to discuss how G2's solutions could help Deutsche FinTech Solutions increase your market visibility.

Client: Yes, I did have a look. We're currently exploring ways to improve our lead generation, particularly in the DACH region. Our marketing team is struggling to identify prospects who are actively researching solutions like ours.

Sales Agent: That's exactly what we specialise in. We work with over 200 financial technology companies across Europe. Can you tell me a bit more about your current challenges? What's your primary goal for the next quarter?

Client: Well, we've just launched a new payment processing platform, and we need to reach CFOs and finance directors at mid-sized enterprises - companies with 100 to 500 employees. Our sales team is spending too much time on cold outreach with low conversion rates. We need warmer leads.

Sales Agent: I understand completely. We have two main solutions that could help. First, our Buyer Intent data identifies companies actively researching payment processing solutions on G2 - we track over 90 million buyers annually. Second, our Review Generation programme helps you build social proof, which is crucial in financial services where trust is paramount. Which approach sounds more aligned with your immediate needs?

Client: The buyer intent data sounds very interesting. How does that actually work in practice?

Sales Agent: Great question. We track anonymous visitors to your G2 profile and your competitors' profiles. When a company shows high intent - for example, viewing multiple payment processing solutions, reading reviews, and comparing features - we identify that company and provide you with their details, including company size, location, and the specific solutions they're researching. Your sales team can then reach out with highly targeted messaging.

Client: That could be quite valuable. What about pricing? We have a budget of approximately €50,000 for marketing technology this year, and we're already using Salesforce and HubSpot.

Sales Agent: Perfect - we integrate seamlessly with both platforms. For your requirements, our Professional Intent package would be ideal. It's €3,500 per month, which includes up to 150 qualified intent signals monthly, CRM integration, and a dedicated customer success manager. That's €42,000 annually, well within your budget. We also offer a 90-day pilot programme if you'd like to test the ROI before committing to the full year.

Client: The pilot sounds sensible. What kind of results are your financial services clients seeing?

Sales Agent: Excellent question. Our FinTech clients typically see a 40-60% increase in qualified pipeline within the first quarter. For example, PaymentHub in Amsterdam saw a 55% increase in demo bookings and reduced their sales cycle from 90 days to 60 days. I can send you a detailed case study if that would be helpful.

Client: Yes, please do. I'll need to discuss this with our CMO, Rebecca Schmidt, and our Head of Sales. Can you send me a proposal with the case studies and implementation timeline?

Sales Agent: Absolutely. I'll prepare a comprehensive proposal and send it to your email by tomorrow morning. Would you prefer I include information about our Review Generation programme as well, or focus solely on the Buyer Intent solution for now?

Client: Let's focus on the intent data for now. We can explore reviews in a future conversation.

Sales Agent: Perfect. I'll send everything to thomas.muller@deutschefintech.de - is that correct?

Client: Yes, that's correct.

Sales Agent: Wonderful. I'll also include some information about our GDPR compliance and data privacy measures, as I know that's critical for financial services companies. Would next Thursday at 10:00 CET work for a follow-up call to discuss the proposal with you and your team?

Client: Thursday at 10:00 works well. I'll have Rebecca join the call as well.

Sales Agent: Excellent! I'll send a calendar invitation. Thank you for your time today, Thomas. I look forward to speaking with you and Rebecca next week.

Client: Thank you, Sophie. Speak soon.`,
  entities: [
    { label: "Conversation Summary", definition: "A concise 2-3 sentence summary of the key points discussed in the conversation" },
    { label: "Industry Classification", definition: "The client's industry sector. Choose from: Finance, Manufacturing, Healthcare, Retail, Technology, Energy, Logistics, Education, Government, Other" },
    { label: "Call-to-Action", definition: "The primary next step or action required. Choose from: Send Proposal, Schedule Demo, Follow-up Call, Send Pricing, Technical Discussion, Contract Review, No Action Needed" },
    { label: "Client Name", definition: "Full name of the client contact person" },
    { label: "Client Company", definition: "Name of the client's organization" },
    { label: "Client Role", definition: "Job title or role of the client contact" },
    { label: "Budget Range", definition: "Stated or implied budget amount for the project" },
    { label: "Timeline", definition: "Expected implementation or decision timeline" },
    { label: "Key Pain Points", definition: "Main challenges or problems the client is trying to solve" },
    { label: "Competitors Mentioned", definition: "Any competing solutions or vendors mentioned" },
    { label: "", definition: "" } // optional spare row for the UI
  ]
};

// Tab 2: Multilingual Customer Service with Sentiment Analysis
export const SALES_CALL = {
  free_form_text: `Kundenservice: Guten Tag, hier ist Anna von TechSupport Deutschland. Wie kann ich Ihnen heute helfen?

Kunde: Endlich! Ich warte schon seit 45 Minuten in der Warteschleife! Das ist absolut inakzeptabel!

Kundenservice: Es tut mir sehr leid für die lange Wartezeit, Herr Schmidt. Ich verstehe Ihre Frustration vollkommen. Lassen Sie mich Ihnen sofort helfen. Was ist das Problem?

Kunde: Unser gesamtes System ist seit heute Morgen 8 Uhr ausgefallen. Wir haben 30 Mitarbeiter, die nicht arbeiten können! Das kostet uns Tausende von Euro pro Stunde! Ich habe bereits drei E-Mails geschickt und niemand hat geantwortet!

Kundenservice: Das ist natürlich eine sehr ernste Situation. Ich sehe hier Ihre E-Mails und entschuldige mich, dass wir nicht schneller reagiert haben. Lassen Sie mich sofort Ihre Kundennummer überprüfen. Können Sie mir bitte Ihre Vertragsnummer geben?

Kunde: Die Vertragsnummer ist DE-2024-8756. Aber ich brauche keine Überprüfung, ich brauche eine Lösung! Sofort!

Kundenservice: Ich verstehe, Herr Schmidt. Ich habe Ihr Konto jetzt geöffnet. Ich sehe, dass Sie unseren Premium-Support-Vertrag haben, was bedeutet, dass ich dies sofort an unser technisches Notfallteam eskalieren kann. Können Sie mir kurz beschreiben, welche Fehlermeldung Sie sehen?

Kunde: Es kommt eine Meldung "Verbindung zum Server fehlgeschlagen - Error 503". Alle unsere Anwendungen sind betroffen - CRM, E-Mail, Buchhaltung, alles!

Kundenservice: Danke für diese Information. Error 503 deutet auf ein Serverproblem hin. Ich erstelle jetzt ein Notfall-Ticket mit höchster Priorität und verbinde Sie direkt mit unserem Senior-Techniker, Markus Weber. Er ist unser Spezialist für solche Fälle. Können Sie bitte einen Moment in der Leitung bleiben?

Kunde: Ja, aber bitte schnell!

[2 Minuten Wartezeit]

Senior-Techniker: Guten Tag, Herr Schmidt. Hier ist Markus Weber vom technischen Team. Ich habe bereits Ihre Systemlogs überprüft. Wir hatten heute Morgen um 7:45 Uhr ein automatisches Update, das bei einigen Kunden zu Problemen geführt hat. Ich kann das Update für Sie zurückrollen. Das dauert etwa 10 Minuten.

Kunde: Endlich jemand, der weiß, was er tut! Ja, bitte machen Sie das sofort!

Senior-Techniker: Ich starte den Rollback jetzt. Sie sollten in etwa 8-10 Minuten wieder Zugriff haben. Ich bleibe die ganze Zeit in der Leitung und überwache den Prozess. Außerdem werde ich sicherstellen, dass Ihr System von zukünftigen automatischen Updates ausgenommen wird, bis wir das Problem vollständig gelöst haben.

Kunde: Das klingt gut. Ich schätze, dass Sie sich jetzt persönlich darum kümmern.

[8 Minuten später]

Senior-Techniker: Herr Schmidt, der Rollback ist abgeschlossen. Können Sie bitte versuchen, sich anzumelden?

Kunde: Moment... Ja! Es funktioniert wieder! Alle Systeme sind online. Gott sei Dank!

Senior-Techniker: Ausgezeichnet! Ich habe auch eine Gutschrift von zwei Wochen auf Ihren nächsten Rechnungszyklus hinzugefügt als Entschädigung für die Unannehmlichkeiten. Außerdem erhalten Sie einen detaillierten Bericht über den Vorfall bis morgen Mittag.

Kunde: Das ist sehr fair. Vielen Dank für Ihre schnelle Hilfe, Herr Weber. Und auch Danke an Anna, die mich sofort weitergeleitet hat. Ich war am Anfang sehr wütend, aber Sie haben das wirklich professionell gelöst.

Kundenservice (Anna): Sehr gerne, Herr Schmidt. Es tut uns nochmals leid für die Unannehmlichkeiten. Gibt es noch etwas, womit wir Ihnen helfen können?

Kunde: Nein, das war alles. Danke und einen schönen Tag noch!`,
  entities: [
    { label: "Conversation Summary (English)", definition: "A concise 2-3 sentence summary of the conversation in English, regardless of the original language" },
    { label: "Original Language", definition: "The primary language of the conversation. Choose from: English, German, French, Spanish, Italian, Dutch, Portuguese, Other" },
    { label: "Initial Sentiment", definition: "Customer's emotional state at the start. Choose from: Very Positive, Positive, Neutral, Frustrated, Angry, Very Angry" },
    { label: "Final Sentiment", definition: "Customer's emotional state at the end. Choose from: Very Positive, Positive, Neutral, Frustrated, Angry, Very Angry" },
    { label: "Sentiment Journey", definition: "Brief description of how sentiment changed during the conversation" },
    { label: "Urgency Level", definition: "Priority of the issue. Choose from: Critical, High, Medium, Low" },
    { label: "Issue Category", definition: "Type of problem. Choose from: Technical Outage, Performance, Billing, Account Access, Feature Request, General Inquiry, Other" },
    { label: "Resolution Status", definition: "Outcome of the conversation. Choose from: Resolved, Partially Resolved, Escalated, Pending Follow-up, Unresolved" },
    { label: "Customer Satisfaction", definition: "Implied satisfaction at end. Choose from: Very Satisfied, Satisfied, Neutral, Dissatisfied, Very Dissatisfied" },
    { label: "Business Impact", definition: "Effect on customer's business operations" },
    { label: "Compensation Offered", definition: "Any credits, refunds, or compensation provided" },
    { label: "Follow-up Required", definition: "Whether additional follow-up is needed. Choose from: Yes, No" },
    { label: "", definition: "" } // optional spare row for the UI
  ]
};

// Tab 3: Meeting Intelligence & Action Items
export const SUPPORT_TICKET = {
  free_form_text: `Product Strategy Meeting - Q2 2024 Planning
Date: March 25, 2024, 10:00-11:30 AM CET
Attendees: Sarah Chen (Product Director), Marcus Weber (Engineering Lead), Lisa Anderson (UX Lead), James O'Brien (Marketing Manager)

Sarah Chen: Good morning everyone. Thanks for joining. Today we need to finalize our Q2 roadmap and make some key decisions about the mobile app redesign. Let's start with where we are. Marcus, can you give us a status update on the current development sprint?

Marcus Weber: Sure. We're 80% through Sprint 23. The API performance improvements are complete and tested. However, we've hit a blocker with the new authentication system - it's not compatible with our legacy user database. We need to decide whether to refactor the database or build a compatibility layer.

Sarah Chen: That's a critical decision. What's your recommendation?

Marcus Weber: The compatibility layer is faster - about 2 weeks. But refactoring the database is the right long-term solution, though it'll take 6 weeks. My team recommends the refactor, but we'd need to push the mobile app launch from May to July.

Lisa Anderson: From a UX perspective, I'd rather have a solid foundation. We've been getting user complaints about slow login times. If we do the refactor properly, we can improve performance significantly. I support the 6-week option.

James O'Brien: Marketing perspective - we've already announced a May launch to our beta users. Pushing to July could damage credibility. Can we do a phased approach? Launch basic features in May and add the performance improvements in June?

Sarah Chen: That's an interesting compromise. Marcus, is that technically feasible?

Marcus Weber: Yes, we could do that. We'd launch with the compatibility layer in May, then do the database refactor in the background and switch over in June. It means doing the work twice, but it keeps us on schedule.

Sarah Chen: Okay, let's go with the phased approach. Marcus, you'll own the technical implementation. Target is May 15th for initial launch, June 30th for the performance upgrade. James, you'll need to manage communications about the phased rollout. Lisa, I need you to prioritize which features go into the May release versus June.

Lisa Anderson: Got it. I'll have a feature priority list by end of this week. One thing though - we still haven't resolved the navigation redesign debate. The user testing showed mixed results. Some users loved the bottom navigation, others preferred the hamburger menu.

James O'Brien: The analytics show that 65% of our users are on iOS, and iOS users strongly prefer bottom navigation. I think we should go with that.

Marcus Weber: From an engineering standpoint, bottom navigation is actually simpler to implement. It's also more accessible. I vote for bottom navigation.

Sarah Chen: Agreed. Let's go with bottom navigation. Lisa, can you finalize those designs by next Tuesday?

Lisa Anderson: Yes, I'll have them ready for review by Tuesday afternoon.

Sarah Chen: Perfect. Now, let's talk about the AI features roadmap. We've had requests for AI-powered search and recommendations. James, what's the market demand looking like?

James O'Brien: It's huge. Our competitor analysis shows that 4 out of 5 major competitors have launched AI features in the last quarter. We're falling behind. I think we need to prioritize this for Q3 at the latest.

Sarah Chen: Marcus, what's the technical feasibility?

Marcus Weber: We'd need to integrate with an AI service provider. I've been evaluating options - we could use IBM watsonx, OpenAI, or build something custom. IBM watsonx makes the most sense for our enterprise customers due to data privacy and compliance. Implementation would take about 8-10 weeks.

Sarah Chen: Okay, let's plan for Q3. Marcus, I need you to prepare a detailed technical proposal with cost estimates by April 15th. James, you'll work on the business case and ROI projections. We'll present to the executive team in late April.

Lisa Anderson: Should I start thinking about the UX for AI features?

Sarah Chen: Yes, but keep it exploratory for now. We need executive approval first. Do some concept designs that we can use in the presentation.

Marcus Weber: One more thing - we need to discuss the infrastructure costs. Our cloud spending has increased 40% this quarter due to the increased user base. We need to either optimize our architecture or increase the budget.

Sarah Chen: That's concerning. Can you quantify the optimization potential?

Marcus Weber: My team estimates we can reduce costs by 25-30% through better caching, database optimization, and moving some workloads to reserved instances. But it'll take dedicated engineering time - probably 3-4 weeks of work.

Sarah Chen: That's a good ROI. Let's make that a priority for April. Marcus, assign someone from your team to lead the optimization project. I want weekly progress reports.

Marcus Weber: Will do. I'll assign Chen Li - she's our infrastructure specialist.

Sarah Chen: Excellent. Let me summarize our action items and decisions. Any questions before we wrap up?

James O'Brien: Just one - when's our next strategy meeting?

Sarah Chen: Let's schedule for April 22nd, same time. That gives us time to complete the AI proposal and see progress on the mobile launch. I'll send out the calendar invite.

Lisa Anderson: Sounds good. Thanks everyone!`,
  entities: [
    { label: "Meeting Summary", definition: "A concise 2-3 sentence summary of the meeting's key discussion points and outcomes" },
    { label: "Meeting Type", definition: "Category of meeting. Choose from: Planning, Review, Brainstorm, Decision-making, Status Update, Strategy, Other" },
    { label: "Key Decisions Made", definition: "List of important decisions reached during the meeting with brief context" },
    { label: "Action Item 1", definition: "First action item with format: 'Task description | Owner | Deadline'" },
    { label: "Action Item 2", definition: "Second action item with format: 'Task description | Owner | Deadline'" },
    { label: "Action Item 3", definition: "Third action item with format: 'Task description | Owner | Deadline'" },
    { label: "Action Item 4", definition: "Fourth action item with format: 'Task description | Owner | Deadline'" },
    { label: "Action Item 5", definition: "Fifth action item with format: 'Task description | Owner | Deadline'" },
    { label: "Open Questions", definition: "Topics or issues that require follow-up or further discussion" },
    { label: "Key Priorities", definition: "Top 2-3 priorities identified in the meeting" },
    { label: "Next Meeting", definition: "Date and agenda for the next meeting if mentioned" },
    { label: "Budget/Resource Concerns", definition: "Any budget, resource, or capacity issues discussed" },
    { label: "", definition: "" } // optional spare row for the UI
  ]
};

// Made with Bob