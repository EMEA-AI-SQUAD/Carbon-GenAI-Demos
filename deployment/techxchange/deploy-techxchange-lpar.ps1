# deploy-techxchange-lpar.ps1
# Run from the repo root in PowerShell:
#   .\deployment\techxchange\deploy-techxchange-lpar.ps1
#
# Pipes remote-deploy.sh to the LPAR over SSH.
# You will be prompted once for the root password.

$lparHost = "9.8.70.150"
$lparUser = "root"
$script   = Join-Path $PSScriptRoot "remote-deploy.sh"

Write-Host ""
Write-Host "TechXChange Lab 1127 - LPAR Deployment" -ForegroundColor Cyan
Write-Host "Target : $lparUser@$lparHost" -ForegroundColor Cyan
Write-Host "Script : $script" -ForegroundColor Cyan
Write-Host ""
Write-Host "You will be prompted for the root password." -ForegroundColor Yellow
Write-Host "Expected time: ~35-40 min (first run) / ~5 min (cached)." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path $script)) {
    Write-Host "ERROR: Script not found: $script" -ForegroundColor Red
    exit 1
}

$target = $lparUser + "@" + $lparHost

Get-Content $script -Raw | ssh -o StrictHostKeyChecking=accept-new -tt $target 'bash -s'
