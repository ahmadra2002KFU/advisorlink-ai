# Fix Database - Copy existing database into Docker

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Fixing Database Issue" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Copying your existing database into Docker..." -ForegroundColor Yellow
Write-Host ""

# Copy the database into the backend container
docker cp backend/mentorlink.db mentorlink-backend:/app/data/mentorlink.db

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database copied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Restarting backend..." -ForegroundColor Yellow
    docker-compose restart backend

    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "   Database Fixed!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Try logging in again at: http://localhost" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Failed to copy database!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Docker containers are running" -ForegroundColor White
    Write-Host "  2. backend/mentorlink.db exists" -ForegroundColor White
    Write-Host ""
}
