#!/bin/bash

# MentorLink Docker - Quick Start Script
# Run this to start testing immediately!

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}   MentorLink Docker Quick Start${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Check if Docker is running
echo -e "${YELLOW}Checking Docker...${NC}"
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running!${NC}"
    echo ""
    echo -e "${YELLOW}Please start Docker and run this script again.${NC}"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}   Starting MentorLink Services${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Navigate to script directory
cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found!${NC}"
    echo ""
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.production .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo ""
fi

echo -e "${YELLOW}Starting Docker containers...${NC}"
echo ""

# Start Docker Compose
docker-compose up -d

echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}   Waiting for services to be ready...${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

sleep 5

# Check if backend is healthy
max_attempts=10
attempt=0
healthy=false

echo -e "${YELLOW}Checking backend health...${NC}"

while [ $attempt -lt $max_attempts ] && [ "$healthy" = false ]; do
    if curl -s -f http://localhost/health > /dev/null 2>&1; then
        healthy=true
    else
        attempt=$((attempt + 1))
        if [ $attempt -lt $max_attempts ]; then
            echo -n "."
            sleep 2
        fi
    fi
done

echo ""
echo ""

if [ "$healthy" = true ]; then
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}   SUCCESS! MentorLink is running!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo -e "${CYAN}Services:${NC}"
    echo -e "${GREEN}  ✓ Backend API:  http://localhost:5000${NC}"
    echo -e "${GREEN}  ✓ Nginx Proxy:  http://localhost${NC}"
    echo -e "${GREEN}  ✓ Health Check: http://localhost/health${NC}"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo -e "  1. Test health: http://localhost/health"
    echo -e "  2. Test API:    http://localhost/api/health"
    echo -e "  3. View logs:   ./docker-manage.sh logs"
    echo -e "  4. Stop:        ./docker-manage.sh stop"
    echo ""
    echo -e "${YELLOW}Testing health endpoint...${NC}"
    sleep 1
    echo ""
    echo -e "${CYAN}Health Response:${NC}"
    curl -s http://localhost/health | python -m json.tool 2>/dev/null || curl -s http://localhost/health
    echo ""
    echo ""
    echo -e "${GREEN}================================================${NC}"

    # Ask if user wants to view logs
    echo ""
    read -p "Would you like to view the logs? (y/n): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${YELLOW}Showing logs (Press Ctrl+C to exit)...${NC}"
        echo ""
        sleep 2
        docker-compose logs -f
    else
        echo ""
        echo -e "${CYAN}To view logs later, run: ./docker-manage.sh logs${NC}"
        echo -e "${CYAN}To stop services, run: ./docker-manage.sh stop${NC}"
        echo ""
    fi

else
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}   WARNING: Services may not be fully ready${NC}"
    echo -e "${RED}================================================${NC}"
    echo ""
    echo -e "${YELLOW}The services are starting but health check is not responding yet.${NC}"
    echo ""
    echo -e "${CYAN}You can:${NC}"
    echo -e "  1. Wait a bit longer and try: http://localhost/health"
    echo -e "  2. Check logs: ./docker-manage.sh logs"
    echo -e "  3. Check status: ./docker-manage.sh status"
    echo ""
fi

echo ""
