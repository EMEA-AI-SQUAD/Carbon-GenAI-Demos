#!/bin/bash

################################################################################
# Script: test-passporteye-chain.sh
# Purpose: Test the complete PassportEye service chain
# Usage: ./test-passporteye-chain.sh
################################################################################

echo "🔍 Testing PassportEye Service Chain"
echo "===================================="
echo ""

# Test 1: Check if PassportEye service is running
echo "1️⃣  Checking PassportEye service (port 5000)..."
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ PassportEye service is responding"
    curl -s http://localhost:5000/health | python3 -m json.tool
else
    echo "❌ PassportEye service is NOT responding on port 5000"
    echo "   Try: ./start-passporteye-service.sh"
fi
echo ""

# Test 2: Check if proxy server is running
echo "2️⃣  Checking proxy server (port 3001)..."
if curl -s http://localhost:3001/passporteye/health > /dev/null 2>&1; then
    echo "✅ Proxy server is responding"
    curl -s http://localhost:3001/passporteye/health | python3 -m json.tool
else
    echo "❌ Proxy server is NOT responding on port 3001"
    echo "   Check if proxy is running: ps aux | grep server_final.js"
fi
echo ""

# Test 3: Check if Next.js server is running
echo "3️⃣  Checking Next.js server (port 3000)..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Next.js server is responding"
else
    echo "❌ Next.js server is NOT responding on port 3000"
fi
echo ""

# Test 4: Check from external hostname
echo "4️⃣  Checking from external hostname..."
if curl -s http://p1362-pvm1.p1362.cecc.ihost.com:3001/passporteye/health > /dev/null 2>&1; then
    echo "✅ External access working"
    curl -s http://p1362-pvm1.p1362.cecc.ihost.com:3001/passporteye/health | python3 -m json.tool
else
    echo "❌ External access NOT working"
    echo "   This is what the browser sees!"
fi
echo ""

# Test 5: Check proxy logs
echo "5️⃣  Recent proxy server logs (if available)..."
if [ -f "carbon-deployment-*.log" ]; then
    echo "Last 10 lines of proxy logs:"
    tail -10 carbon-deployment-*.log | grep -i "passporteye\|proxy" || echo "No PassportEye-related logs found"
else
    echo "No log file found"
fi
echo ""

echo "===================================="
echo "Summary:"
echo "- PassportEye service should be on port 5000"
echo "- Proxy should forward /passporteye/* to port 5000"
echo "- Browser accesses via port 3001"
echo ""
echo "If any tests failed, check:"
echo "1. Is PassportEye service running? ps aux | grep passport_service"
echo "2. Is proxy server running? ps aux | grep server_final.js"
echo "3. Check firewall rules for ports 3001 and 5000"

# Made with Bob
