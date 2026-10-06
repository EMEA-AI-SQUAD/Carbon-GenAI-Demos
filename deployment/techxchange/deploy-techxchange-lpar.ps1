# deploy-techxchange-lpar.ps1
# Run from the repo root in PowerShell:
#   .\deployment\techxchange\deploy-techxchange-lpar.ps1
#
# Pipes remote-deploy.sh to the LPAR over SSH.
# You will be prompted once for the root password.

$LPAR_HOST = "9.8.70.150"
$LPAR_USER = "root"
$SCRIPT    = Join-Path $PSScriptRoot "remote-deploy.sh"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  TechXChange Lab 1127 — LPAR Deployment" -ForegroundColor Cyan
Write-Host "  Target : ${LPAR_USER}@${LPAR_HOST}" -ForegroundColor Cyan
Write-Host "  Script : $SCRIPT" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "You will be prompted for the root password." -ForegroundColor Yellow
Write-Host "Expected time: ~35-40 min (first run) / ~5 min (cached)." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path $SCRIPT)) {
    Write-Host "ERROR: Script not found: $SCRIPT" -ForegroundColor Red
    exit 1
}

# Pipe the bash script to the remote shell.
# ssh -tt allocates a pseudo-TTY so the password prompt works interactively.
$sshTarget = "${LPAR_USER}@${LPAR_HOST}"
Get-Content $SCRIPT -Raw | ssh -o StrictHostKeyChecking=accept-new -tt $sshTarget 'bash -s'
