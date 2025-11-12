# Start Frontend Dev Server

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Starting MentorLink Frontend" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    Write-Host ""
}

# Check if backend is running
Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 2
    Write-Host "Backend is running" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "WARNING: Backend is not responding!" -ForegroundColor Yellow
    Write-Host "Make sure Docker backend is running:" -ForegroundColor Yellow
    Write-Host "  .\START-HERE.ps1" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Frontend Configuration" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: http://localhost/api" -ForegroundColor White
Write-Host "Frontend will start at: http://localhost:8080" -ForegroundColor White
Write-Host ""

Write-Host "================================================" -ForegroundColor Green
Write-Host "   Starting Vite Dev Server..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Start the dev server
npm run dev
