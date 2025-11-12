# Simple Docker Start Script

Write-Host "Starting MentorLink Docker..." -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    docker ps 2>&1 | Out-Null
    $dockerRunning = $true
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is NOT running - Please start Docker Desktop first" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Start services
Write-Host "Starting services..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "Waiting 10 seconds for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Testing health endpoint..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost/health"
    Write-Host ""
    Write-Host "SUCCESS! Services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Health check response:" -ForegroundColor Cyan
    $response | ConvertTo-Json
    Write-Host ""
    Write-Host "Open in browser: http://localhost/health" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "Health check not responding yet - services may still be starting" -ForegroundColor Yellow
    Write-Host "Try: http://localhost/health in your browser" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or check logs with: docker-compose logs -f" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "To view logs: docker-compose logs -f" -ForegroundColor White
Write-Host "To stop: docker-compose down" -ForegroundColor White
Write-Host ""
