#!/bin/bash
# remote-launch-farnell.sh
# Launched remotely by Bob to deploy the Farnell UI on port 3002.
# Run AFTER the base demo (remote-launch.sh) has fully completed.
# Accepts FQDN as first argument — passed through to deploy-farnell-ui.sh.

FQDN="${1:-localhost}"

mkdir -p ~/deployment

# Kill any previous Farnell UI instance
pkill -f "farnell.*next" 2>/dev/null || true
pkill -f "next-server.*3002" 2>/dev/null || true
sleep 1

nohup bash ~/Carbon-GenAI-Demos/deployment/deploy-farnell-ui.sh "$FQDN" \
    > ~/deployment/deploy-farnell.log 2>&1 &

DEPLOY_PID=$!
echo "$DEPLOY_PID" > ~/deployment/deploy-farnell.pid
echo "FARNELL_DEPLOY_STARTED PID:$DEPLOY_PID"
echo "Log: ~/deployment/deploy-farnell.log"
