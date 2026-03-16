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

echo "Step 2: Stopping any running dev servers..."
pkill -f "next dev" || true
sleep 2
echo "✓ Servers stopped"
echo ""

echo "Step 3: Removing Next.js cache..."
rm -rf .next
echo "✓ .next directory removed"
echo ""

echo "Step 4: Removing node_modules..."
rm -rf node_modules
echo "✓ node_modules removed"
echo ""

echo "Step 5: Removing package-lock.json..."
rm -f package-lock.json
echo "✓ package-lock.json removed"
echo ""

echo "Step 6: Installing fresh dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

echo "Step 7: Verifying @carbon/react installation..."
npm list @carbon/react
echo ""

echo "Step 8: Starting development server..."
echo "Server will start on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""
npm run dev

# Made with Bob
