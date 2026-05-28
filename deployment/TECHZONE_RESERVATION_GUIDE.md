# TechZone Environment Reservation Guide

## Overview

This guide explains how to reserve the required IBM Power environment from TechZone to run the Carbon GenAI Demos.

## Required Environment

**Environment Name**: RHEL 9 ready for AI on IBM Power10 (IaaS)

**TechZone Collection**: [Generative AI demos on IBM Power](https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power)

**Platform ID**: `66479c385e3bbb001e089937`

## Prerequisites

Before reserving, ensure you have:
- ✅ IBM TechZone account (IBMer or Business Partner)
- ✅ Valid ISC Opportunity Number (for Demo/Pilot purposes)
- ✅ Approved purpose (Demo, Education, Event, Pilot, or Test)

## Reservation Methods

### Method 1: Manual Reservation via TechZone UI (Recommended)

#### Step 1: Navigate to TechZone Collection

1. Go to [TechZone](https://techzone.ibm.com)
2. Search for "Generative AI demos on IBM Power" or navigate directly to:
   ```
   https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power
   ```

#### Step 2: Select Environment

1. Click on the **"Environments"** tab
2. Find **"RHEL 9 ready for AI on IBM Power10 (IaaS)"**
3. Click **"Reserve"** button

#### Step 3: Fill Reservation Form

**⚠️ IMPORTANT: Take Your Time!**

The TechZone UI needs time to process each field and check availability. **Do not rush through the form** or it may get stuck checking availability.

**Recommended Approach:**
- Fill in one field
- Wait 2-3 seconds before moving to the next field
- Allow the backend to complete validation
- This prevents the form from getting stuck

**Required Fields:**

1. **Purpose**: Select your reservation purpose
   - Demo (requires Opportunity Number)
   - Education
   - Event
   - Pilot (requires Opportunity Number)
   - Test

2. **Opportunity Number** (if Demo or Pilot):
   - Enter your ISC Opportunity Number
   - Format: `0063h00000XXXXXXX`
   - **Note**: Use YOUR opportunity number, not examples from documentation

3. **Geography/Region**: 
   - Select preferred region (e.g., "North America")
   - The system will auto-select an available region if your preference is unavailable

4. **Start Date/Time**:
   - Select when you want the environment to be available
   - Can be immediate or scheduled for future

5. **Duration**:
   - Select reservation length (typically 7-14 days)
   - Can be extended later if needed

6. **Description** (optional but recommended):
   - Brief description of your use case
   - Example: "Testing Carbon GenAI demos with IBM Granite on Power10"

#### Step 4: Submit and Wait

1. Review all details carefully
2. Click **"Submit"** button
3. Wait for confirmation email
4. Provisioning typically takes 15-30 minutes

#### Step 5: Access Your Environment

Once provisioned (status: "Ready"):

1. Go to **"My Library"** → **"My Reservations"**
2. Find your reservation
3. Click to view details
4. Note the **FQDN (hostname)** - you'll need this for deployment
5. Note the **SSH credentials** (username/password or key)

### Method 2: Using Bob's TechZone MCP (Advanced)

If you have Bob (Roo-Cline) with TechZone MCP configured:

```bash
# Bob can help you reserve via MCP tools
# This requires TechZone MCP server setup in Bob's configuration
```

**Note**: MCP method requires proper authentication tokens and may have limitations. Manual reservation via UI is more reliable.

## After Reservation

### 1. Verify Environment Access

SSH into your environment:
```bash
ssh <username>@<your-environment-fqdn>
```

### 2. Check System Information

```bash
# Verify RHEL version
cat /etc/redhat-release

# Verify architecture (should be ppc64le)
uname -m

# Check available disk space (need 5GB+)
df -h

# Check memory (need 2GB+)
free -h
```

### 3. Proceed with Deployment

Once you have SSH access, follow the deployment guide:
```bash
# Create deployment directory
mkdir -p ~/deployment
cd ~/deployment

# Download deployment script
curl -O https://raw.githubusercontent.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/main/deployment/deploy-carbon-genai.sh

# Make executable
chmod +x deploy-carbon-genai.sh

# Run deployment
./deploy-carbon-genai.sh
```

See [Deployment README](README.md) for complete deployment instructions.

## Common Issues and Solutions

### Issue: Form Gets Stuck on "Checking Availability"

**Solution**: You moved through the form too quickly
- Refresh the page
- Start over
- **Take your time** - wait 2-3 seconds between fields
- Allow backend validation to complete

### Issue: "No Capacity Available"

**Solution**: Try different region or time
- Select a different geography/region
- Try scheduling for a later time
- Check back in a few hours

### Issue: "Invalid Opportunity Number"

**Solution**: Verify your opportunity number
- Ensure it's a valid ISC opportunity
- Format should be: `0063h00000XXXXXXX`
- Contact your sales team if unsure

### Issue: Reservation Stuck in "Provisioning"

**Solution**: Wait or contact support
- Normal provisioning: 15-30 minutes
- If stuck >1 hour, check TechZone status page
- Contact TechZone support if needed

## Reservation Best Practices

### 1. Plan Ahead
- Reserve at least 1 day before you need it
- Account for provisioning time (15-30 minutes)
- Consider time zones for scheduled starts

### 2. Right-Size Duration
- Start with 7 days for testing
- Extend if needed (can extend active reservations)
- Don't over-reserve (wastes resources)

### 3. Document Your Work
- Note the environment FQDN
- Save SSH credentials securely
- Document any configuration changes

### 4. Clean Up When Done
- Delete reservation when finished
- Don't leave environments running unused
- Helps preserve TechZone capacity

## Environment Specifications

**What You Get:**
- RHEL 9 on IBM Power10 (ppc64le)
- Pre-configured for AI workloads
- Root/sudo access
- Internet connectivity
- 5GB+ disk space
- 2GB+ RAM

**What You Need to Install:**
- Python 3.12 (deployment script handles this)
- Node.js and Yarn (deployment script handles this)
- llama.cpp and dependencies (deployment script handles this)
- IBM Granite model (deployment script downloads this)

## Support and Resources

### TechZone Resources
- **TechZone Home**: https://techzone.ibm.com
- **Collection**: https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power
- **TechZone Support**: Use the support link in TechZone UI

### Project Resources
- **GitHub Repository**: https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos
- **Deployment Guide**: [README.md](README.md)
- **Main Project README**: [../README.md](../README.md)

### Getting Help
1. Check this guide first
2. Review [Deployment README](README.md) for deployment issues
3. Check TechZone status page for outages
4. Contact TechZone support for reservation issues
5. Open GitHub issue for demo-specific problems

## Quick Reference

### Key Information to Note
```
Environment: RHEL 9 ready for AI on IBM Power10 (IaaS)
Collection: Generative AI demos on IBM Power
Platform ID: 66479c385e3bbb001e089937
Your FQDN: _________________ (fill in after reservation)
SSH Username: _________________ (fill in after reservation)
Reservation ID: _________________ (fill in after reservation)
Start Date: _________________ (fill in when reserving)
End Date: _________________ (fill in when reserving)
```

### Reservation Checklist
- [ ] Have valid ISC Opportunity Number (if Demo/Pilot)
- [ ] Navigated to TechZone collection
- [ ] Selected RHEL 9 AI environment
- [ ] Filled form carefully (2-3 seconds between fields)
- [ ] Submitted reservation
- [ ] Received confirmation email
- [ ] Environment status: "Ready"
- [ ] Noted FQDN and credentials
- [ ] Verified SSH access
- [ ] Ready for deployment

---

**Last Updated**: May 2026  
**Maintained by**: EMEA AI on IBM Power Squad  
**For**: Carbon GenAI Demos Project