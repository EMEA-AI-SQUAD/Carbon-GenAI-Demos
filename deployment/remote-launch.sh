#!/bin/bash
# Launched remotely by Bob to start a clean deployment in the background.
# Safe to run multiple times — kills any prior deploy run first.

pkill -f deploy-carbon-genai.sh 2>/dev/null || true
sleep 1

mkdir -p ~/deployment
rm -rf ~/Carbon-GenAI-Demos

git clone https://github.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos ~/Carbon-GenAI-Demos

nohup bash ~/Carbon-GenAI-Demos/deployment/deploy-carbon-genai.sh \
    > ~/deployment/deploy-live.log 2>&1 &

DEPLOY_PID=$!
echo "$DEPLOY_PID" > ~/deployment/deploy.pid
echo "DEPLOY_STARTED PID:$DEPLOY_PID"
echo "Log: ~/deployment/deploy-live.log"
