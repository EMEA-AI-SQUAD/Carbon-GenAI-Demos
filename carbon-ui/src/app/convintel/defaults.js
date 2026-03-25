export const DEFAULTS = {
  free_form_text: `Customer: Hi, I'm calling about my recent order #ORD-2024-5891. I placed it three weeks ago and still haven't received it.

Agent: I apologize for the delay. Let me look that up for you. Can I have your email address to verify your account?

Customer: Sure, it's sarah.johnson@email.com. I'm getting really frustrated because I paid for express shipping.

Agent: I understand your frustration, Ms. Johnson. I see your order here. It looks like there was a warehouse issue that caused the delay. The item shipped yesterday and should arrive by Friday.

Customer: That's not acceptable! I needed this for an event last week. I want a full refund and compensation for the inconvenience.

Agent: I completely understand. Let me process a full refund right away and I'll also add a $50 credit to your account for the trouble. Would that be satisfactory?

Customer: Well, I suppose that's fair. Can you confirm the refund will go back to my credit card ending in 4532?

Agent: Yes, the refund of $127.99 will be processed to your card ending in 4532 within 3-5 business days. Is there anything else I can help you with today?

Customer: No, that's all. Thank you for resolving this quickly.

Agent: You're welcome, Ms. Johnson. We've also noted your feedback about the warehouse delay. Have a great day!`,
  entities: [
    { label: "Customer Sentiment", definition: "Overall emotional tone of the customer (Positive, Neutral, Negative, Mixed)" },
    { label: "Issue Category", definition: "Primary type of customer issue (Delivery Delay, Product Quality, Billing, Technical Support, etc.)" },
    { label: "Resolution Status", definition: "Whether the issue was resolved (Resolved, Partially Resolved, Unresolved, Escalated)" },
    { label: "Agent Performance", definition: "Quality of agent's handling (Excellent, Good, Satisfactory, Needs Improvement)" },
    { label: "Key Action Items", definition: "Specific actions taken or promised (refunds, credits, follow-ups, etc.)" },
    { label: "Customer Effort Score", definition: "Estimated effort required by customer (Low, Medium, High)" },
    { label: "Escalation Required", definition: "Whether issue needs escalation (Yes/No)" },
    { label: "Follow-up Needed", definition: "Whether follow-up contact is required (Yes/No)" },
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