# Carbon GenAI Demos

> **Showcase IBM Granite AI capabilities on IBM Power using Carbon Design System**
> 
> **👥 Built by the EMEA AI on IBM Power Squad** with AI assistance from [Bob (Roo-Cline AI Assistant)](https://github.com/RooVetGit/Roo-Cline)

A modern web application demonstrating real-world AI use cases for entity extraction, built with Next.js, Carbon Design System, and IBM Granite LLM running on IBM Power.

[![IBM Power](https://img.shields.io/badge/IBM-Power-blue?logo=ibm)](https://www.ibm.com/power)
[![Carbon Design System](https://img.shields.io/badge/Carbon-Design%20System-161616?logo=ibm)](https://carbondesignsystem.com/)
[![Next.js](https://img.shields.io/badge/Next.js-13-black?logo=next.js)](https://nextjs.org/)
[![Built with Bob](https://img.shields.io/badge/Built%20with-Bob%20(Roo--Cline)-purple)](https://github.com/RooVetGit/Roo-Cline)

---

## 👥 Team & Collaboration

This project was built through collaboration between the **EMEA AI on IBM Power Squad** and **Bob (Roo-Cline AI Assistant)**:

### Human Team
- **Squad Lead**: Requirements, architecture decisions, testing, and coordination
- **Henrik Mader**: Proxy server implementation and API integration
- **Rinah-Jayne Nuamah**: Earlier IT Ops entity extraction demo, testing, and feedback

### AI Assistant
- **Bob (Roo-Cline)**: Full-stack implementation, deployment automation, and documentation

**This project demonstrates real-world human-AI collaboration**, where domain expertise, technical skills, and AI assistance combine to create production-ready solutions.

---

## 🤖 About This Project: AI Building AI Demos

**This project is a meta-demonstration of AI capabilities:**

1. **The Demos**: Show IBM Granite AI extracting entities, translating languages, and performing calculations
2. **The Development**: Built through collaboration between human experts and Bob, an AI software engineer
3. **The Team**: Real IBM professionals working with AI assistance

### What Each Team Member Contributed

#### Henrik Mader
- **Proxy Server**: Implemented the Node.js proxy server (`server_final.js`)
- **API Integration**: Set up CORS handling and request routing
- **OpenAI Compatibility**: Ensured llama.cpp works with OpenAI client libraries

#### Rinah-Jayne Nuamah
- **IT Ops Demo Foundation**: Worked on earlier entity extraction demo for IT operations
- **Testing & Feedback**: Provided valuable input on demo scenarios and user experience
- **Use Case Development**: Helped shape the multilingual IT ops scenarios

#### Bob (Roo-Cline AI Assistant)
- **Web Application**: Next.js frontend with Carbon Design System
- **Demo Scenarios**: Created Italian, French, and German demo content
- **Deployment Automation**: 800+ line bash script for automated setup
- **Documentation**: Comprehensive guides and troubleshooting
- **Integration**: Connected all components into working system

#### Squad Lead
- **Vision & Requirements**: Defined project goals and use cases
- **Architecture Decisions**: Chose technologies and approach
- **Team Coordination**: Managed collaboration between team members
- **Testing & Validation**: Ensured demos meet business objectives

### Development Workflow

```
Squad Lead: "We need demos showing Granite AI on IBM Power"
  ↓
Henrik: Implements proxy server for API routing
  ↓
Rinah-Jayne: Develops IT ops use cases and scenarios
  ↓
Bob: Builds web UI, adds multilingual demos, automates deployment
  ↓
Team: Tests, refines, and validates together
  ↓
Result: Production-ready demo showcasing team + AI collaboration
```

---

## 🎯 Overview

This project demonstrates how IBM Granite AI models running on IBM Power can solve real business problems through interactive demos showcasing entity extraction and PII compliance:

### Entity Extraction Demos

#### 📚 **Demo 1: Book Review Analysis**
Extract structured information from unstructured book reviews
- **Use Case**: Content analysis and cataloging
- **Features**: Basic entity extraction from English text
- **Based on**: [IBM Granite Cookbook](https://github.com/ibm-granite-community/granite-snack-cookbook)
- **Built by**: Bob with team feedback

#### 🌍 **Demo 2: Multilingual IT Operations**
Assess priority and extract entities from support emails in multiple languages
- **Use Case**: IT helpdesk automation and priority assessment
- **Languages**: Italian (emotional), French (professional)
- **Features**: 
  - Multilingual understanding
  - Translation to English
  - True priority assessment (separating emotion from urgency)
  - Safety risk identification
- **Built by**: Rinah-Jayne (earlier version), Bob (current implementation)

#### 🚚 **Demo 3: German Logistics Quote with AI Calculations**
Extract information AND perform complex calculations from logistics requests
- **Use Case**: Real customer scenario from [Hans Geis](https://www.ibm.com/downloads/documents/us-en/1443d5dc5ecf4367)
- **Language**: German
- **Features**:
  - Extract standard shipping information
  - **AI Reasoning**: Calculate carton requirements from product quantities
  - **AI Math**: Determine pallet dimensions and load heights
  - Demonstrates AI going beyond simple extraction
- **Built by**: Bob with team requirements

### PII Extraction Demos

#### 🔒 **Tab 1: Fraud Complaint - Privacy Compliance**
Extract and redact personal information from customer support tickets
- **Use Case**: GDPR/CCPA compliance for customer support operations
- **Scenario**: European fraud complaint (Sophie Müller)
- **Features**:
  - Extract 8 types of PII (name, email, phone, credit card, amounts, locations, dates)
  - Generate redacted text with [REDACTED] replacements
  - Side-by-side display: PII table (left) + redacted text (right)
  - L1 agent routing (no PII exposure)
  - Compliant long-term storage
- **Built by**: Bob with team requirements

#### 📄 **Tab 3: Document Discovery - Elinar GDPR Solution**
Unstructured data discovery for GDPR compliance audits
- **Use Case**: Legacy document scanning before system migration or data retention review
- **Inspired by**: [Elinar's AI-powered GDPR solution on IBM Power](https://www.elinar.com/ai/privacy-gdpr/)
- **Scenario**: Internal project memo with mixed business and personal data
- **Features**:
  - Scan unstructured documents for personal data
  - **GDPR Risk Classification**: Color-coded banner (HIGH/MEDIUM/LOW/NO RISK)
  - Extract 7 PII types: names, emails, phones, job titles, locations, dates, record counts
  - Identify which documents contain GDPR-regulated content
  - Side-by-side display: PII findings + redacted document
  - European context: Anna Kowalski, Marcus Weber, Berlin office
- **Built by**: Bob with team requirements
- **Customer Reference**: Real IBM Power customer use case

**Key Innovation**: Demonstrates complete compliance workflow - scan documents at scale, classify GDPR risk level, extract sensitive data, and provide redacted version safe for archival and analysis. Shows how Elinar's customers use IBM Power + AI to automate GDPR compliance.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                          │
│                  (Carbon Design UI)                         │
│                    Built by Bob 🤖                          │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP (Port 3000)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Dev Server                             │
│           (Carbon React Components)                         │
│                    Built by Bob 🤖                          │
└────────────────────┬────────────────────────────────────────┘
                     │ API Calls (Port 3001)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Proxy Server                           │
│         (CORS handling, request routing)                    │
│              Implemented by Henrik Mader 👨‍💻                │
└────────────────────┬────────────────────────────────────────┘
                     │ OpenAI-compatible API (Port 8080)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              llama.cpp Server                               │
│         (IBM Granite 4.0 Micro Model)                       │
│              Running on IBM Power                           │
│           Deployment automated by Bob 🤖                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **RHEL** (Red Hat Enterprise Linux) on **IBM Power (PPC64LE)**
- **Sudo access** for package installation
- **Internet connection** for downloading dependencies
- **5GB+ free disk space**

### One-Command Deployment (Created by Bob)

```bash
# Download and run the automated deployment script
curl -O https://raw.githubusercontent.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/main/deployment/deploy-carbon-genai.sh
chmod +x deploy-carbon-genai.sh
./deploy-carbon-genai.sh
```

The script will automatically:
1. ✅ Install all system dependencies (Python 3.12, Node.js, GCC, etc.)
2. ✅ Set up Python virtual environments
3. ✅ Clone and build the web application
4. ✅ Configure hostname and networking
5. ✅ Build llama.cpp with OpenBLAS optimization
6. ✅ Download IBM Granite 4.0 Micro model
7. ✅ Start all three servers (web, proxy, LLM)

**Total deployment time**: ~15-20 minutes
**Script complexity**: 800+ lines of bash with error handling, logging, and rollback
**Created by**: Bob (Roo-Cline AI Assistant)

### Access the Application

After deployment completes:
```
Web Application: http://<your-server-fqdn>:3000
Proxy Server:    http://<your-server-fqdn>:3001
LLM API:         http://localhost:8080
```

---

## 🤝 Team Contributions in Detail

### Henrik Mader - Proxy Server Implementation

**Key Contributions:**
- Implemented `server_final.js` - the Node.js proxy server
- Configured CORS headers for cross-origin requests
- Set up request routing between web app and LLM server
- Ensured OpenAI client library compatibility with llama.cpp
- Handled error responses and API formatting

**Technical Details:**
```javascript
// Henrik's proxy server handles:
- CORS configuration for browser access
- Request forwarding to llama.cpp (port 8080)
- Response formatting for OpenAI compatibility
- Error handling and logging
```

**Impact**: Enables the web application to communicate with the LLM server securely and efficiently.

---

### Rinah-Jayne Nuamah - IT Ops Demo & Testing

**Key Contributions:**
- Developed earlier version of IT operations entity extraction demo
- Provided use case requirements for multilingual scenarios
- Tested demo functionality and user experience
- Contributed to scenario design (Italian and French emails)
- Validated entity extraction accuracy

**Demo Evolution:**
```
Rinah-Jayne's Earlier Work → Current Multilingual Demo
- IT ops use case foundation
- Entity extraction patterns
- Priority assessment concepts
- User feedback and refinement
```

**Impact**: Shaped the IT Ops demo to reflect real-world helpdesk scenarios with practical entity definitions.

---

### Bob (Roo-Cline AI Assistant) - Implementation & Automation

**Key Contributions:**
- Full Next.js application with Carbon Design System
- Three complete demo implementations
- Deployment automation (800+ line bash script)
- Integration of Henrik's proxy server
- Documentation and troubleshooting guides
- Entity definitions and prompt engineering

**Technical Scope:**
- ~3,000+ lines of code (application + deployment + docs)
- 13-phase automated deployment
- Responsive UI with Carbon components
- Error handling and loading states
- Comprehensive logging system

**Impact**: Transformed team requirements and components into a production-ready, deployable demo.

---

## 📁 Project Structure

```
Carbon-GenAI-Demos/
├── carbon-ui/                          # Next.js web application (Bob)
│   ├── src/
│   │   ├── app/
│   │   │   ├── entextract/            # Entity extraction demos
│   │   │   │   ├── page.js            # Main demo page - 3 tabs (Bob)
│   │   │   │   ├── it-ops-emails.js   # IT Ops scenarios (Bob + Rinah-Jayne)
│   │   │   │   ├── logistics-quote.js # Logistics scenario (Bob)
│   │   │   │   ├── defaults.js        # Book review defaults
│   │   │   │   ├── messages.js        # Prompt builder (Bob)
│   │   │   │   ├── postprocess.js     # Response parser (Bob)
│   │   │   │   └── extraction.js      # API client
│   │   │   ├── piiextract/            # PII extraction demos (Bob)
│   │   │   │   ├── page.js            # Main PII demo - 3 tabs (Bob)
│   │   │   │   ├── defaults.js        # Fraud complaint scenario (Bob)
│   │   │   │   ├── messages.js        # PII-specific prompts (Bob)
│   │   │   │   ├── postprocess.js     # Response parser
│   │   │   │   └── extraction.js      # API client
│   │   │   ├── home/                  # Landing page (Bob)
│   │   │   └── carbon/                # Carbon components demo
│   │   ├── llama-proxy/               # Proxy server
│   │   │   └── server_final.js        # CORS & routing (Henrik Mader)
│   │   └── components/                # Shared components
│   ├── public/
│   │   └── images/                    # Demo images
│   ├── package.json                   # Node dependencies
│   └── README.md                      # Carbon tutorial
├── deployment/                         # Deployment automation (Bob)
│   ├── deploy-carbon-genai.sh         # Main deployment script (Bob)
│   ├── stop-server.sh                 # Stop all servers (Bob)
│   ├── check-status.sh                # Check deployment status (Bob)
│   └── README.md                      # Deployment guide (Bob)
├── llama.cpp/                         # LLM server (cloned during deployment)
└── README.md                          # This file (Bob + Team)
```

---

## 🎨 Technology Stack

### Frontend (Implemented by Bob)
- **[Next.js 13](https://nextjs.org/)** - React framework with App Router
- **[Carbon Design System](https://carbondesignsystem.com/)** - IBM's open-source design system
  - `@carbon/react` - React components
  - `@carbon/icons-react` - Icon library
  - `@carbon/pictograms-react` - Pictogram library
- **[Sass](https://sass-lang.com/)** - CSS preprocessing

### Backend (Henrik Mader + Bob)
- **[Node.js Proxy](https://nodejs.org/)** - Proxy server (Henrik Mader)
- **[Express](https://expressjs.com/)** - Web framework for proxy
- **[llama.cpp](https://github.com/ggml-org/llama.cpp)** - Efficient LLM inference
- **[IBM Granite 4.0 Micro](https://huggingface.co/ibm-granite/granite-4.0-micro-GGUF)** - Quantized GGUF model

### Infrastructure (Automated by Bob)
- **RHEL** - Red Hat Enterprise Linux
- **IBM Power (PPC64LE)** - High-performance architecture
- **Python 3.12** - Build and deployment tools
- **OpenBLAS** - Optimized linear algebra for PPC64LE

---

## 🎓 Demo Details

### Demo 1: Book Review Entity Extraction (Built by Bob)

**Scenario**: Extract structured data from a book review

**Input Example**:
```
"The Catcher in the Rye" by J.D. Salinger is a classic coming-of-age 
novel published in 1951. The story follows Holden Caulfield, a 
teenager navigating life in New York City...
```

**Extracted Entities**:
- Book Title
- Author
- Publication Year
- Genre
- Main Character
- Setting
- Themes

**Key Features** (Implemented by Bob):
- Editable text and entity definitions
- Real-time extraction
- AI-labeled results with Carbon DataTable
- Loading states with pictograms
- Error handling with inline notifications

---

### Demo 2: Multilingual IT Operations (Rinah-Jayne + Bob)

**Scenario**: Assess true priority from emotional vs. professional support emails

**Foundation by Rinah-Jayne**: Earlier IT ops entity extraction demo provided the use case foundation and entity patterns.

**Current Implementation by Bob**: Expanded to multilingual scenarios with toggle UI and side-by-side comparison.

#### Italian Email (Emotional - Low Priority)
- **Language**: Italian
- **Tone**: Highly emotional, multiple exclamation marks
- **Actual Issue**: Report generation timeout (non-critical)
- **AI Challenge**: Recognize low business impact despite emotional language

#### French Email (Professional - Critical Priority)
- **Language**: French
- **Tone**: Professional, structured
- **Actual Issue**: Temperature control failure with explosion risk
- **AI Challenge**: Identify critical safety issue from professional tone

**Extracted Entities** (Defined by Bob with Rinah-Jayne's input):
- English Summary (translated)
- Sender Information
- Business Area
- Issue Type & Error Codes
- True Priority Assessment
- Safety Risks
- Suggested Solution Area

**Key Features** (Implemented by Bob):
- Toggle between scenarios
- Side-by-side email comparison with Carbon Tiles
- Multilingual extraction with translation
- Priority assessment based on business impact, not emotion
- Visual indicators for selected scenario

---

### Demo 3: German Logistics Quote with AI Calculations (Designed & Built by Bob)

**Scenario**: Real customer use case from Hans Geis logistics company

**Input**: German email requesting transport quote for 2,400 reams of A4 paper

**AI Must Calculate** (Entity definitions by Bob):
1. **Cartons needed**: 2,400 reams ÷ 5 reams/carton = 480 cartons
2. **Pallet layout**: How many cartons fit on 120cm × 80cm pallet
3. **Stack height**: Calculate total height based on carton dimensions
4. **Pallets required**: Total pallets needed for shipment

**Extracted Entities**:
- Standard information (customer, addresses, deadlines)
- **Calculated values**:
  - Number of cartons
  - Pallet dimensions
  - Load height
  - Number of pallets required

**Key Features** (Implemented by Bob):
- Demonstrates AI reasoning beyond extraction
- Real customer use case integration
- Mathematical calculations in entity definitions
- Dimensional analysis prompts
- Hans Geis branding and imagery

**Customer Reference**: [Hans Geis IBM Case Study](https://www.ibm.com/downloads/documents/us-en/1443d5dc5ecf4367)

---

## 🛠️ Management Commands (Created by Bob)

### Check Status
```bash
./deployment/check-status.sh
```
Shows:
- Virtual environment status
- Server processes (web, proxy, LLM)
- Resource usage
- Port status
- Log file locations

### Stop All Servers
```bash
./deployment/stop-server.sh
```
Gracefully stops all three servers

### View Logs
```bash
# Latest deployment log
tail -f deployment/carbon-deployment-*.log

# Real-time server output
tail -f deployment/carbon-deployment-*.log | grep -E "(ERROR|WARNING|INFO)"
```

### Restart Servers Manually

**Web Server**:
```bash
cd Carbon-GenAI-Demos/carbon-ui
source ../../carbon.venv/bin/activate
yarn dev
```

**Proxy Server** (Henrik's implementation):
```bash
cd Carbon-GenAI-Demos/carbon-ui/src/llama-proxy
node server_final.js
```

**LLM Server**:
```bash
cd llama.cpp
source ../llama.cpp.venv/bin/activate
./build/bin/llama-server -m /tmp/models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
```

---

## 📚 Documentation (Written by Bob)

- **[Deployment Guide](deployment/README.md)** - Complete deployment documentation
- **[Carbon Tutorial](carbon-ui/README.md)** - Carbon Design System basics
- **[Entity Extraction Analysis](carbon-ui/ENTITY_EXTRACTION_ANALYSIS.md)** - Demo design details
- **[IT Ops Demo Summary](carbon-ui/IT_OPS_DEMO_SUMMARY.md)** - Multilingual demo overview
- **[Carbon Implementation](carbon-ui/CARBON_REVIEW.md)** - Design system review
- **[Pictogram Examples](carbon-ui/PICTOGRAM_EXAMPLES.md)** - Visual component guide

---

## 🔧 Development

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos.git
cd Carbon-GenAI-Demos/carbon-ui

# Install dependencies
yarn install

# Add Carbon packages
yarn add @carbon/react@1.33.0
yarn add @carbon/icons-react
yarn add @carbon/pictograms-react
yarn add sass@1.63.6

# Install additional packages
npm install openai cors express http-proxy-middleware

# Run development server
yarn dev
```

### Building for Production

```bash
cd carbon-ui
yarn build
yarn start
```

---

## 🐛 Troubleshooting (Guide by Bob)

### Port Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000
kill -9 <PID>
```

### LLM Server Not Responding
```bash
# Check if server is running
ps aux | grep llama-server

# Check logs
tail -100 deployment/carbon-deployment-*.log

# Restart LLM server
cd llama.cpp
./build/bin/llama-server -m /tmp/models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
```

### Deployment Script Fails
```bash
# Check pre-flight requirements
cat /etc/redhat-release  # Verify RHEL
uname -m                 # Verify ppc64le
ping -c 3 github.com     # Verify internet

# View detailed logs
tail -200 deployment/carbon-deployment-*.log
```

See [Deployment Guide](deployment/README.md) for comprehensive troubleshooting.

---

## 🤝 Contributing

This is a demonstration project for IBM Power and Granite AI capabilities, built through collaboration between the EMEA AI on IBM Power Squad and Bob (Roo-Cline AI Assistant). For issues or suggestions:

1. Check existing documentation
2. Review deployment logs
3. Open an issue with:
   - System information (OS, architecture)
   - Error messages from logs
   - Steps to reproduce

---

## 📄 License

This project is provided as-is for demonstration purposes. Individual components may have their own licenses:
- Carbon Design System: Apache 2.0
- llama.cpp: MIT License
- IBM Granite Models: See [IBM Granite License](https://huggingface.co/ibm-granite)

---

## 🙏 Acknowledgments

### Project Team
- **EMEA AI on IBM Power Squad** - Vision, requirements, and coordination
- **Henrik Mader** - Proxy server implementation and API integration
- **Rinah-Jayne Nuamah** - IT Ops demo foundation and testing
- **Bob (Roo-Cline AI Assistant)** - Full-stack implementation and automation
  - [Learn more about Roo-Cline](https://github.com/RooVetGit/Roo-Cline)

### Technology & Community
- **IBM Granite Team** - For the excellent Granite 4.0 models
- **Carbon Design System** - For the comprehensive design system
- **llama.cpp Community** - For efficient LLM inference
- **Hans Geis** - For the real-world logistics use case
- **IBM Granite Cookbook** - For entity extraction examples

---

## 📞 Support

For questions about:
- **IBM Power**: [IBM Power Community](https://community.ibm.com/community/user/power)
- **IBM Granite**: [IBM Granite Community](https://github.com/ibm-granite-community)
- **Carbon Design**: [Carbon Design System](https://carbondesignsystem.com/)
- **Roo-Cline / Bob**: [Roo-Cline GitHub](https://github.com/RooVetGit/Roo-Cline)
- **This Project**: Open an issue in this repository

---

## 🎯 Project Goals

This project demonstrates:
1. ✅ **IBM Power Performance** - Running AI workloads on PPC64LE
2. ✅ **IBM Granite Capabilities** - Multilingual, reasoning, calculations
3. ✅ **Real Business Use Cases** - IT ops, logistics, content analysis
4. ✅ **Modern Web Development** - Next.js, Carbon Design System
5. ✅ **Automated Deployment** - One-command setup on RHEL
6. ✅ **Human-AI Collaboration** - Team expertise + AI assistance

---

## 🌟 The Meta-Demo: Team + AI Collaboration

**This project is unique because it demonstrates collaboration at multiple levels:**

### Level 1: The Technology
IBM Granite AI running on IBM Power, showing:
- Entity extraction from unstructured text
- Multilingual understanding and translation
- Priority assessment and reasoning
- Mathematical calculations and dimensional analysis

### Level 2: The Team
Real IBM professionals collaborating:
- **Henrik Mader**: Backend infrastructure (proxy server)
- **Rinah-Jayne Nuamah**: Use case development (IT ops demo)
- **Squad Lead**: Vision and coordination
- **Bob (AI Assistant)**: Implementation and automation

### Level 3: The Process
Human-AI collaboration in action:
- Humans provide domain expertise and requirements
- AI implements, automates, and documents
- Team tests, refines, and validates
- Result: Production-ready demo in days

**This showcases the future of software development**: Expert teams augmented by AI assistants, combining human creativity and domain knowledge with AI's implementation speed and consistency.

---

**Built with ❤️ by the EMEA AI on IBM Power Squad**

**Team Members**:
- Squad Lead - Vision & Coordination
- Henrik Mader - Proxy Server Implementation
- Rinah-Jayne Nuamah - IT Ops Demo & Testing
- Bob (Roo-Cline AI Assistant) - Full-Stack Implementation

**Technologies**: IBM Power, IBM Granite, Carbon Design System, Next.js, llama.cpp

**Bob's GitHub**: [Roo-Cline AI Assistant](https://github.com/RooVetGit/Roo-Cline)

---

*Last Updated: March 2026*
*Built by: EMEA AI on IBM Power Squad + Bob (Roo-Cline AI Assistant)*
*Deployed on: IBM Power with RHEL*