# MentorLink Docker Management Script (PowerShell)
# Usage: .\docker-manage.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help",

    [Parameter(Position=1)]
    [string]$Arg1,

    [Parameter(Position=2)]
    [string]$Arg2
)

# Helper functions
function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Check if .env exists
function Check-Env {
    if (-not (Test-Path .env)) {
        Print-Error ".env file not found!"
        Print-Info "Create one from .env.production: Copy-Item .env.production .env"
        exit 1
    }
}

# Commands
function Start-Services {
    Print-Info "Starting MentorLink services..."
    Check-Env
    docker-compose up -d
    Print-Success "Services started!"
    Print-Info "View logs: .\docker-manage.ps1 logs"
}

function Stop-Services {
    Print-Info "Stopping MentorLink services..."
    docker-compose down
    Print-Success "Services stopped!"
}

function Restart-Services {
    Print-Info "Restarting MentorLink services..."
    docker-compose restart
    Print-Success "Services restarted!"
}

function Build-Images {
    Print-Info "Building Docker images..."
    Check-Env
    docker-compose build --no-cache
    Print-Success "Build completed!"
}

function Show-Logs {
    param([string]$Service)

    if ([string]::IsNullOrEmpty($Service)) {
        Print-Info "Showing logs for all services (Ctrl+C to exit)..."
        docker-compose logs -f
    } else {
        Print-Info "Showing logs for $Service (Ctrl+C to exit)..."
        docker-compose logs -f $Service
    }
}

function Show-Status {
    Print-Info "Service Status:"
    docker-compose ps
    Write-Host ""
    Print-Info "Health Status:"
    docker inspect mentorlink-backend | Select-String -Pattern "Health" -Context 0,10
}

function Update-Application {
    Print-Info "Updating application..."

    # Pull latest code if git repo
    if (Test-Path .git) {
        Print-Info "Pulling latest code from git..."
        git pull
    }

    # Rebuild and restart
    Print-Info "Rebuilding containers..."
    docker-compose build backend

    Print-Info "Restarting services..."
    docker-compose up -d --no-deps backend

    Print-Success "Update completed!"
}

function Backup-Database {
    $BackupDir = "./backups"
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir | Out-Null
    }

    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $BackupFile = "$BackupDir/mentorlink-backup-$Timestamp.db"

    Print-Info "Creating database backup..."

    docker-compose exec -T backend sh -c "cat /app/data/mentorlink.db" > $BackupFile

    if (Test-Path $BackupFile) {
        Print-Success "Backup created: $BackupFile"
    } else {
        Print-Error "Backup failed!"
        exit 1
    }
}

function Restore-Database {
    param([string]$BackupFile)

    if ([string]::IsNullOrEmpty($BackupFile)) {
        Print-Error "Please specify backup file!"
        Print-Info "Usage: .\docker-manage.ps1 restore <backup-file>"
        exit 1
    }

    if (-not (Test-Path $BackupFile)) {
        Print-Error "Backup file not found: $BackupFile"
        exit 1
    }

    Print-Warning "This will overwrite the current database!"
    $Response = Read-Host "Are you sure? (yes/no)"

    if ($Response -eq "yes") {
        Print-Info "Stopping backend..."
        docker-compose stop backend

        Print-Info "Restoring database..."
        docker cp $BackupFile mentorlink-backend:/app/data/mentorlink.db

        Print-Info "Starting backend..."
        docker-compose start backend

        Print-Success "Database restored!"
    } else {
        Print-Info "Restore cancelled"
    }
}

function Reset-Everything {
    Print-Warning "This will remove all containers and volumes (including database)!"
    $Response = Read-Host "Are you sure? (yes/no)"

    if ($Response -eq "yes") {
        Print-Info "Removing containers and volumes..."
        docker-compose down -v
        Print-Success "Reset completed!"
        Print-Info "Run '.\docker-manage.ps1 start' to start fresh"
    } else {
        Print-Info "Reset cancelled"
    }
}

function Open-Shell {
    param([string]$Service = "backend")

    Print-Info "Opening shell in $Service container..."
    docker-compose exec $Service sh
}

function Check-Health {
    Print-Info "Checking health..."

    # Check if containers are running
    $Status = docker-compose ps
    if ($Status -notmatch "Up") {
        Print-Error "Services are not running!"
        exit 1
    }

    # Check backend health endpoint
    try {
        $Response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing
        if ($Response.StatusCode -eq 200) {
            Print-Success "Backend is healthy! (HTTP $($Response.StatusCode))"
        } else {
            Print-Error "Backend health check failed! (HTTP $($Response.StatusCode))"
            exit 1
        }
    } catch {
        Print-Error "Backend health check failed! $_"
        exit 1
    }
}

function Setup-SSL {
    param(
        [string]$Domain,
        [string]$Email
    )

    if ([string]::IsNullOrEmpty($Domain) -or [string]::IsNullOrEmpty($Email)) {
        Print-Error "Usage: .\docker-manage.ps1 ssl <domain> <email>"
        exit 1
    }

    Print-Info "Setting up SSL for $Domain..."

    # Stop nginx
    docker-compose stop nginx

    # Get certificate
    docker-compose run --rm certbot certonly --standalone `
        -d $Domain `
        --email $Email `
        --agree-tos

    # Start nginx
    docker-compose up -d nginx

    Print-Success "SSL setup completed!"
    Print-Info "Don't forget to update nginx/conf.d/default.conf with your domain"
}

function Show-Help {
    Write-Host @"
MentorLink Docker Management Script

Usage:
  .\docker-manage.ps1 [command] [options]

Commands:
  start              Start all services
  stop               Stop all services
  restart            Restart all services
  build              Build Docker images
  logs [service]     Show logs (optionally for specific service)
  status             Show service status
  update             Update and restart application
  backup             Backup database
  restore <file>     Restore database from backup
  reset              Remove all containers and volumes (WARNING!)
  shell [service]    Open shell in container (default: backend)
  health             Check application health
  ssl <domain> <email> Setup SSL certificate
  help               Show this help message

Examples:
  .\docker-manage.ps1 start
  .\docker-manage.ps1 logs backend
  .\docker-manage.ps1 backup
  .\docker-manage.ps1 ssl example.com admin@example.com

Services:
  - backend   : Node.js API server
  - nginx     : Reverse proxy
  - certbot   : SSL certificate manager

"@ -ForegroundColor Cyan
}

# Main script logic
switch ($Command.ToLower()) {
    "start" {
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Restart-Services
    }
    "build" {
        Build-Images
    }
    "logs" {
        Show-Logs -Service $Arg1
    }
    "status" {
        Show-Status
    }
    "update" {
        Update-Application
    }
    "backup" {
        Backup-Database
    }
    "restore" {
        Restore-Database -BackupFile $Arg1
    }
    "reset" {
        Reset-Everything
    }
    "shell" {
        Open-Shell -Service $Arg1
    }
    "health" {
        Check-Health
    }
    "ssl" {
        Setup-SSL -Domain $Arg1 -Email $Arg2
    }
    "help" {
        Show-Help
    }
    default {
        Print-Error "Unknown command: $Command"
        Write-Host ""
        Show-Help
        exit 1
    }
}
