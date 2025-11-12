#!/bin/bash

# MentorLink VPS Deployment Script
# Run this on your VPS to deploy/update the application

set -e

echo "================================================"
echo "   MentorLink VPS Deployment"
echo "================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    echo "Install Docker first: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed"
    echo "Install it: sudo apt install docker-compose -y"
    exit 1
fi

echo "Stopping old containers..."
docker-compose down

echo ""
echo "Building fresh images..."
docker-compose build --no-cache

echo ""
echo "Starting services..."
docker-compose up -d

echo ""
echo "Waiting for services to start..."
sleep 10

echo ""
echo "Copying database..."
if [ -f backend/mentorlink.db ]; then
    docker cp backend/mentorlink.db mentorlink-backend:/app/data/mentorlink.db
    echo "Database copied"
else
    echo "Warning: backend/mentorlink.db not found, skipping"
fi

echo ""
echo "Setting database permissions..."
docker-compose exec -u root -T backend sh -c "chown -R nodejs:nodejs /app/data && chmod -R 775 /app/data"

echo ""
echo "Restarting backend..."
docker-compose restart backend

echo ""
echo "Waiting for restart..."
sleep 5

echo ""
echo "================================================"
echo "   Deployment Complete!"
echo "================================================"
echo ""
echo "Checking services..."
docker-compose ps

echo ""
echo "Testing backend health..."
curl -s http://localhost:5000/health || echo "Backend not responding yet"

echo ""
echo "Your application is available at:"
echo "  http://$(hostname -I | awk '{print $1}')"
echo ""
echo "View logs: docker-compose logs -f"
echo "================================================"
