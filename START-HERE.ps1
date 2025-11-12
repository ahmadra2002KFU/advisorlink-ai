# MentorLink Docker - Quick Start Script
# Run this to start testing immediately!

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   MentorLink Docker Quick Start" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "Success: Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Docker Desktop and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Starting MentorLink Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.production .env
    Write-Host "Success: .env file created" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Starting Docker containers..." -ForegroundColor Yellow
Write-Host ""

# Start Docker Compose
docker-compose up -d

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Waiting for services to be ready..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 5

# Check if backend is healthy
$maxAttempts = 10
$attempt = 0
$healthy = $false

Write-Host "Checking backend health..." -ForegroundColor Yellow

while ($attempt -lt $maxAttempts -and -not $healthy) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $healthy = $true
        }
    } catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 2
        }
    }
}

Write-Host ""
Write-Host ""

if ($healthy) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "   SUCCESS! MentorLink is running!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Cyan
    Write-Host "  Success: Backend API at http://localhost:5000" -ForegroundColor Green
    Write-Host "  Success: Nginx Proxy at http://localhost" -ForegroundColor Green
    Write-Host "  Success: Health Check at http://localhost/health" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Test health: http://localhost/health" -ForegroundColor White
    Write-Host "  2. Test API: http://localhost/api/health" -ForegroundColor White
    Write-Host "  3. View logs: .\docker-manage.ps1 logs" -ForegroundColor White
    Write-Host "  4. Stop: .\docker-manage.ps1 stop" -ForegroundColor White
    Write-Host ""
    Write-Host "Testing health endpoint..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1

    try {
        $healthResponse = Invoke-RestMethod -Uri "http://localhost/health"
        Write-Host ""
        Write-Host "Health Response:" -ForegroundColor Cyan
        Write-Host ($healthResponse | ConvertTo-Json) -ForegroundColor White
    } catch {
        Write-Host "Could not fetch health data, but service is running." -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green

    # Ask if user wants to view logs
    Write-Host ""
    $viewLogs = Read-Host "Would you like to view the logs? (y/n)"

    if ($viewLogs -eq "y" -or $viewLogs -eq "Y") {
        Write-Host ""
        Write-Host "Showing logs (Press Ctrl+C to exit)..." -ForegroundColor Yellow
        Write-Host ""
        Start-Sleep -Seconds 2
        docker-compose logs -f
    } else {
        Write-Host ""
        Write-Host "To view logs later run: .\docker-manage.ps1 logs" -ForegroundColor Cyan
        Write-Host "To stop services run: .\docker-manage.ps1 stop" -ForegroundColor Cyan
        Write-Host ""
    }

} else {
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "   WARNING: Services may not be fully ready" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "The services are starting but health check is not responding yet." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can:" -ForegroundColor Cyan
    Write-Host "  1. Wait a bit longer and try: http://localhost/health" -ForegroundColor White
    Write-Host "  2. Check logs: .\docker-manage.ps1 logs" -ForegroundColor White
    Write-Host "  3. Check status: .\docker-manage.ps1 status" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Read-Host "Press Enter to exit"
