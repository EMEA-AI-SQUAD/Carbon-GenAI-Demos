# Carbon GenAI Demo - Automated Deployment

Automated deployment script for the Carbon GenAI Demo application on RHEL/PPC64LE systems.

## 🚀 Quick Start (3 Steps)

**Prerequisites**: Reserve a TechZone environment first ([see guide](#techzone-environment-reservation))

Once you have your RHEL environment, SSH in and run:

```bash
# 1. Download the deployment script
curl -O https://raw.githubusercontent.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/main/deployment/deploy-carbon-genai.sh

# 2. Make it executable
chmod +x deploy-carbon-genai.sh

# 3. Run it
./deploy-carbon-genai.sh
```

**That's it!** The script will:
- Install all dependencies (Python, Node.js, etc.)
- Clone the repository
- Build llama.cpp (asks if you want to rebuild if already exists)
- Download the Granite AI model
- Start all services (LLM server, proxy, web app)

**Access your demo**: `http://your-hostname:3000`

---

## 📖 Detailed Documentation

### TechZone Environment Reservation

**You need an IBM Power environment from TechZone before running this deployment.**

#### Quick TechZone Reservation

1. **Environment**: RHEL 9 ready for AI on IBM Power10 (IaaS)
2. **Collection**: [Generative AI demos on IBM Power](https://techzone.ibm.com/collection/generative-ai-demos-on-ibm-power)
3. **Reservation**:
   - Go to TechZone → Search for collection → Reserve environment
   - **⚠️ IMPORTANT**: Fill the form slowly (wait 2-3 seconds between fields)
   - Enter your ISC Opportunity Number (if Demo/Pilot purpose)
4. **Wait**: Provisioning takes ~15-30 minutes

**📖 Complete Guide**: See [TECHZONE_RESERVATION_GUIDE.md](TECHZONE_RESERVATION_GUIDE.md) for detailed instructions and troubleshooting.

---

### Overview

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

## Alternative: Manual Download (Advanced Users)

If you need more control or want to download additional helper scripts:

### Method 1: Download Directly from GitHub (RECOMMENDED - No Git Required!)

SSH into your clean server and run:
```bash
# Create deployment directory
mkdir -p ~/deployment
cd ~/deployment

# Download the main deployment script
curl -O https://raw.githubusercontent.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/main/deployment/deploy-carbon-genai.sh

# Download helper scripts (optional)
curl -O https://raw.githubusercontent.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/main/deployment/stop-server.sh
curl -O https://raw.githubusercontent.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/main/deployment/check-status.sh
curl -O https://raw.githubusercontent.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/main/deployment/test-proxy-only.sh

# Download README (optional but recommended)
curl -O https://raw.githubusercontent.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/main/deployment/README.md
```

**Method 2: Using wget (if curl is not available):**
```bash
mkdir -p ~/deployment
cd ~/deployment
wget https://raw.githubusercontent.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/main/deployment/deploy-carbon-genai.sh
wget https://raw.githubusercontent.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/main/deployment/stop-server.sh
wget https://raw.githubusercontent.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/main/deployment/check-status.sh
```

**Method 3: Clone the Repository (if you want the full source code):**
```bash
git clone https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos.git
cd Carbon-GenAI-Demos/deployment
```

### 2. Make Scripts Executable

```bash
chmod +x deploy-carbon-genai.sh
chmod +x stop-server.sh      # if downloaded
chmod +x check-status.sh     # if downloaded
```

### 3. Run Deployment

```bash
./deploy-carbon-genai.sh
```

The script will:
1. Run pre-flight checks
2. Update system packages
3. Install dependencies
4. Set up Python virtual environment
5. Clone the repository
6. Install Node.js dependencies
7. Build the application
8. Configure proxy and web app
9. Set up llama.cpp environment
10. Build llama.cpp (with option to skip if already built)
11. Download Granite AI model
12. Start LLM server
13. Set up PassportEye OCR service
14. Start proxy server
15. Start development server

## What Gets Deployed

### Directory Structure
```
$HOME/
├── Carbon-GenAI-Demos/          # Main application repository
│   ├── carbon-ui/               # Next.js application
│   │   ├── src/                 # Source code
│   │   ├── public/              # Static assets
│   │   └── node_modules/        # Dependencies
│   └── deployment/              # Deployment scripts
├── llama.cpp/                   # LLM server
│   └── build/                   # Compiled binaries
├── carbon.venv/                 # Python virtual environment
├── llama.cpp.venv/              # LLM Python environment
├── .passporteye-venv/           # PassportEye environment
└── deployment/                  # Log files
    ├── carbon-deployment-*.log  # Deployment logs
    ├── proxy-server.log         # Proxy logs
    └── passporteye-service.log  # PassportEye logs
```

### Running Services
After deployment, these services will be running:
- **Web Application**: Port 3000 (Next.js dev server)
- **Proxy Server**: Port 3001 (CORS proxy)
- **LLM Server**: Port 8080 (llama.cpp server)
- **PassportEye**: Port 5000 (OCR service)

## Post-Deployment

### Access the Application

Open your browser and navigate to:
```
http://your-server-hostname:3000
```

Replace `your-server-hostname` with your server's FQDN or IP address.

### Check Server Status

```bash
./check-status.sh
```

This will show:
- Running processes and their PIDs
- Port usage
- Service health status

### View Logs

```bash
# Deployment log
tail -f ~/deployment/carbon-deployment-*.log

# Proxy server log
tail -f ~/deployment/proxy-server.log

# PassportEye log
tail -f ~/deployment/passporteye-service.log
```

### Stop Servers

```bash
./stop-server.sh
```

This will stop all running services (web server, proxy, LLM server, PassportEye).

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
If you see "port already in use" errors:
```bash
# Check what's using the port
lsof -i :3000  # or :3001, :8080, :5000

# Kill the process
lsof -ti :3000 | xargs kill
```

#### 2. Permission Denied
If you get permission errors:
```bash
# Make sure you have sudo access
sudo -v

# Check file permissions
ls -la deploy-carbon-genai.sh
```

#### 3. Build Failures
If the build fails:
```bash
# Check the log file
tail -100 ~/deployment/carbon-deployment-*.log

# Try running with more verbose output
bash -x ./deploy-carbon-genai.sh
```

#### 4. llama.cpp Build Issues
If llama.cpp fails to build:
- Check you have enough disk space (5GB minimum)
- Ensure GCC/G++ are installed
- Check the log for specific compiler errors

### Getting Help

1. **Check Logs**: Always check the deployment log first
2. **GitHub Issues**: Report issues at [GitHub Issues](https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/issues)
3. **Documentation**: See other guides in the deployment directory

## Helper Scripts

### stop-server.sh
Stops all running services:
```bash
./stop-server.sh
```

### check-status.sh
Shows status of all services:
```bash
./check-status.sh
```

### test-proxy-only.sh
Tests just the proxy server without full deployment:
```bash
./test-proxy-only.sh
```

## Advanced Configuration

### Environment Variables

You can customize the deployment by setting environment variables before running:

```bash
# Custom model URL
export MODEL_URL="https://your-model-url.com/model.gguf"

# Custom ports (not recommended)
export WEB_PORT=3000
export PROXY_PORT=3001
export LLM_PORT=8080
```

### Manual Service Management

If you need to manage services manually:

```bash
# Start web server
cd ~/Carbon-GenAI-Demos/carbon-ui
yarn dev

# Start proxy
cd ~/Carbon-GenAI-Demos/carbon-ui/src/llama-proxy
node server_final.js

# Start LLM server
cd ~/llama.cpp
./build/bin/llama-server -m /tmp/models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
```

## Updating the Application

To update to the latest version:

```bash
# Stop services
./stop-server.sh

# Update repository
cd ~/Carbon-GenAI-Demos
git pull origin main

# Rebuild
cd carbon-ui
yarn
yarn build

# Restart services
cd ~/deployment
./deploy-carbon-genai.sh
```

## Uninstalling

To completely remove the deployment:

```bash
# Stop all services
./stop-server.sh

# Remove directories
rm -rf ~/Carbon-GenAI-Demos
rm -rf ~/llama.cpp
rm -rf ~/carbon.venv
rm -rf ~/llama.cpp.venv
rm -rf ~/.passporteye-venv
rm -rf ~/deployment

# Remove downloaded model (optional)
rm -rf /tmp/models
```

## Contributing

This project was built with assistance from Bob (Roo-Cline AI Assistant). Contributions are welcome!

## License

See LICENSE file in the repository root.

---

**Made with ❤️ by the EMEA AI on IBM Power Squad**

**Built with 🤖 Bob (Roo-Cline AI Assistant)**
