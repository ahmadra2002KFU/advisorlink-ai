# MentorLink Docker Deployment Guide

Complete guide for deploying MentorLink using Docker on a VPS.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Testing](#local-testing)
3. [VPS Deployment](#vps-deployment)
4. [SSL Setup](#ssl-setup)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### On Your Development Machine
- Docker Desktop installed
- Docker Compose installed
- Git (for cloning/pulling updates)

### On Your VPS
- Ubuntu 22.04 or newer (recommended)
- Root or sudo access
- Minimum 1GB RAM, 1 CPU core
- Domain name (optional, but recommended for SSL)

---

## Local Testing

Test the Docker setup on your laptop before deploying to VPS.

### Step 1: Navigate to Project Directory

```bash
cd C:\00-Code\MentorLink2\advisorlink-ai
```

### Step 2: Create Environment File

```bash
cp .env.production .env
```

Edit `.env` and fill in your values:

```env
JWT_SECRET=your_secure_random_string_here
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:8080
```

**Generate a secure JWT secret:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32|%{Get-Random -Minimum 0 -Maximum 256}))
```

### Step 3: Build and Run

```bash
docker-compose up --build
```

This will:
- Build the backend Docker image
- Start the backend on port 5000
- Start nginx on port 80
- Create a persistent volume for the SQLite database

### Step 4: Test Locally

Open your browser and test:
- Health check: http://localhost/health
- API: http://localhost/api

**Test API endpoints:**
```bash
# Windows PowerShell
Invoke-RestMethod -Uri http://localhost/health

# Linux/Mac
curl http://localhost/health
```

### Step 5: Stop Containers

```bash
docker-compose down
```

To also remove volumes (database):
```bash
docker-compose down -v
```

---

## VPS Deployment

### Step 1: Prepare Your VPS

**SSH into your VPS:**
```bash
ssh root@your-vps-ip
```

**Update system:**
```bash
sudo apt update && sudo apt upgrade -y
```

**Install Docker:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group (optional)
sudo usermod -aG docker $USER
```

**Install Git:**
```bash
sudo apt install git -y
```

### Step 2: Clone Your Repository

```bash
cd /opt
sudo git clone https://github.com/yourusername/mentorlink.git
cd mentorlink/advisorlink-ai
```

Or upload files via SCP/SFTP.

### Step 3: Configure Environment Variables

```bash
sudo nano .env
```

Add your production values:
```env
JWT_SECRET=your_production_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=https://your-netlify-site.netlify.app
```

**Important:** Use a different JWT_SECRET for production!

### Step 4: Initial Database Setup

If you need to initialize the database with seed data:

```bash
# Build the backend image first
docker-compose build backend

# Run seed script (if you have one)
docker-compose run --rm backend npm run seed
```

### Step 5: Start the Application

```bash
docker-compose up -d
```

The `-d` flag runs containers in detached mode (background).

### Step 6: Verify Deployment

```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f backend

# Test health endpoint
curl http://localhost/health
```

### Step 7: Configure Netlify

In your Netlify dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `http://your-vps-ip/api` or `https://your-domain.com/api`
3. **Redeploy your site**

---

## SSL Setup (HTTPS)

### Prerequisites
- A domain name pointing to your VPS IP
- Ports 80 and 443 open on your firewall

### Step 1: Update Nginx Configuration

Edit `nginx/conf.d/default.conf`:

```bash
sudo nano nginx/conf.d/default.conf
```

Uncomment the HTTPS server block and update `your-domain.com` to your actual domain.

### Step 2: Get SSL Certificate

```bash
# Stop nginx temporarily
docker-compose stop nginx

# Request certificate
docker-compose run --rm certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos

# Start nginx again
docker-compose up -d nginx
```

### Step 3: Auto-Renewal

The certbot service in docker-compose.yml will automatically renew certificates every 12 hours.

Verify renewal works:
```bash
docker-compose run --rm certbot renew --dry-run
```

### Step 4: Update Netlify

Update the environment variable in Netlify:
```
VITE_API_URL=https://your-domain.com/api
```

Redeploy your Netlify site.

---

## Management Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Nginx only
docker-compose logs -f nginx

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Or with no downtime (build first, then restart)
docker-compose build backend
docker-compose up -d --no-deps backend
```

### Database Backup
```bash
# Backup SQLite database
docker-compose exec backend sh -c 'cp /app/data/mentorlink.db /app/data/mentorlink-backup-$(date +%Y%m%d).db'

# Copy backup to host
docker cp mentorlink-backend:/app/data/mentorlink-backup-*.db ./backups/
```

### Stop and Remove Everything
```bash
# Stop containers
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker-compose logs backend
```

**Common issues:**
- Missing `.env` file
- Invalid environment variables
- Port already in use

### Database Issues

**Reset database:**
```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run seed
```

**Check database location:**
```bash
docker-compose exec backend ls -la /app/data/
```

### Connection Refused Errors

**Check if backend is running:**
```bash
docker-compose ps
curl http://localhost:5000/health
```

**Check nginx configuration:**
```bash
docker-compose exec nginx nginx -t
```

### Port Conflicts

**Check what's using port 80/443:**
```bash
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

**Stop conflicting service:**
```bash
sudo systemctl stop apache2  # if Apache is running
```

### High Memory Usage

**Check container resource usage:**
```bash
docker stats
```

**Restart containers:**
```bash
docker-compose restart
```

### SSL Certificate Issues

**Check certificate:**
```bash
docker-compose exec nginx ls -la /etc/letsencrypt/live/your-domain.com/
```

**Force certificate renewal:**
```bash
docker-compose run --rm certbot renew --force-renewal
docker-compose restart nginx
```

---

## Security Best Practices

1. **Never commit `.env` file** - It contains secrets
2. **Use strong JWT_SECRET** - Generate with OpenSSL
3. **Keep Docker updated** - Run `sudo apt update && sudo apt upgrade`
4. **Enable UFW firewall:**
   ```bash
   sudo ufw allow 22/tcp   # SSH
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   sudo ufw enable
   ```
5. **Regular backups** - Automate database backups
6. **Monitor logs** - Set up log rotation
7. **Use HTTPS** - Always in production

---

## Performance Optimization

### Enable Docker Logging Limits

Edit `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### Resource Limits

Add to `docker-compose.yml` under backend service:
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      memory: 256M
```

---

## Monitoring

### Health Checks

The backend includes health checks:
- Interval: 30s
- Timeout: 10s
- Retries: 3

**Check health status:**
```bash
docker inspect mentorlink-backend | grep -A 10 Health
```

### Uptime Monitoring

Consider using external monitoring:
- UptimeRobot (free)
- Pingdom
- StatusCake

Monitor this endpoint: `https://your-domain.com/health`

---

## Next Steps

1. ✅ Test locally on your laptop
2. ✅ Deploy to VPS
3. ✅ Set up SSL certificate
4. ✅ Configure Netlify environment variables
5. ✅ Test the full application
6. Set up automated backups
7. Configure monitoring
8. Set up CI/CD (optional)

---

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Review this guide's troubleshooting section
3. Check Docker documentation
4. Verify environment variables

**Useful Links:**
- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Let's Encrypt: https://letsencrypt.org/
