#!/bin/bash

################################################################################
# PassportEye Setup Script
# Installs PassportEye and dependencies for passport MRZ extraction
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}PassportEye Setup${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if Python 3 is installed
echo -e "${YELLOW}[1/5] Checking Python installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found${NC}"
    echo "Please install Python 3 first"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✓ ${PYTHON_VERSION}${NC}"
echo ""

# Check if pip is installed
echo -e "${YELLOW}[2/5] Checking pip installation...${NC}"
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}✗ pip3 not found${NC}"
    echo "Installing pip..."
    python3 -m ensurepip --upgrade
fi
echo -e "${GREEN}✓ pip3 available${NC}"
echo ""

# Install Tesseract OCR (system dependency)
echo -e "${YELLOW}[3/5] Checking Tesseract OCR...${NC}"
if ! command -v tesseract &> /dev/null; then
    echo -e "${YELLOW}Tesseract not found. Attempting to install...${NC}"
    
    # Detect OS and install accordingly
    if [[ -f /etc/redhat-release ]]; then
        echo "Detected RHEL/CentOS - installing via yum..."
        # Check if dnf is available (RHEL 8+)
        if command -v dnf &> /dev/null; then
            sudo dnf install -y tesseract
        else
            sudo yum install -y tesseract
        fi
    elif [[ -f /etc/debian_version ]]; then
        echo "Detected Debian/Ubuntu - installing via apt-get..."
        sudo apt-get update
        sudo apt-get install -y tesseract-ocr
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Detected macOS - installing via brew..."
        brew install tesseract
    else
        echo -e "${RED}✗ Unsupported OS for automatic Tesseract installation${NC}"
        echo "Please install Tesseract manually:"
        echo "  RHEL/CentOS: sudo yum install tesseract (or dnf)"
        echo "  Ubuntu/Debian: sudo apt-get install tesseract-ocr"
        echo "  macOS: brew install tesseract"
        echo "  Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki"
        exit 1
    fi
fi

TESSERACT_VERSION=$(tesseract --version | head -n 1)
echo -e "${GREEN}✓ ${TESSERACT_VERSION}${NC}"
echo ""

# Create virtual environment if it doesn't exist
echo -e "${YELLOW}[4/5] Setting up Python virtual environment...${NC}"
VENV_DIR=".passporteye-venv"

if [ ! -d "${VENV_DIR}" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "${VENV_DIR}"
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment
source "${VENV_DIR}/bin/activate"
echo ""

# Install PassportEye and dependencies
echo -e "${YELLOW}[5/5] Installing PassportEye and dependencies...${NC}"
echo "This may take a few minutes..."
echo ""

# Detect architecture
ARCH=$(uname -m)
echo "Detected architecture: ${ARCH}"

pip install --upgrade pip

# For ppc64le, use IBM's wheel repository for pre-built packages
if [[ "${ARCH}" == "ppc64le" ]]; then
    echo "Using IBM wheel repository for ppc64le architecture..."
    pip install --prefer-binary numpy scipy opencv-python pillow --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux
    pip install PassportEye
    pip install flask
    pip install flask-cors
else
    # For other architectures, use standard installation
    pip install PassportEye
    pip install flask
    pip install flask-cors
    pip install pillow
fi

echo ""
echo -e "${GREEN}✓ All packages installed${NC}"
echo ""

# Verify installation
echo -e "${YELLOW}Verifying installation...${NC}"
python3 -c "import passporteye; print('PassportEye version:', passporteye.__version__)" || echo "PassportEye imported successfully"
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Installed components:"
echo "  - Tesseract OCR: ${TESSERACT_VERSION}"
echo "  - PassportEye Python library"
echo "  - Flask web framework"
echo "  - Supporting dependencies"
echo ""
echo "Virtual environment: ${VENV_DIR}"
echo ""
echo "Next steps:"
echo "1. Test PassportEye:"
echo "   ./deployment/test-passporteye.sh"
echo ""
echo "2. Start PassportEye service:"
echo "   ./deployment/start-passporteye-service.sh"
echo ""
echo "To activate virtual environment manually:"
echo "   source ${VENV_DIR}/bin/activate"
echo ""

# Made with Bob