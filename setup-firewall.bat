@echo off
echo ========================================
echo   MentorLink Firewall Setup
echo ========================================
echo.
echo Adding firewall rules for ports 80, 443, and 5000...
echo.

REM Add firewall rule for HTTP (port 80)
netsh advfirewall firewall add rule name="MentorLink HTTP" dir=in action=allow protocol=TCP localport=80
if %errorlevel% equ 0 (
    echo [SUCCESS] Port 80 - HTTP allowed
) else (
    echo [FAILED] Port 80 rule failed
)

REM Add firewall rule for HTTPS (port 443)
netsh advfirewall firewall add rule name="MentorLink HTTPS" dir=in action=allow protocol=TCP localport=443
if %errorlevel% equ 0 (
    echo [SUCCESS] Port 443 - HTTPS allowed
) else (
    echo [FAILED] Port 443 rule failed
)

REM Add firewall rule for Backend API (port 5000)
netsh advfirewall firewall add rule name="MentorLink Backend" dir=in action=allow protocol=TCP localport=5000
if %errorlevel% equ 0 (
    echo [SUCCESS] Port 5000 - Backend API allowed
) else (
    echo [FAILED] Port 5000 rule failed
)

echo.
echo ========================================
echo   Firewall configuration complete!
echo ========================================
echo.
pause
