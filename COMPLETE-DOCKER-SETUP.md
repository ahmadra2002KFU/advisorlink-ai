# 🚀 Complete Docker Setup - Frontend + Backend

**Everything runs in Docker!** No need to run frontend and backend separately.

## What This Does

This Docker setup runs your **entire application** in containers:
- ✅ **Frontend** (React + Vite) - Port 80
- ✅ **Backend** (Node.js + Express) - Port 5000
- ✅ **Database** (SQLite) - Persisted in volume
- ✅ **Nginx** (Built into frontend container)

## 🎯 Quick Start

### One Command to Rule Them All

```powershell
.\START-COMPLETE.ps1
```

That's it! The script will:
1. Build both frontend and backend containers
2. Start all services
3. Wait for them to be ready
4. Open your browser to http://localhost

**First time will take 5-10 minutes to build everything.**

---

## What's Included

### Docker Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Orchestrates frontend + backend |
| `Dockerfile` | Frontend container (React + Nginx) |
| `backend/Dockerfile` | Backend container (Node.js) |
| `.dockerignore` | Frontend build optimization |
| `backend/.dockerignore` | Backend build optimization |

### Services Running

```
┌─────────────────────────────────┐
│   http://localhost (Port 80)    │
│   Frontend Container            │
│   - React Application           │
│   - Nginx Web Server            │
│   - Serves /api to backend      │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   http://localhost:5000         │
│   Backend Container             │
│   - Node.js + Express API       │
│   - SQLite Database             │
│   - Gemini AI Integration       │
└─────────────────────────────────┘
```

---

## 📦 Architecture

### Frontend Container
- **Image**: Node.js 20 Alpine (build) → Nginx Alpine (runtime)
- **Port**: 80 (HTTP), 443 (HTTPS ready)
- **Features**:
  - Production-optimized React build
  - Nginx serves static files
  - API requests proxied to backend
  - Single Page App (SPA) routing

### Backend Container
- **Image**: Node.js 20 Alpine
- **Port**: 5000
- **Features**:
  - Express.js REST API
  - SQLite database (persisted)
  - JWT authentication
  - Gemini AI integration

---

## 🛠️ Management Commands

### Start Everything
```powershell
.\START-COMPLETE.ps1
```

### Manual Start
```powershell
docker-compose up -d --build
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Frontend only
docker-compose logs -f frontend

# Backend only
docker-compose logs -f backend
```

### Stop Everything
```powershell
docker-compose down
```

### Restart Services
```powershell
docker-compose restart
```

### Check Status
```powershell
docker-compose ps
```

### Rebuild Containers
```powershell
# Rebuild everything
docker-compose up -d --build

# Rebuild specific service
docker-compose build frontend
docker-compose build backend
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Your full application |
| **Backend** | http://localhost:5000 | Direct API access |
| **API via Frontend** | http://localhost/api | API through frontend proxy |
| **Health Check** | http://localhost:5000/health | Backend health status |

---

## 📋 Testing Checklist

After starting, verify everything works:

- [ ] Open http://localhost in browser
- [ ] Login page loads correctly
- [ ] Can log in with credentials
- [ ] API calls work (check browser console)
- [ ] No CORS errors
- [ ] Backend health check: http://localhost:5000/health

---

## 🔧 Configuration

### Environment Variables (`.env`)

Only two variables needed:

```env
# Secure random string for JWT tokens
JWT_SECRET=your_jwt_secret_here

# Your Gemini API key
GEMINI_API_KEY=your_gemini_api_key
```

**Generate JWT Secret:**
```powershell
[Convert]::ToBase64String((1..32|%{Get-Random -Minimum 0 -Maximum 256}))
```

### What's Auto-Configured

These are handled automatically:
- ✅ Frontend points to `/api` endpoint
- ✅ Nginx proxies `/api/*` to backend:5000
- ✅ CORS configured for same-origin
- ✅ Database persisted in Docker volume
- ✅ Health checks enabled
- ✅ Auto-restart on failure

---

## 🚀 Deploying to VPS

### 1. Prepare VPS
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose -y
```

### 2. Upload Code
```bash
# Option A: Git
git clone https://github.com/yourusername/mentorlink.git
cd mentorlink/advisorlink-ai

# Option B: SCP
scp -r advisorlink-ai root@your-vps:/opt/
```

### 3. Configure Environment
```bash
cd /opt/advisorlink-ai
nano .env
```

Add your production values:
```env
JWT_SECRET=your_production_jwt_secret
GEMINI_API_KEY=your_api_key
```

### 4. Start Services
```bash
docker-compose up -d --build
```

### 5. Verify Deployment
```bash
# Check logs
docker-compose logs -f

# Check status
docker-compose ps

# Test health
curl http://localhost:5000/health
```

### 6. Access Your App
Open browser: `http://your-vps-ip`

---

## 🔒 SSL/HTTPS Setup

To enable HTTPS on your VPS:

### 1. Install Certbot
```bash
sudo apt install certbot -y
```

### 2. Stop Frontend Container
```bash
docker-compose stop frontend
```

### 3. Get Certificate
```bash
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos
```

### 4. Update Nginx Config
Edit `Dockerfile` to include SSL configuration (see documentation).

### 5. Restart
```bash
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Frontend Not Loading

**Check if container is running:**
```powershell
docker-compose ps
```

**Check frontend logs:**
```powershell
docker-compose logs frontend
```

**Rebuild frontend:**
```powershell
docker-compose build frontend
docker-compose up -d frontend
```

### Backend Not Responding

**Check backend logs:**
```powershell
docker-compose logs backend
```

**Verify database:**
```powershell
docker-compose exec backend ls -la /app/data/
```

**Restart backend:**
```powershell
docker-compose restart backend
```

### API Errors (CORS, 404, etc.)

**Check nginx proxy configuration in `Dockerfile`:**
- Ensure `/api` location proxies to `http://backend:5000/api`

**Check browser console:**
- Look for CORS or network errors
- Verify API URL is `/api` (relative)

**Test backend directly:**
```powershell
Invoke-RestMethod http://localhost:5000/health
```

### Port Already in Use

**Check what's using port 80:**
```powershell
netstat -ano | findstr :80
```

**Stop conflicting service:**
- IIS: `iisreset /stop`
- Apache: `net stop apache2`

**Or change port in `docker-compose.yml`:**
```yaml
ports:
  - "8080:80"  # Use port 8080 instead
```

### Slow Build Times

**First build is slow (5-10 min) - this is normal!**

**Use build cache:**
```powershell
# Don't use --no-cache unless necessary
docker-compose build
```

**Increase Docker resources:**
- Docker Desktop → Settings → Resources
- Increase CPU and Memory

---

## 🔄 Updating Your Application

### Pull Latest Code
```bash
git pull origin main
```

### Rebuild and Restart
```powershell
docker-compose up -d --build
```

### Zero-Downtime Update
```powershell
# Build new images
docker-compose build

# Restart with no downtime
docker-compose up -d --no-deps --build frontend
docker-compose up -d --no-deps --build backend
```

---

## 💾 Database Management

### Backup Database
```powershell
# Create backup
docker-compose exec backend sh -c "cat /app/data/mentorlink.db" > backup.db

# With timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker-compose exec backend sh -c "cat /app/data/mentorlink.db" > "backup_$timestamp.db"
```

### Restore Database
```powershell
# Stop backend
docker-compose stop backend

# Restore
docker cp backup.db mentorlink-backend:/app/data/mentorlink.db

# Start backend
docker-compose start backend
```

### Reset Database (WARNING: Deletes all data!)
```powershell
docker-compose down -v
docker-compose up -d
```

---

## 📊 Monitoring

### View Resource Usage
```powershell
docker stats
```

### Health Checks

Both containers have built-in health checks:
- **Frontend**: Checks if nginx is serving pages
- **Backend**: Checks `/health` endpoint every 30s

**View health status:**
```powershell
docker inspect mentorlink-frontend | Select-String -Pattern "Health" -Context 0,10
docker inspect mentorlink-backend | Select-String -Pattern "Health" -Context 0,10
```

---

## 🎯 Advantages of This Setup

### vs Running Separately
- ✅ **Simpler**: One command to start everything
- ✅ **Consistent**: Same environment everywhere
- ✅ **Portable**: Works on laptop, server, or cloud
- ✅ **Isolated**: No conflicts with other apps

### vs Netlify + Backend Hosting
- ✅ **Cheaper**: Single VPS instead of multiple services
- ✅ **Faster**: Everything on same network
- ✅ **Easier**: One deployment, not two
- ✅ **More Control**: Full access to everything

---

## 🆘 Getting Help

1. **Check logs:**
   ```powershell
   docker-compose logs -f
   ```

2. **Verify containers are running:**
   ```powershell
   docker-compose ps
   ```

3. **Test endpoints:**
   - Frontend: http://localhost
   - Backend: http://localhost:5000/health

4. **Restart everything:**
   ```powershell
   docker-compose restart
   ```

5. **Nuclear option (resets everything):**
   ```powershell
   docker-compose down -v
   docker-compose up -d --build
   ```

---

## 📚 Additional Documentation

- **Full Deployment Guide**: `Claude Docs/docker-deployment-guide.md`
- **Quick Start**: `Claude Docs/quick-start.md`
- **Original Backend-Only**: `DOCKER_README.md`

---

## ✅ Success Checklist

- [ ] Docker Desktop installed and running
- [ ] `.env` file created with JWT_SECRET and GEMINI_API_KEY
- [ ] Ran `.\START-COMPLETE.ps1`
- [ ] Waited for build to complete (5-10 min first time)
- [ ] Opened http://localhost in browser
- [ ] Can see login page
- [ ] Can log in successfully
- [ ] No errors in browser console

---

**You're all set! Everything runs in Docker now. Just run `.\START-COMPLETE.ps1` and go!** 🎉
