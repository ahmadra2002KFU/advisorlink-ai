# MentorLink Complete Docker Start
# Starts EVERYTHING: Backend + Frontend

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   MentorLink Complete Docker Setup" -ForegroundColor Cyan
Write-Host "   Backend + Frontend + Database" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker ps 2>&1 | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is NOT running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Building and Starting All Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:" -ForegroundColor White
Write-Host "  1. Build the backend container" -ForegroundColor White
Write-Host "  2. Build the frontend container (may take a few minutes)" -ForegroundColor White
Write-Host "  3. Start both services" -ForegroundColor White
Write-Host ""
Write-Host "First time build may take 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

# Start Docker Compose with build
docker-compose up -d --build

Write-Host ""
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Checking Service Health" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check backend
Write-Host "Checking backend..." -ForegroundColor Yellow
$backendHealthy = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        $backendHealthy = $true
        Write-Host "Backend is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "Backend not responding yet" -ForegroundColor Yellow
}

# Check frontend
Write-Host "Checking frontend..." -ForegroundColor Yellow
$frontendHealthy = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        $frontendHealthy = $true
        Write-Host "Frontend is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "Frontend not responding yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   MentorLink is Running!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

if ($backendHealthy -and $frontendHealthy) {
    Write-Host "All services are healthy!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Some services are still starting..." -ForegroundColor Yellow
    Write-Host "Give it a minute and refresh your browser" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "  Frontend (Full App):  http://localhost" -ForegroundColor White
Write-Host "  Backend API:          http://localhost:5000" -ForegroundColor White
Write-Host "  Health Check:         http://localhost:5000/health" -ForegroundColor White
Write-Host ""

Write-Host "What's Running:" -ForegroundColor Cyan
Write-Host "  Backend Container:  mentorlink-backend (Node.js + SQLite)" -ForegroundColor White
Write-Host "  Frontend Container: mentorlink-frontend (React + Vite + Nginx)" -ForegroundColor White
Write-Host ""

Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:     docker-compose logs -f" -ForegroundColor White
Write-Host "  Stop all:      docker-compose down" -ForegroundColor White
Write-Host "  Restart:       docker-compose restart" -ForegroundColor White
Write-Host "  View status:   docker-compose ps" -ForegroundColor White
Write-Host ""

# Test the app
Write-Host "Opening application in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost"

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
    Write-Host "Your application is running at: http://localhost" -ForegroundColor Green
    Write-Host ""
}
