# PowerShell script to commit and push deployment scripts to GitHub
# Usage: .\git-commit.ps1

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Info "Git Commit & Push - Deployment Scripts"
Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# Get the repository root (parent of deployment directory)
$repoPath = Split-Path -Parent $PSScriptRoot
Write-Info "Repository path: $repoPath"
Write-Host ""

# Change to repository directory
try {
    Set-Location $repoPath
    Write-Success "✓ Changed to repository directory"
} catch {
    Write-Error "✗ Failed to change directory: $_"
    exit 1
}

# Check git status
Write-Info "Checking git status..."
try {
    $status = git status --porcelain
    if ($status) {
        Write-Success "✓ Found changes to commit"
        Write-Host ""
        Write-Info "Modified files:"
        git status --short
        Write-Host ""
    } else {
        Write-Warning "⚠ No changes to commit"
        exit 0
    }
} catch {
    Write-Error "✗ Failed to check git status: $_"
    exit 1
}

# Add deployment directory
Write-Info "Adding deployment directory to git..."
try {
    git add deployment/
    Write-Success "✓ Files staged for commit"
} catch {
    Write-Error "✗ Failed to add files: $_"
    exit 1
}

# Show what will be committed
Write-Host ""
Write-Info "Files to be committed:"
git diff --cached --name-status
Write-Host ""

# Commit with message
$commitMessage = @"
Add LLM integration to deployment scripts

- Integrate llama.cpp setup into main deployment
- Add Granite 4.0 Micro model download
- Update stop-server.sh to handle both servers
- Update check-status.sh with LLM monitoring
- Add build tools to system dependencies

Features:
- Automated llama.cpp build with OpenBLAS
- Background LLM server management
- Dual server monitoring (web + LLM)
- Complete deployment in 11 automated steps
"@

Write-Info "Committing changes..."
try {
    git commit -m $commitMessage
    Write-Success "✓ Changes committed"
} catch {
    Write-Error "✗ Failed to commit: $_"
    exit 1
}

# Get current branch
try {
    $branch = git rev-parse --abbrev-ref HEAD
    Write-Info "Current branch: $branch"
} catch {
    Write-Error "✗ Failed to get current branch: $_"
    exit 1
}

# Push to remote
Write-Host ""
Write-Info "Pushing to GitHub..."
Write-Warning "⚠ This will push to origin/$branch"
Write-Host ""

$confirm = Read-Host "Do you want to push to GitHub? (y/n)"
if ($confirm -eq 'y' -or $confirm -eq 'Y') {
    try {
        git push origin $branch
        Write-Success "✓ Successfully pushed to GitHub!"
        Write-Host ""
        Write-Success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        Write-Success "✓ Deployment scripts are now on GitHub"
        Write-Success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        Write-Host ""
        Write-Info "View your changes at:"
        Write-Info "https://github.com/EMEA-AI-SQUAD/Carbon-GenAI-Demos/tree/$branch/deployment"
    } catch {
        Write-Error "✗ Failed to push: $_"
        Write-Host ""
        Write-Warning "You may need to:"
        Write-Warning "1. Check your GitHub credentials"
        Write-Warning "2. Ensure you have push access to the repository"
        Write-Warning "3. Pull any remote changes first: git pull origin $branch"
        exit 1
    }
} else {
    Write-Warning "⚠ Push cancelled by user"
    Write-Info "Your changes are committed locally but not pushed to GitHub"
    Write-Info "To push later, run: git push origin $branch"
}

Write-Host ""

# Made with Bob
