#!/bin/bash

# MentorLink Docker Management Script
# Usage: ./docker-manage.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if .env exists
check_env() {
    if [ ! -f .env ]; then
        print_error ".env file not found!"
        print_info "Create one from .env.production: cp .env.production .env"
        exit 1
    fi
}

# Commands
cmd_start() {
    print_info "Starting MentorLink services..."
    check_env
    docker-compose up -d
    print_success "Services started!"
    print_info "View logs: ./docker-manage.sh logs"
}

cmd_stop() {
    print_info "Stopping MentorLink services..."
    docker-compose down
    print_success "Services stopped!"
}

cmd_restart() {
    print_info "Restarting MentorLink services..."
    docker-compose restart
    print_success "Services restarted!"
}

cmd_build() {
    print_info "Building Docker images..."
    check_env
    docker-compose build --no-cache
    print_success "Build completed!"
}

cmd_logs() {
    SERVICE=${1:-}
    if [ -z "$SERVICE" ]; then
        print_info "Showing logs for all services (Ctrl+C to exit)..."
        docker-compose logs -f
    else
        print_info "Showing logs for $SERVICE (Ctrl+C to exit)..."
        docker-compose logs -f "$SERVICE"
    fi
}

cmd_status() {
    print_info "Service Status:"
    docker-compose ps
    echo ""
    print_info "Health Status:"
    docker inspect mentorlink-backend | grep -A 10 Health || print_warning "No health info available"
}

cmd_update() {
    print_info "Updating application..."

    # Pull latest code
    if [ -d .git ]; then
        print_info "Pulling latest code from git..."
        git pull
    fi

    # Rebuild and restart
    print_info "Rebuilding containers..."
    docker-compose build backend

    print_info "Restarting services..."
    docker-compose up -d --no-deps backend

    print_success "Update completed!"
}

cmd_backup() {
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="mentorlink-backup-$TIMESTAMP.db"

    print_info "Creating database backup..."

    docker-compose exec -T backend sh -c "cat /app/data/mentorlink.db" > "$BACKUP_DIR/$BACKUP_FILE"

    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        print_success "Backup created: $BACKUP_DIR/$BACKUP_FILE"
    else
        print_error "Backup failed!"
        exit 1
    fi
}

cmd_restore() {
    BACKUP_FILE=$1

    if [ -z "$BACKUP_FILE" ]; then
        print_error "Please specify backup file!"
        print_info "Usage: ./docker-manage.sh restore <backup-file>"
        exit 1
    fi

    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi

    print_warning "This will overwrite the current database!"
    read -p "Are you sure? (yes/no): " -r
    echo

    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_info "Stopping backend..."
        docker-compose stop backend

        print_info "Restoring database..."
        docker cp "$BACKUP_FILE" mentorlink-backend:/app/data/mentorlink.db

        print_info "Starting backend..."
        docker-compose start backend

        print_success "Database restored!"
    else
        print_info "Restore cancelled"
    fi
}

cmd_reset() {
    print_warning "This will remove all containers and volumes (including database)!"
    read -p "Are you sure? (yes/no): " -r
    echo

    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_info "Removing containers and volumes..."
        docker-compose down -v
        print_success "Reset completed!"
        print_info "Run './docker-manage.sh start' to start fresh"
    else
        print_info "Reset cancelled"
    fi
}

cmd_shell() {
    SERVICE=${1:-backend}
    print_info "Opening shell in $SERVICE container..."
    docker-compose exec "$SERVICE" sh
}

cmd_health() {
    print_info "Checking health..."

    # Check if containers are running
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Services are not running!"
        exit 1
    fi

    # Check backend health endpoint
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)

    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Backend is healthy! (HTTP $HTTP_CODE)"
    else
        print_error "Backend health check failed! (HTTP $HTTP_CODE)"
        exit 1
    fi
}

cmd_ssl() {
    DOMAIN=$1
    EMAIL=$2

    if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
        print_error "Usage: ./docker-manage.sh ssl <domain> <email>"
        exit 1
    fi

    print_info "Setting up SSL for $DOMAIN..."

    # Stop nginx
    docker-compose stop nginx

    # Get certificate
    docker-compose run --rm certbot certonly --standalone \
        -d "$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos

    # Start nginx
    docker-compose up -d nginx

    print_success "SSL setup completed!"
    print_info "Don't forget to update nginx/conf.d/default.conf with your domain"
}

cmd_help() {
    cat << EOF
${BLUE}MentorLink Docker Management Script${NC}

${GREEN}Usage:${NC}
  ./docker-manage.sh [command] [options]

${GREEN}Commands:${NC}
  ${YELLOW}start${NC}              Start all services
  ${YELLOW}stop${NC}               Stop all services
  ${YELLOW}restart${NC}            Restart all services
  ${YELLOW}build${NC}              Build Docker images
  ${YELLOW}logs [service]${NC}     Show logs (optionally for specific service)
  ${YELLOW}status${NC}             Show service status
  ${YELLOW}update${NC}             Update and restart application
  ${YELLOW}backup${NC}             Backup database
  ${YELLOW}restore <file>${NC}     Restore database from backup
  ${YELLOW}reset${NC}              Remove all containers and volumes (WARNING!)
  ${YELLOW}shell [service]${NC}    Open shell in container (default: backend)
  ${YELLOW}health${NC}             Check application health
  ${YELLOW}ssl <domain> <email>${NC} Setup SSL certificate
  ${YELLOW}help${NC}               Show this help message

${GREEN}Examples:${NC}
  ./docker-manage.sh start
  ./docker-manage.sh logs backend
  ./docker-manage.sh backup
  ./docker-manage.sh ssl example.com admin@example.com

${GREEN}Services:${NC}
  - backend   : Node.js API server
  - nginx     : Reverse proxy
  - certbot   : SSL certificate manager

EOF
}

# Main script logic
COMMAND=${1:-help}

case $COMMAND in
    start)
        cmd_start
        ;;
    stop)
        cmd_stop
        ;;
    restart)
        cmd_restart
        ;;
    build)
        cmd_build
        ;;
    logs)
        cmd_logs "$2"
        ;;
    status)
        cmd_status
        ;;
    update)
        cmd_update
        ;;
    backup)
        cmd_backup
        ;;
    restore)
        cmd_restore "$2"
        ;;
    reset)
        cmd_reset
        ;;
    shell)
        cmd_shell "$2"
        ;;
    health)
        cmd_health
        ;;
    ssl)
        cmd_ssl "$2" "$3"
        ;;
    help|--help|-h)
        cmd_help
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        echo ""
        cmd_help
        exit 1
        ;;
esac
