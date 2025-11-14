# MentorLink Startup Script
# Starts Docker containers and Cloudflare Tunnel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MentorLink Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location C:\Users\Ahmad\Documents\GitHub\advisorlink-ai

# Start Docker containers
Write-Host "1. Starting Docker containers..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "2. Waiting for containers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check container status
Write-Host ""
Write-Host "3. Container Status:" -ForegroundColor Yellow
docker ps --filter "name=mentorlink" --format "   {{.Names}}: {{.Status}}"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Containers Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Local access: http://localhost" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Starting Cloudflare Tunnel..." -ForegroundColor Yellow
Write-Host "   Your public URL will appear below:" -ForegroundColor White
Write-Host ""

# Start Cloudflare Tunnel
.\cloudflared.exe tunnel --url http://localhost:80
