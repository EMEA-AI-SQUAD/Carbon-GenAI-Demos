# Carbon GenAI Demo - Automated Deployment

Automated deployment script for the Carbon GenAI Demo application on RHEL/PPC64LE systems.

## Overview

This deployment package provides a fully automated solution to deploy the Carbon GenAI Demo application with minimal user intervention. The script handles all dependencies, configuration, and setup required to get the application running.

## Features

- ✅ **Fully Automated**: No user intervention required during deployment
- 📊 **Dual Logging**: Clean console output + detailed log files
- 🔍 **Pre-flight Checks**: Validates system requirements before deployment
- 🛡️ **Error Handling**: Comprehensive error detection and rollback
- 🚀 **Background Server**: Dev server runs in background after deployment
- 🔧 **Helper Scripts**: Easy server management and status checking

## System Requirements

### Operating System
- **RHEL (Red Hat Enterprise Linux)** - any recent version
- **Architecture**: PPC64LE (recommended) or other architectures with warning

### Prerequisites
- **Sudo/Root Access**: Required for package installation
- **Internet Connection**: Required for downloading packages and repositories
- **Disk Space**: Minimum 5GB free space recommended
- **Memory**: 2GB RAM minimum, 4GB recommended

### Installed by Script
The script will automatically install:
- Python 3.12 (with pip and development tools)
- Node.js and npm
- Yarn
- Git
- GCC/G++ compilers
- Various npm packages (OpenAI, Express, CORS, etc.)
- Carbon React components

## Quick Start

### 1. Download the Deployment Package

```bash
# If you have the scripts in a directory, navigate to it
cd /path/to/deployment-scripts
```

### 2. Make Scripts Executable

```bash
chmod +x deploy-carbon-genai.sh stop-server.sh check-status.sh
```

### 3. Run the Deployment

```bash
./deploy-carbon-genai.sh
```

The script will:
1. Run pre-flight checks
2. Update system packages
3. Install all dependencies
4. Set up Python virtual environment
5. Clone the repository
6. Install Node.js dependencies
7. Build the application
8. Start the development server in background

### 4. Check Status

```bash
./check-status.sh
```

### 5. Stop the Server (when needed)

```bash
./stop-server.sh
```

## Deployment Process

The deployment follows these phases:

```
[1/13] 🔍 Pre-flight Checks
       ├─ Verify RHEL OS
       ├─ Check PPC64LE architecture
       ├─ Validate sudo access
       ├─ Test internet connectivity
       └─ Check disk space

[2/13] 📦 System Update
       └─ Update all system packages

[3/13] 🔧 Install Dependencies
       ├─ Python 3.12 + pip + dev tools
       ├─ Git, GCC/G++, Node.js
       ├─ CMake, Make, Ninja
       └─ Build tools for llama.cpp

[4/13] 🐍 Web App Python Environment
       ├─ Create virtual environment
       ├─ Activate environment
       └─ Upgrade pip

[5/13] 📥 Clone Repository
       └─ Clone Carbon-GenAI-Demos from GitHub

[6/13] 📦 Node Dependencies
       ├─ Install Yarn globally
       ├─ Install project dependencies
       ├─ Add Carbon React packages
       └─ Install additional npm packages

[7/13] 🏗️  Build Application
       └─ Build web application with Yarn

[8/13] 🔧 Configure Proxy & Web App
       ├─ Detect server FQDN
       ├─ Update proxy configuration
       ├─ Update web app API URLs
       └─ Create configuration backups

[9/13] 🔌 Start Proxy Server
       └─ Start proxy on port 3001 (background)

[10/13] 🚀 Start Web Dev Server
        └─ Start web app on port 3000 (background)

[11/13] 🤖 Setup LLM Environment
        ├─ Create LLM virtual environment
        ├─ Install PyTorch & OpenBLAS
        └─ Configure for PPC64LE

[12/13] 🔨 Build llama.cpp
        ├─ Clone llama.cpp repository
        ├─ Configure with OpenBLAS
        └─ Build llama-server binary

[13/13] 📥 Download Model & Start LLM
        ├─ Download Granite 4.0 Micro model
        └─ Start LLM server on port 8080 (background)
```

## File Structure

After deployment, your directory will contain:

```
.
├── deploy-carbon-genai.sh          # Main deployment script
├── stop-server.sh                  # Stop all servers
├── check-status.sh                 # Check deployment status
├── README.md                       # This file
├── deployment-plan.md              # Detailed implementation plan
├── git-commit.ps1                  # PowerShell Git helper
├── carbon.venv/                    # Web app Python virtual environment
├── llama.cpp.venv/                 # LLM Python virtual environment
├── Carbon-GenAI-Demos/             # Cloned repository
│   └── carbon-ui/                  # Application directory
│       └── src/
│           ├── llama-proxy/        # Proxy server (configured)
│           │   └── server_final.js.backup
│           └── app/entextract/
│               └── page.js.backup  # Web app (configured)
├── llama.cpp/                      # llama.cpp installation
│   └── build/bin/llama-server      # LLM server binary
├── carbon-deployment-*.log         # Deployment log files
├── carbon-dev-server.pid           # Web server process ID
├── proxy-server.pid                # Proxy server process ID
└── llama-server.pid                # LLM server process ID
```

## Logging

### Console Output
The script provides clean, user-friendly output:
- Step-by-step progress indicators
- Success/failure status for each operation
- Estimated time and progress tracking
- Final deployment summary

### Log Files
Detailed logs are saved to: `carbon-deployment-YYYYMMDD-HHMMSS.log`

Log files contain:
- Timestamps for all operations
- Full command output (stdout/stderr)
- Error details and stack traces
- System information
- Performance metrics

To view logs in real-time:
```bash
tail -f carbon-deployment-*.log
```

## Management Commands

### Check Deployment Status
```bash
./check-status.sh
```

Shows:
- Web app and LLM Python virtual environments
- Repository and application status
- All server statuses (web, proxy, LLM)
- Resource usage (CPU/memory)
- Listening ports
- System dependencies
- Log files information

### Stop All Servers
```bash
./stop-server.sh
```

Gracefully stops all three servers:
- Web development server (port 3000)
- Proxy server (port 3001)
- LLM server (port 8080)

### Manual Server Stop
```bash
# Stop individual servers
kill $(cat carbon-dev-server.pid)  # Web server
kill $(cat proxy-server.pid)       # Proxy server
kill $(cat llama-server.pid)        # LLM server

# Or stop all at once
kill $(cat *.pid)
```

### View Server Logs
```bash
# View latest deployment log
tail -f carbon-deployment-*.log

# View specific log
tail -f carbon-deployment-20260303-162800.log
```

### Restart Servers Manually

**Web Dev Server:**
```bash
cd Carbon-GenAI-Demos/carbon-ui
source ../../carbon.venv/bin/activate
yarn dev
```

**Proxy Server:**
```bash
cd Carbon-GenAI-Demos/carbon-ui/src/llama-proxy
node server_final.js
```

**LLM Server:**
```bash
cd llama.cpp
source ../llama.cpp.venv/bin/activate
./build/bin/llama-server -m /tmp/models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
```

## Troubleshooting

### Deployment Fails During System Update

**Problem**: `dnf update` fails or times out

**Solution**:
```bash
# Check internet connectivity
ping -c 3 github.com

# Try updating manually
sudo dnf clean all
sudo dnf -y update

# Re-run deployment
./deploy-carbon-genai.sh
```

### Python Virtual Environment Issues

**Problem**: Virtual environment creation fails

**Solution**:
```bash
# Verify Python 3.12 is installed
python3.12 --version

# Remove existing venv and retry
rm -rf carbon.venv
./deploy-carbon-genai.sh
```

### Repository Clone Fails

**Problem**: Git clone fails or times out

**Solution**:
```bash
# Check GitHub connectivity
ping -c 3 github.com

# Try cloning manually
git clone https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos

# Re-run deployment
./deploy-carbon-genai.sh
```

### Node Dependencies Installation Fails

**Problem**: Yarn or npm install fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Clear yarn cache
yarn cache clean

# Remove node_modules and retry
cd Carbon-GenAI-Demos/carbon-ui
rm -rf node_modules
cd ../..
./deploy-carbon-genai.sh
```

### Dev Server Won't Start

**Problem**: Server starts but immediately stops

**Solution**:
```bash
# Check the logs for errors
tail -100 carbon-deployment-*.log

# Try starting manually to see errors
cd Carbon-GenAI-Demos/carbon-ui
source ../../carbon.venv/bin/activate
yarn dev
```

### Port Already in Use

**Problem**: Dev server can't bind to port

**Solution**:
```bash
# Find process using the port (usually 3000)
sudo lsof -i :3000

# Kill the process
kill -9 <PID>

# Restart server
cd Carbon-GenAI-Demos/carbon-ui
yarn dev
```

### Insufficient Disk Space

**Problem**: Deployment fails due to low disk space

**Solution**:
```bash
# Check available space
df -h

# Clean up old logs
rm -f carbon-deployment-*.log

# Clean package caches
sudo dnf clean all
npm cache clean --force
yarn cache clean

# Re-run deployment
./deploy-carbon-genai.sh
```

## Manual Deployment Steps

If the automated script fails, you can deploy manually:

```bash
# 1. Update system
sudo dnf -y update

# 2. Install dependencies
sudo dnf install -y python3.12 python3.12-pip python3.12-devel git gcc gcc-c++ nodejs

# 3. Create Python virtual environment
python3.12 -m venv carbon.venv
source carbon.venv/bin/activate

# 4. Upgrade pip
pip install --upgrade pip

# 5. Clone repository
git clone https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos

# 6. Install Yarn
sudo npm install --global yarn

# 7. Install Node dependencies
cd Carbon-GenAI-Demos/carbon-ui
yarn
yarn add @carbon/react@1.33.0
yarn add sass@1.63.6
yarn add typescript
yarn add @carbon/icons-react
npm install openai
npm install cors
npm install express
npm install http-proxy-middleware

# 8. Build application
yarn build

# 9. Start dev server
yarn dev
```

## Accessing the Application

After successful deployment, the application will be available at:

```
Web Application: http://<your-server-fqdn>:3000
Proxy Server:    http://<your-server-fqdn>:3001
LLM API:         http://localhost:8080
```

**Note**:
- The script automatically configures the correct hostname (FQDN)
- Access the web app from your browser using the server's FQDN
- The proxy forwards requests from the web app to the LLM server
- The LLM server is only accessible locally for security

### Testing the Deployment

```bash
# Check web app
curl http://<your-server-fqdn>:3000

# Check proxy server
curl http://<your-server-fqdn>:3001/health

# Check LLM server
curl http://localhost:8080/health
```

## Cleanup

To completely remove the deployment:

```bash
# Stop all servers
./stop-server.sh

# Remove all files
rm -rf carbon.venv llama.cpp.venv Carbon-GenAI-Demos llama.cpp \
       carbon-deployment-*.log *.pid /tmp/models
```

**Note**: This will remove:
- Both Python virtual environments
- Cloned repositories
- Built binaries
- Downloaded models
- All log files and PID files

## Support

For issues or questions:

1. Check the deployment logs: `tail -f carbon-deployment-*.log`
2. Run status check: `./check-status.sh`
3. Review the troubleshooting section above
4. Check the original repository: https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos

## License

This deployment script is provided as-is. The Carbon GenAI Demo application has its own license - please refer to the repository for details.

## Version History

- **v2.0.0** (2026-03-03): Complete automation with LLM and proxy
  - Added LLM server integration (llama.cpp + Granite model)
  - Added proxy server automation
  - Automatic hostname configuration (FQDN detection)
  - 13-step fully automated deployment
  - Three background servers (web, proxy, LLM)
  - Enhanced monitoring and management scripts

- **v1.0.0** (2026-03-03): Initial release
  - Automated web app deployment for RHEL/PPC64LE
  - Dual logging system
  - Helper scripts for management
  - Comprehensive error handling
## Credits

This deployment automation was created with assistance from **Bob** (Roo-Cline AI Assistant).

- **Roo-Cline**: https://github.com/RooVetGit/Roo-Cline
- **AI Assistant**: Bob - Expert software engineer specializing in automation and deployment

---
