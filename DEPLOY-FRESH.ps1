# Fresh Deployment Script - Build Everything from Scratch
# 100% Production Ready

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   MentorLink Fresh Deployment" -ForegroundColor Cyan
Write-Host "   Building Everything from Scratch" -ForegroundColor Cyan
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
    exit 1
}

Write-Host ""
Write-Host "Building fresh Docker images..." -ForegroundColor Yellow
Write-Host "This will take 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

# Build everything from scratch
docker-compose build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "Copying database to container..." -ForegroundColor Yellow
docker cp backend/mentorlink.db mentorlink-backend:/app/data/mentorlink.db

Write-Host "Setting database permissions..." -ForegroundColor Yellow
docker-compose exec -u root -T backend sh -c "chown -R nodejs:nodejs /app/data && chmod -R 775 /app/data"

Write-Host ""
Write-Host "Restarting backend..." -ForegroundColor Yellow
docker-compose restart backend

Write-Host ""
Write-Host "Waiting for restart..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   Testing Deployment" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Test backend health
Write-Host "Testing backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -TimeoutSec 5
    Write-Host "Backend is healthy" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json) -ForegroundColor White
} catch {
    Write-Host "Backend health check failed" -ForegroundColor Red
}

Write-Host ""

# Test frontend
Write-Host "Testing frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend is serving" -ForegroundColor Green
    }
} catch {
    Write-Host "Frontend not responding yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   Deployment Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is ready at:" -ForegroundColor Cyan
Write-Host "  http://localhost" -ForegroundColor White
Write-Host ""
Write-Host "Backend API:" -ForegroundColor Cyan
Write-Host "  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f          View all logs" -ForegroundColor White
Write-Host "  docker-compose logs -f backend  View backend logs" -ForegroundColor White
Write-Host "  docker-compose ps               Check status" -ForegroundColor White
Write-Host "  docker-compose down             Stop everything" -ForegroundColor White
Write-Host ""

# Open browser
Write-Host "Opening browser..." -ForegroundColor Yellow
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
}
