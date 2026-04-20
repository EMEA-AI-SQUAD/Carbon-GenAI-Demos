export const DEFAULTS = {
  free_form_text: `HIRING REQUEST
Role title: Senior AI Solutions Architect
Department: Enterprise Technology Sales
Hiring manager: Rebecca Moore
Location: London with hybrid working
Employment type: Full-time

Role purpose:
We need a senior client-facing architect who can work with sales, consulting, and technical delivery teams to shape AI and hybrid cloud opportunities for enterprise customers.

Core responsibilities:
- Lead technical discovery with prospective clients
- Translate business needs into solution architectures
- Support proposals, workshops, and executive presentations
- Work with delivery teams to ensure solution feasibility
- Contribute to reusable assets and technical thought leadership

Must-have skills:
- Enterprise architecture experience
- AI / data platform knowledge
- Hybrid cloud and integration experience
- Strong stakeholder communication skills
- Experience supporting complex bids or transformation programmes

Preferred skills:
- Financial services or public sector experience
- Knowledge of regulated environments
- Experience with Red Hat OpenShift, watsonx, or automation platforms

Tone and writing guidance:
- Use inclusive, professional hiring language
- Expand the diversity and inclusion statement
- Expand compensation and benefits in a realistic but non-specific way
- Make the role sound senior, credible, and attractive without hype

TASK
Generate a polished job description from this requisition.`,
  entities: [
    { label: 'Job Title', definition: 'Final title to use in the job description' },
    { label: 'Role Summary', definition: 'A polished overview paragraph for the role' },
    { label: 'Key Responsibilities', definition: 'Structured bullet-style description of the main responsibilities' },
    { label: 'Required Qualifications', definition: 'Essential skills and experience for the role' },
    { label: 'Preferred Qualifications', definition: 'Nice-to-have skills and experience' },
    { label: 'Diversity and Inclusion Statement', definition: 'Expanded inclusive hiring statement' },
    { label: 'Compensation and Benefits', definition: 'Expanded but non-specific compensation and benefits paragraph' },
    { label: 'Call to Action', definition: 'Closing application encouragement text' },
    { label: '', definition: '' },
  ],
};

export const RESUME_SEARCH = {
  free_form_text: `CANDIDATE REPOSITORY SNAPSHOT

Candidate 1:
Name: Priya Nair
Current role: Senior Data Engineer
Location: Manchester
Experience: 8 years
Profile summary:
Works on cloud data platforms, ETL modernization, and analytics architecture. Has delivered regulated data transformation work in banking and insurance. Strong SQL, Python, Azure, Databricks, stakeholder workshops, and delivery leadership.

Candidate 2:
Name: Daniel Weber
Current role: AI Platform Consultant
Location: Berlin
Experience: 6 years
Profile summary:
Focuses on enterprise AI platform deployments, MLOps, container platforms, and model governance. Experience with OpenShift, Python, prompt evaluation, and AI operating models. Has worked with manufacturing and public sector clients.

Candidate 3:
Name: Sofia Martinez
Current role: Solutions Architect
Location: Madrid
Experience: 10 years
Profile summary:
Leads discovery, architecture design, and proposal support for hybrid cloud programmes. Strong executive communication, multi-country delivery coordination, security-by-design, and application modernization background.

Candidate 4:
Name: James Holloway
Current role: Technical Consultant
Location: Birmingham
Experience: 5 years
Profile summary:
Supports workflow automation, document processing, and case management solutions. Experience in pre-sales demos, implementation support, training materials, and client workshops. Strong communication skills, growing architecture experience.

SEARCH REQUEST
Hiring team wants candidates relevant to:
- AI solutions architecture
- Hybrid cloud or enterprise platform knowledge
- Strong client-facing communication
- Ability to support bids, workshops, and technical discovery

TASK
Create a concise search-and-summary output that makes the candidates easy to browse in a single canonical format.`,
  entities: [
    { label: 'Search Summary', definition: 'A short summary of the candidate pool against the search request' },
    { label: 'Candidate 1 Summary', definition: 'Concise summary for candidate 1 including fit and strengths' },
    { label: 'Candidate 2 Summary', definition: 'Concise summary for candidate 2 including fit and strengths' },
    { label: 'Candidate 3 Summary', definition: 'Concise summary for candidate 3 including fit and strengths' },
    { label: 'Candidate 4 Summary', definition: 'Concise summary for candidate 4 including fit and strengths' },
    { label: 'Best Match Candidates', definition: 'Which candidates appear strongest and why' },
    { label: 'Suggested Search Tags', definition: 'Useful canonical tags or keywords for indexing and future search' },
    { label: '', definition: '' },
  ],
};

export const SHORTLIST_INTERVIEW = {
  free_form_text: `HIRING CONTEXT
Role title: Senior AI Solutions Architect
Priority criteria:
- Strong client-facing communication
- Technical discovery and architecture capability
- AI or hybrid cloud experience
- Ability to support proposals and executive workshops
- Experience in regulated or enterprise environments preferred

SHORTLIST CANDIDATES

Candidate A: Priya Nair
Highlights:
- Strong data and regulated industry background
- Good architecture and delivery credibility
- Less explicit pre-sales / executive workshop evidence than others

Candidate B: Daniel Weber
Highlights:
- Strong AI platform and OpenShift experience
- Good governance and platform thinking
- Slightly less senior in enterprise architecture breadth

Candidate C: Sofia Martinez
Highlights:
- Strong client-facing architecture, proposal support, and hybrid cloud transformation background
- Excellent executive communication and multi-stakeholder experience
- Less explicit hands-on AI platform depth than Daniel

TASK
Generate a structured shortlist and interview pack that helps the hiring team move to the next stage quickly.`,
  entities: [
    { label: 'Shortlist Recommendation', definition: 'A concise recommendation on who should move forward' },
    { label: 'Candidate A Assessment', definition: 'Structured assessment of candidate A against the role' },
    { label: 'Candidate B Assessment', definition: 'Structured assessment of candidate B against the role' },
    { label: 'Candidate C Assessment', definition: 'Structured assessment of candidate C against the role' },
    { label: 'Recommended Interview Focus', definition: 'What themes the interview panel should test across shortlisted candidates' },
    { label: 'Suggested Interview Questions', definition: 'A concise set of strong interview questions' },
    { label: 'Hiring Risks / Watchouts', definition: 'Potential concerns or gaps to validate in interviews' },
    { label: 'Next-Step Recommendation', definition: 'Suggested next hiring action for the panel' },
    { label: '', definition: '' },
  ],
};

// Made with Bob