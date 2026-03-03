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
[1/7] 🔍 Pre-flight Checks
      ├─ Verify RHEL OS
      ├─ Check PPC64LE architecture
      ├─ Validate sudo access
      ├─ Test internet connectivity
      └─ Check disk space

[2/7] 📦 System Update
      └─ Update all system packages

[3/7] 🔧 Install Dependencies
      ├─ Python 3.12 + pip + dev tools
      ├─ Git
      ├─ GCC/G++
      └─ Node.js

[4/7] 🐍 Python Environment
      ├─ Create virtual environment
      ├─ Activate environment
      └─ Upgrade pip

[5/7] 📥 Clone Repository
      └─ Clone Carbon-GenAI-Demos from GitHub

[6/7] 📦 Node Dependencies
      ├─ Install Yarn globally
      ├─ Install project dependencies
      ├─ Add Carbon React packages
      └─ Install additional npm packages

[7/7] 🏗️  Build & Start
      ├─ Build application
      └─ Start dev server (background)
```

## File Structure

After deployment, your directory will contain:

```
.
├── deploy-carbon-genai.sh          # Main deployment script
├── stop-server.sh                  # Stop dev server
├── check-status.sh                 # Check deployment status
├── README.md                       # This file
├── deployment-plan.md              # Detailed implementation plan
├── carbon.venv/                    # Python virtual environment
├── Carbon-GenAI-Demos/             # Cloned repository
│   └── carbon-ui/                  # Application directory
├── carbon-deployment-*.log         # Deployment log files
└── carbon-dev-server.pid           # Dev server process ID
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
- Python virtual environment status
- Repository and application status
- Dev server status (running/stopped)
- System dependencies
- Log files information

### Stop Development Server
```bash
./stop-server.sh
```

Gracefully stops the dev server and cleans up PID file.

### Manual Server Stop
```bash
kill $(cat carbon-dev-server.pid)
```

### View Server Logs
```bash
# View latest deployment log
tail -f carbon-deployment-*.log

# View specific log
tail -f carbon-deployment-20260303-162800.log
```

### Restart Server Manually
```bash
cd Carbon-GenAI-Demos/carbon-ui
source ../../carbon.venv/bin/activate
yarn dev
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
http://localhost:3000
```

**Note**: The actual port may vary. Check the deployment logs or run `./check-status.sh` to see the listening port.

## Cleanup

To completely remove the deployment:

```bash
# Stop the server
./stop-server.sh

# Remove all files
rm -rf carbon.venv Carbon-GenAI-Demos carbon-deployment-*.log carbon-dev-server.pid
```

## Support

For issues or questions:

1. Check the deployment logs: `tail -f carbon-deployment-*.log`
2. Run status check: `./check-status.sh`
3. Review the troubleshooting section above
4. Check the original repository: https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos

## License

This deployment script is provided as-is. The Carbon GenAI Demo application has its own license - please refer to the repository for details.

## Version History

- **v1.0.0** (2026-03-03): Initial release
  - Automated deployment for RHEL/PPC64LE
  - Dual logging system
  - Helper scripts for management
  - Comprehensive error handling