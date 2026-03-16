#!/bin/bash

# Reset and Test Script for Carbon GenAI Demos
# This script completely resets the Next.js environment and tests the application

set -e  # Exit on error

echo "========================================="
echo "Carbon GenAI Demos - Environment Reset"
echo "========================================="
echo ""

# Navigate to carbon-ui directory
cd ~/Carbon-GenAI-Demos/carbon-ui

echo "Step 1: Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

echo "Step 2: Stashing local changes (FQDN configs)..."
git stash push -m "Temporary stash for environment reset"
echo "✓ Local changes stashed"
echo ""

echo "Step 3: Pulling latest changes..."
cd ~/Carbon-GenAI-Demos
git pull origin feature/granite-vision-integration
echo "✓ Latest changes pulled"
echo ""

echo "Step 4: Restoring local changes (FQDN configs)..."
cd ~/Carbon-GenAI-Demos/carbon-ui
git stash pop || echo "Note: No stashed changes to restore or conflicts occurred"
echo ""

echo "Step 5: Stopping any running dev servers..."
pkill -f "next dev" || true
sleep 2
echo "✓ Servers stopped"
echo ""

echo "Step 6: Removing Next.js cache..."
rm -rf .next
echo "✓ .next directory removed"
echo ""

echo "Step 7: Removing node_modules..."
rm -rf node_modules
echo "✓ node_modules removed"
echo ""

echo "Step 8: Removing package-lock.json..."
rm -f package-lock.json
echo "✓ package-lock.json removed"
echo ""

echo "Step 9: Installing fresh dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

echo "Step 10: Verifying @carbon/react installation..."
npm list @carbon/react
echo ""

echo "========================================="
echo "Environment reset complete!"
echo "========================================="
echo ""
echo "IMPORTANT: If you had FQDN changes for CORS,"
echo "please verify they were restored correctly."
echo ""
echo "To start the development server, run:"
echo "  cd ~/Carbon-GenAI-Demos/carbon-ui"
echo "  npm run dev"
echo ""

# Made with Bob
