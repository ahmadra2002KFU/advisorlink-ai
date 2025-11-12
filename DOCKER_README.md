# MentorLink Docker Deployment

This directory contains everything you need to deploy MentorLink using Docker.

## 🚀 Quick Start

### Windows (PowerShell)
```powershell
# 1. Create environment file
Copy-Item .env.production .env

# 2. Edit .env with your values
notepad .env

# 3. Start services
.\docker-manage.ps1 start

# 4. Check logs
.\docker-manage.ps1 logs
```

### Linux/Mac
```bash
# 1. Create environment file
cp .env.production .env

# 2. Edit .env with your values
nano .env

# 3. Start services
./docker-manage.sh start

# 4. Check logs
./docker-manage.sh logs
```

## 📋 What's Included

### Docker Configuration
- **`backend/Dockerfile`** - Multi-stage build for optimized production image
- **`docker-compose.yml`** - Orchestrates all services
- **`.dockerignore`** - Excludes unnecessary files from image

### Nginx Configuration
- **`nginx/nginx.conf`** - Main nginx configuration
- **`nginx/conf.d/default.conf`** - Site-specific config with SSL support

### Management Scripts
- **`docker-manage.sh`** - Bash script for Linux/Mac
- **`docker-manage.ps1`** - PowerShell script for Windows

### Documentation
- **`Claude Docs/docker-deployment-guide.md`** - Complete deployment guide
- **`Claude Docs/quick-start.md`** - Fast-track guide

## 📦 Services

### Backend (Node.js API)
- **Port:** 5000
- **Database:** SQLite (persisted in volume)
- **Health Check:** `/health` endpoint

### Nginx (Reverse Proxy)
- **Port:** 80 (HTTP), 443 (HTTPS)
- **Purpose:** Routes requests to backend, handles SSL

### Certbot (SSL)
- **Purpose:** Manages Let's Encrypt SSL certificates
- **Auto-renewal:** Every 12 hours

## 🔧 Configuration

### Required Environment Variables

Create a `.env` file with these values:

```env
# JWT Secret (generate a secure one!)
JWT_SECRET=your_secure_random_string_here

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL (your Netlify deployment)
FRONTEND_URL=https://your-netlify-site.netlify.app
```

**Generate secure JWT secret:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32|%{Get-Random -Minimum 0 -Maximum 256}))
```

## 🛠️ Common Commands

### Using Management Scripts

**Windows:**
```powershell
.\docker-manage.ps1 start      # Start services
.\docker-manage.ps1 stop       # Stop services
.\docker-manage.ps1 restart    # Restart services
.\docker-manage.ps1 logs       # View logs
.\docker-manage.ps1 status     # Check status
.\docker-manage.ps1 backup     # Backup database
.\docker-manage.ps1 health     # Health check
```

**Linux/Mac:**
```bash
./docker-manage.sh start       # Start services
./docker-manage.sh stop        # Stop services
./docker-manage.sh restart     # Restart services
./docker-manage.sh logs        # View logs
./docker-manage.sh status      # Check status
./docker-manage.sh backup      # Backup database
./docker-manage.sh health      # Health check
```

### Using Docker Compose Directly

```bash
# Start services (detached mode)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View running containers
docker-compose ps
```

## 🌐 Deployment Workflow

### 1. Local Testing
Test on your laptop first:
```bash
# Configure for local testing
cp .env.production .env
# Edit .env with localhost values

# Start services
docker-compose up

# Test in browser
# http://localhost/health
```

### 2. VPS Deployment
Once local testing passes:

1. **SSH to VPS:** `ssh root@your-vps-ip`
2. **Install Docker:** Run install script
3. **Upload code:** Git clone or SCP
4. **Configure:** Create `.env` with production values
5. **Start:** `docker-compose up -d`
6. **Verify:** Check logs and health endpoint

### 3. Netlify Configuration
Update Netlify environment variable:
```
VITE_API_URL=http://your-vps-ip/api
```
Then redeploy your Netlify site.

### 4. SSL Setup (Optional but Recommended)
```bash
./docker-manage.sh ssl your-domain.com your-email@example.com
```

## 📊 Monitoring

### Health Checks
The backend includes automatic health checks:
- **Endpoint:** `/health`
- **Interval:** 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3

### View Health Status
```bash
docker inspect mentorlink-backend | grep -A 10 Health
```

### External Monitoring
Set up external monitoring with:
- UptimeRobot (free)
- Pingdom
- StatusCake

Monitor: `https://your-domain.com/health`

## 💾 Database Management

### Backup
```bash
# Using management script
./docker-manage.sh backup

# Manual backup
docker cp mentorlink-backend:/app/data/mentorlink.db ./backup.db
```

### Restore
```bash
# Using management script
./docker-manage.sh restore ./backups/backup-file.db

# Manual restore
docker cp ./backup.db mentorlink-backend:/app/data/mentorlink.db
docker-compose restart backend
```

### Reset Database
```bash
# WARNING: Deletes all data!
docker-compose down -v
docker-compose up -d
```

## 🔒 Security Checklist

- [ ] Generate strong JWT_SECRET
- [ ] Never commit `.env` file
- [ ] Use HTTPS in production
- [ ] Enable VPS firewall (UFW)
- [ ] Keep Docker updated
- [ ] Regular database backups
- [ ] Monitor application logs
- [ ] Use environment-specific secrets

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check logs
docker-compose logs

# Check if ports are in use
netstat -tulpn | grep :80
```

### Database Issues
```bash
# Check database file
docker-compose exec backend ls -la /app/data/

# Reset database
docker-compose down -v
docker-compose up -d
```

### Connection Refused
```bash
# Verify backend is running
docker-compose ps

# Test health endpoint
curl http://localhost/health

# Check nginx config
docker-compose exec nginx nginx -t
```

### High Memory Usage
```bash
# Check resource usage
docker stats

# Restart services
docker-compose restart
```

## 📚 Documentation

- **Full Guide:** `Claude Docs/docker-deployment-guide.md`
- **Quick Start:** `Claude Docs/quick-start.md`
- **This File:** `DOCKER_README.md`

## 🔄 Updates

### Update Application Code
```bash
# Pull latest code
git pull

# Rebuild and restart (zero-downtime)
docker-compose build backend
docker-compose up -d --no-deps backend
```

### Update Dependencies
```bash
# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## 🎯 Architecture

```
┌─────────────┐
│   Internet  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Nginx    │ :80, :443
│  (Reverse   │
│   Proxy)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │ :5000
│  (Node.js)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   SQLite    │
│  (Volume)   │
└─────────────┘
```

## 🆘 Support

If you need help:

1. **Check logs first:** `docker-compose logs -f`
2. **Review troubleshooting section** in this README
3. **Read full guide:** `Claude Docs/docker-deployment-guide.md`
4. **Check Docker docs:** https://docs.docker.com/

## 📄 License

See main project LICENSE file.

---

**Ready to deploy?** Start with the Quick Start guide above or dive into the full deployment guide in `Claude Docs/`.
