# Docker Quick Start Guide

Ultra-fast guide to get MentorLink running with Docker.

## Local Testing (5 minutes)

### 1. Create Environment File
```bash
cd advisorlink-ai
cp .env.production .env
```

### 2. Edit `.env` File
```env
JWT_SECRET=my_super_secret_jwt_key_12345
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:8080
```

### 3. Start Docker
```bash
docker-compose up --build
```

### 4. Test
Open browser: http://localhost/health

Should see: `{"status":"ok","timestamp":"..."}`

### 5. Stop
Press `Ctrl+C` or run:
```bash
docker-compose down
```

---

## VPS Deployment (10 minutes)

### 1. SSH to VPS
```bash
ssh root@your-vps-ip
```

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose -y
```

### 3. Upload Your Code
```bash
# Option A: Clone from Git
git clone https://github.com/yourusername/mentorlink.git
cd mentorlink/advisorlink-ai

# Option B: Use SCP from your laptop
# On your laptop:
scp -r advisorlink-ai root@your-vps-ip:/opt/
```

### 4. Configure Environment
```bash
cd /opt/advisorlink-ai
nano .env
```

Add production values:
```env
JWT_SECRET=GENERATE_A_NEW_SECRET
GEMINI_API_KEY=your_key
FRONTEND_URL=https://your-netlify-site.netlify.app
```

### 5. Start Services
```bash
docker-compose up -d
```

### 6. Verify
```bash
curl http://localhost/health
docker-compose logs -f backend
```

### 7. Configure Netlify
In Netlify Dashboard:
- Add env var: `VITE_API_URL=http://your-vps-ip/api`
- Redeploy site

### 8. Test Login
Go to your Netlify URL and try logging in!

---

## Common Commands

```bash
# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Update code and restart
git pull
docker-compose up -d --build

# Backup database
docker cp mentorlink-backend:/app/data/mentorlink.db ./backup.db
```

---

## Troubleshooting

**"Connection refused" error:**
```bash
docker-compose ps          # Check if running
docker-compose logs backend  # Check logs
```

**Can't access from browser:**
- Check VPS firewall: `sudo ufw allow 80`
- Check container: `docker-compose ps`

**Database issues:**
```bash
docker-compose down -v  # Reset everything
docker-compose up -d
```

---

## Next Steps

1. ✅ Test locally
2. ✅ Deploy to VPS
3. Set up SSL (see full guide)
4. Set up backups
5. Monitor with UptimeRobot

See `docker-deployment-guide.md` for detailed instructions.
