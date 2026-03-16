export const DEFAULTS = {
  free_form_text: `Hello, I am Sophie Müller. I am writing to you to report an unauthorised transaction on my credit card. On 30th March 2023, I noticed a charge of €1,200 on my credit card statement that I did not authorise. The transaction was made at a restaurant in Paris, whilst I was in Berlin on that day. I am concerned about the security of my account and I would appreciate if you could investigate this matter promptly. Please contact me at my phone number +49 30 12345678 or email me at sophie.mueller@email.de to provide me with an update on the investigation. My card number is 5425233430109903. I look forward to hearing from you soon.`,
  entities: [
    { label: "Person Name", definition: "The full name of the person submitting the complaint" },
    { label: "Email Address", definition: "The email contact information" },
    { label: "Phone Number", definition: "The telephone contact number including country code" },
    { label: "Credit Card Number", definition: "The credit card number mentioned in the complaint" },
    { label: "Transaction Amount", definition: "The monetary amount of the unauthorised transaction, including currency symbol (e.g., €1,200)" },
    { label: "Transaction Location", definition: "The location where the unauthorised transaction occurred" },
    { label: "Transaction Date", definition: "The date when the unauthorised transaction occurred" },
    { label: "Person Location", definition: "Where the person was located at the time of the transaction" },
    { label: "", definition: "" } // optional spare row for the UI
  ]
};

// Tab 3: Unstructured Data Discovery - Document Scan (Elinar-inspired)
export const DOCUMENT_SCAN = {
  free_form_text: `PROJECT STATUS UPDATE - Q1 2024

Project Phoenix Migration - Internal Memo

Date: 15 January 2024
From: IT Operations Team
Subject: Legacy System Data Audit Progress

Team Update:
Our data migration project is progressing well. Lead developer Anna Kowalski (anna.kowalski@techcorp.eu, +48 22 123 4567) has completed the initial database schema review. The technical architecture team, headed by Marcus Weber, identified 847 legacy files requiring assessment.

Key Findings:
- Customer database contains approximately 125,000 records
- Employee records system holds data from 2015-present
- Marketing automation platform includes email campaigns sent to 89,000 subscribers

Action Items:
1. Anna to coordinate with Data Protection Officer by 25 January
2. Marcus Weber (m.weber@techcorp.eu) to prepare compliance documentation
3. Schedule review meeting for 1 February 2024 at Berlin office

Technical Notes:
The Phoenix system architecture uses PostgreSQL 14.2 with Redis caching layer. Migration scripts are stored in repository phoenix-migration-2024. Initial testing shows 99.7% data integrity across test environments.

Contact: For questions, reach Anna Kowalski at extension 4567 or Marcus at +49 30 987 6543.

End of memo.`,
  entities: [
    { label: "Person Name", definition: "Full names of individuals mentioned in the document" },
    { label: "Email Address", definition: "Email addresses of employees or contacts" },
    { label: "Phone Number", definition: "Phone numbers including country codes and extensions" },
    { label: "Job Title/Role", definition: "Professional roles or positions mentioned" },
    { label: "Office Location", definition: "Physical office or workplace locations" },
    { label: "Date", definition: "Specific dates mentioned in the document" },
    { label: "Record Count", definition: "Numbers indicating quantities of personal data records (e.g., '125,000 records', '89,000 subscribers')" },
    { label: "", definition: "" } // optional spare row for the UI
  ]
};

// Made with Bob
