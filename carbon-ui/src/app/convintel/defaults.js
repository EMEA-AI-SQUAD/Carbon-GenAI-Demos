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

// Tab 2: Sales Call Analysis
export const SALES_CALL = {
  free_form_text: `Sales Rep: Good morning! This is Michael from TechSolutions. I'm following up on your inquiry about our enterprise software package.

Prospect: Hi Michael. Yes, I submitted a form last week. We're looking to upgrade our current CRM system.

Sales Rep: Excellent! Can you tell me about your current pain points with your existing system?

Prospect: Well, our team of 50 sales reps finds it slow and the reporting features are limited. We're also struggling with mobile access.

Sales Rep: I see. Our Enterprise Plus package would be perfect for your needs. It includes advanced analytics, mobile apps, and can handle teams up to 200 users. The implementation typically takes 4-6 weeks.

Prospect: What's the pricing like? We're working with a budget of around $50,000 annually.

Sales Rep: Our Enterprise Plus is $65,000 per year, but given your team size, I can offer a 15% discount bringing it to $55,250. That includes full support and quarterly training sessions.

Prospect: That's slightly over budget. What about the Professional tier?

Sales Rep: The Professional tier is $35,000 annually and covers up to 50 users, but it lacks some advanced features like AI-powered forecasting and custom integrations. However, you can upgrade anytime.

Prospect: Let me discuss with my team and get back to you next week. Can you send me a detailed comparison?

Sales Rep: Absolutely! I'll email you a comparison sheet and a demo video. Would Tuesday at 2 PM work for a follow-up call?

Prospect: Tuesday works. Talk to you then.

Sales Rep: Perfect! Looking forward to it. Have a great day!`,
  entities: [
    { label: "Lead Quality", definition: "Assessment of prospect potential (Hot, Warm, Cold, Qualified, Unqualified)" },
    { label: "Buying Intent", definition: "Likelihood of purchase (High, Medium, Low)" },
    { label: "Budget Range", definition: "Stated or implied budget amount" },
    { label: "Decision Timeline", definition: "Expected timeframe for decision (Immediate, 1-4 weeks, 1-3 months, 3+ months)" },
    { label: "Key Pain Points", definition: "Main problems prospect is trying to solve" },
    { label: "Competitors Mentioned", definition: "Other solutions being considered" },
    { label: "Next Steps", definition: "Agreed follow-up actions and timeline" },
    { label: "Objections Raised", definition: "Concerns or hesitations expressed" },
    { label: "", definition: "" } // optional spare row for the UI
  ]
};

// Tab 3: Support Ticket Analysis
export const SUPPORT_TICKET = {
  free_form_text: `Ticket #SUP-2024-1847
Priority: High
Created: 2024-03-20 09:15 AM

Customer: Our production server has been experiencing intermittent outages for the past 2 hours. This is affecting approximately 200 users and causing significant business disruption.

Support Agent (Level 1): Thank you for reporting this. I've checked our monitoring systems and can see elevated error rates on your instance. I'm escalating this to our Level 2 team immediately.

Support Agent (Level 2): I've reviewed the logs and identified a memory leak in the application server. This appears to be related to the recent update deployed on March 18th. I'm rolling back to the previous stable version now.

Customer: How long will the rollback take? We have critical end-of-quarter processing that needs to complete today.

Support Agent (Level 2): The rollback will take approximately 15 minutes. I'm also implementing additional monitoring to prevent this from recurring. Your system should be stable within 20 minutes.

Customer: Okay, please keep me updated. We may need to extend our processing window.

Support Agent (Level 2): Rollback complete. System is now stable and all services are operational. I've added enhanced monitoring and will watch for the next 2 hours. I'm also creating a bug report for the development team to fix the memory leak before the next update.

Customer: Thank you for the quick response. System is working normally now. Please ensure this doesn't happen again.

Support Agent (Level 2): Understood. I've documented everything and our development team will address the root cause. You'll receive a detailed incident report within 24 hours.`,
  entities: [
    { label: "Severity Level", definition: "Impact level of the issue (Critical, High, Medium, Low)" },
    { label: "Issue Type", definition: "Category of technical problem (Performance, Bug, Configuration, Security, etc.)" },
    { label: "Root Cause", definition: "Identified cause of the problem" },
    { label: "Resolution Time", definition: "Time taken to resolve the issue" },
    { label: "Business Impact", definition: "Effect on customer operations (High, Medium, Low)" },
    { label: "Escalation Level", definition: "Support tier that handled the issue (L1, L2, L3, Engineering)" },
    { label: "Preventive Actions", definition: "Steps taken to prevent recurrence" },
    { label: "Customer Satisfaction", definition: "Implied satisfaction level (Satisfied, Neutral, Dissatisfied)" },
    { label: "", definition: "" } // optional spare row for the UI
  ]
};

// Made with Bob