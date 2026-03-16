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

// Tab 2: ID Document Verification - Passport OCR (Mr. Bean)
export const PASSPORT_VERIFICATION = {
  free_form_text: `PASSPORT OCR EXTRACTION RESULT:

United Kingdom of Great Britain and Northern Ireland
Passport Passeport

Type/Type: P
Code of issuing state/Code de l'État émetteur: GBR
Passport No./Passeport No.: 023477812
Surname/Nom: BEAN
Given names/Prénoms: MR
Nationality/Nationalité: BRITISH CITIZEN
Date of birth/Date de naissance: 6 JAN/JAN 55
Sex/Sexe: M
Place of birth/Lieu de naissance: ENFIELD
Date of issue/Date de délivrance: 20 SEP/SEP 96
Date of expiry/Date d'expiration: 20 SEP/SEP 06
Authority/Autorité: UNITED KINGDOM PASSPORT AGENCY
Observations/Observations: 0

Machine Readable Zone (MRZ):
P<GB<MR<BEAN<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
023477812GBR8111063M0004422<<<<<<<<<<<<06`,
  entities: [
    { label: "Document Type", definition: "Type of identity document (e.g., P for Passport)" },
    { label: "Passport Number", definition: "The unique passport identification number" },
    { label: "Surname", definition: "Family name or last name of the passport holder" },
    { label: "Given Names", definition: "First name(s) of the passport holder" },
    { label: "Nationality", definition: "Citizenship of the passport holder" },
    { label: "Date of Birth", definition: "Birth date in format DD MMM YY" },
    { label: "Sex", definition: "Gender of the passport holder (M/F)" },
    { label: "Place of Birth", definition: "City or location where the passport holder was born" },
    { label: "Issue Date", definition: "Date when the passport was issued" },
    { label: "Expiry Date", definition: "Date when the passport expires" },
    { label: "Issuing Authority", definition: "Government agency that issued the passport" },
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
