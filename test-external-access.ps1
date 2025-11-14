# External Access Diagnostic Tool for MentorLink

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MentorLink External Access Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get network information
Write-Host "1. Network Information:" -ForegroundColor Yellow
Write-Host "   Checking your network configuration..." -ForegroundColor White
Write-Host ""

$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"} | Select-Object -First 1).IPAddress
Write-Host "   Local IP: $localIP" -ForegroundColor Green

try {
    $publicIPv4 = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -TimeoutSec 5).Content
    Write-Host "   Public IPv4: $publicIPv4" -ForegroundColor Green
} catch {
    Write-Host "   Public IPv4: Unable to detect" -ForegroundColor Red
    $publicIPv4 = "Unknown"
}

Write-Host ""

# Check Docker containers
Write-Host "2. Docker Container Status:" -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}: {{.Status}}" | Select-String "mentorlink"
if ($containers) {
    foreach ($container in $containers) {
        Write-Host "   $container" -ForegroundColor Green
    }
} else {
    Write-Host "   No MentorLink containers running!" -ForegroundColor Red
}
Write-Host ""

# Check Windows Firewall Rules
Write-Host "3. Windows Firewall Rules:" -ForegroundColor Yellow
$ports = @(80, 443, 5000)
foreach ($port in $ports) {
    $rule = netsh advfirewall firewall show rule name=all | Select-String -Pattern "LocalPort.*$port" -Context 10,0
    if ($rule) {
        Write-Host "   Port $port : Firewall rule exists" -ForegroundColor Green
    } else {
        Write-Host "   Port $port : No firewall rule found" -ForegroundColor Red
    }
}
Write-Host ""

# Test local access
Write-Host "4. Local Access Test:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   Backend (localhost): OK" -ForegroundColor Green
    }
} catch {
    Write-Host "   Backend (localhost): FAILED" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   Frontend (localhost): OK" -ForegroundColor Green
    }
} catch {
    Write-Host "   Frontend (localhost): FAILED" -ForegroundColor Red
}
Write-Host ""

# Check if ports are listening
Write-Host "5. Port Listening Status:" -ForegroundColor Yellow
$portsToCheck = @(80, 5000)
foreach ($port in $portsToCheck) {
    $listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listening) {
        Write-Host "   Port $port : Listening" -ForegroundColor Green
    } else {
        Write-Host "   Port $port : Not listening" -ForegroundColor Red
    }
}
Write-Host ""

# Router configuration check
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($publicIPv4 -ne "Unknown") {
    Write-Host "Your application is accessible at:" -ForegroundColor White
    Write-Host "  - Local network: http://$localIP" -ForegroundColor Cyan
    Write-Host "  - Internet (after router config): http://$publicIPv4" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Router Port Forwarding Required:" -ForegroundColor Red
    Write-Host "  1. Access your router: http://192.168.8.1" -ForegroundColor White
    Write-Host "  2. Find 'Port Forwarding' or 'Virtual Server' settings" -ForegroundColor White
    Write-Host "  3. Add these rules:" -ForegroundColor White
    Write-Host ""
    Write-Host "     Port 80  -> $localIP : 80  (TCP)" -ForegroundColor Cyan
    Write-Host "     Port 443 -> $localIP : 443 (TCP)" -ForegroundColor Cyan
    Write-Host "     Port 5000 -> $localIP : 5000 (TCP)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  4. Save and apply settings" -ForegroundColor White
    Write-Host ""
    Write-Host "To test if port forwarding is working, use:" -ForegroundColor Yellow
    Write-Host "  https://www.yougetsignal.com/tools/open-ports/" -ForegroundColor Cyan
    Write-Host "  Enter IP: $publicIPv4" -ForegroundColor Cyan
    Write-Host "  Test ports: 80, 5000" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
