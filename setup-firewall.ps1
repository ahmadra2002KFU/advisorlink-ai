# MentorLink Firewall Setup - Self-Elevating PowerShell Script
# This script automatically requests administrator privileges

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Requesting Administrator Privileges  " -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Click 'Yes' when the UAC prompt appears..." -ForegroundColor Yellow
    Write-Host ""

    # Relaunch as administrator
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# Script is now running with admin privileges
Write-Host "========================================" -ForegroundColor Green
Write-Host "   MentorLink Firewall Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Adding firewall rules for ports 80, 443, and 5000..." -ForegroundColor White
Write-Host ""

$success = 0
$failed = 0

# Remove existing rules if they exist (to avoid duplicates)
Write-Host "Removing any existing MentorLink firewall rules..." -ForegroundColor Yellow
netsh advfirewall firewall delete rule name="MentorLink HTTP" 2>&1 | Out-Null
netsh advfirewall firewall delete rule name="MentorLink HTTPS" 2>&1 | Out-Null
netsh advfirewall firewall delete rule name="MentorLink Backend" 2>&1 | Out-Null
Write-Host ""

# Add Port 80 (HTTP)
Write-Host "Adding rule for Port 80 (HTTP)..." -ForegroundColor Cyan
$result = netsh advfirewall firewall add rule name="MentorLink HTTP" dir=in action=allow protocol=TCP localport=80 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Port 80 - HTTP traffic allowed" -ForegroundColor Green
    $success++
} else {
    Write-Host "[FAILED] Port 80 rule failed: $result" -ForegroundColor Red
    $failed++
}

# Add Port 443 (HTTPS)
Write-Host "Adding rule for Port 443 (HTTPS)..." -ForegroundColor Cyan
$result = netsh advfirewall firewall add rule name="MentorLink HTTPS" dir=in action=allow protocol=TCP localport=443 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Port 443 - HTTPS traffic allowed" -ForegroundColor Green
    $success++
} else {
    Write-Host "[FAILED] Port 443 rule failed: $result" -ForegroundColor Red
    $failed++
}

# Add Port 5000 (Backend API)
Write-Host "Adding rule for Port 5000 (Backend API)..." -ForegroundColor Cyan
$result = netsh advfirewall firewall add rule name="MentorLink Backend" dir=in action=allow protocol=TCP localport=5000 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Port 5000 - Backend API traffic allowed" -ForegroundColor Green
    $success++
} else {
    Write-Host "[FAILED] Port 5000 rule failed: $result" -ForegroundColor Red
    $failed++
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Firewall Configuration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  Success: $success rules" -ForegroundColor Green
Write-Host "  Failed:  $failed rules" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($success -eq 3) {
    Write-Host "All firewall rules added successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your MentorLink server can now receive connections on:" -ForegroundColor Cyan
    Write-Host "  - Port 80 (HTTP)" -ForegroundColor White
    Write-Host "  - Port 443 (HTTPS)" -ForegroundColor White
    Write-Host "  - Port 5000 (Backend API)" -ForegroundColor White
    Write-Host ""
    Write-Host "Next step: Configure port forwarding on your router" -ForegroundColor Yellow
    Write-Host "See ROUTER-SETUP.md for instructions" -ForegroundColor Yellow
} else {
    Write-Host "Some rules failed to add. Please check the errors above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
