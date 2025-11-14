@echo off
echo ========================================
echo   Starting MentorLink Cloudflare Tunnel
echo ========================================
echo.
echo Your app will be accessible at:
echo.
echo   Local:  http://localhost
echo   Public: Check the URL below
echo.
echo ========================================
echo.
cd C:\Users\Ahmad\Documents\GitHub\advisorlink-ai
cloudflared.exe tunnel --url http://localhost:80
