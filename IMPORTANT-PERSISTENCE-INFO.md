# Data Persistence & Container Management Guide

## 🔄 What Happens When You...

### Scenario 1: Restart Your Laptop
```
Your laptop shuts down → Boots back up
```

**What Happens:**
- ❌ **Docker containers STOP** (they don't auto-start on Windows by default)
- ✅ **Database data is SAFE** (stored in Docker volume)
- ❌ **Website goes OFFLINE**
- ❌ **Cloudflare tunnel disconnects**

**To Get Back Online:**
```bash
# 1. Start Docker Desktop (if not running)
# 2. Start containers
cd C:\Users\Ahmad\Documents\GitHub\advisorlink-ai
docker-compose up -d

# 3. Start Cloudflare tunnel (if you want external access)
.\cloudflared.exe tunnel --url http://localhost:80
```

**Data Status:**
- ✅ Database: **PRESERVED** (all users, messages, courses intact)
- ✅ User accounts: **PRESERVED**
- ✅ All data: **NO LOSS**

---

### Scenario 2: Update/Rebuild Containers
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

**What Happens:**
- ✅ **Database data is SAFE** (stored in Docker volume `backend-data`)
- ✅ **All user data PRESERVED**
- ⚠️ **Containers rebuilt with new code**

**Important Notes:**
- The database lives in a **Docker volume** (`backend-data`), not in the container
- Rebuilding containers does **NOT** delete volumes
- Your data persists across rebuilds

**Data Status:**
- ✅ Database: **PRESERVED**
- ✅ User accounts: **PRESERVED**
- ✅ Chat history: **PRESERVED**
- ✅ Everything: **SAFE**

---

### Scenario 3: Complete Docker Reset
```bash
docker-compose down -v  # ⚠️ THE -v FLAG DELETES VOLUMES!
```

**What Happens:**
- ❌ **DATABASE DELETED** (volume removed)
- ❌ **ALL DATA LOST**
- ❌ **Users, messages, everything gone**

**⚠️ DANGER ZONE** - Only use `-v` flag if you want to wipe everything!

**Data Status:**
- ❌ Database: **DELETED**
- ❌ All data: **LOST**

---

### Scenario 4: Update Code (Without Rebuilding)
```bash
# Change some code in src/
docker-compose restart
```

**What Happens:**
- ⚠️ **Code changes NOT applied** (compiled code is in container)
- ✅ **Database data is SAFE**
- ⚠️ **Need to rebuild to see changes**

**To Apply Code Changes:**
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

**Data Status:**
- ✅ Database: **PRESERVED**
- ✅ All data: **SAFE**

---

## 📂 Where Your Data Lives

### Database Location:
```
Docker Volume: backend-data
└── /var/lib/docker/volumes/advisorlink-ai_backend-data/_data/
    └── mentorlink.db (your database)

Container Mount: /app/data/
└── mentorlink.db (accessible inside container)
```

### Important Files:
1. **Backend source database**: `backend/mentorlink.db`
   - Used during Docker BUILD
   - Copied into image
   - **NOT used at runtime** (volume overrides it)

2. **Docker volume database**: `advisorlink-ai_backend-data`
   - Used at RUNTIME
   - Persists across container restarts/rebuilds
   - **This is your live database**

3. **Backup database**: `backend/mentorlink.db.backup-20251111-041458`
   - Emergency restore point
   - Keep this safe!

---

## 🔧 Common Scenarios & Commands

### Just Restarted Laptop (Containers Stopped)
```bash
# Start everything
cd C:\Users\Ahmad\Documents\GitHub\advisorlink-ai
docker-compose up -d

# Start tunnel for external access
.\cloudflared.exe tunnel --url http://localhost:80
# Copy the new URL that appears
```

---

### Made Code Changes
```bash
# Stop containers
docker-compose down

# Rebuild with new code
docker-compose build

# Start containers
docker-compose up -d

# Database is automatically preserved!
```

---

### Database Got Corrupted
```bash
# Stop containers
docker-compose down

# Remove corrupted database volume
docker volume rm advisorlink-ai_backend-data

# Restore from backup
cp backend/mentorlink.db.backup-20251111-041458 backend/mentorlink.db

# Rebuild containers (includes fresh database)
docker-compose build --no-cache
docker-compose up -d
```

---

### Want Fresh Start (Delete Everything)
```bash
# ⚠️ WARNING: This deletes ALL data!
docker-compose down -v

# Rebuild from scratch
docker-compose build
docker-compose up -d

# Database will be empty - need to seed data
```

---

## 📋 Startup Checklist (After Laptop Restart)

```bash
# 1. Open PowerShell/Terminal
cd C:\Users\Ahmad\Documents\GitHub\advisorlink-ai

# 2. Start Docker containers
docker-compose up -d

# 3. Wait for containers to start (5-10 seconds)
docker ps  # Verify both containers are running

# 4. Test local access
# Open browser: http://localhost

# 5. (Optional) Start Cloudflare tunnel for external access
.\cloudflared.exe tunnel --url http://localhost:80
# Note the new URL (it changes each time)

# 6. Access your app
# Local: http://localhost
# External: https://[random].trycloudflare.com
```

---

## 🔐 Backing Up Your Database

### Manual Backup
```bash
# Copy from running container
docker cp mentorlink-backend:/app/data/mentorlink.db ./backup-$(date +%Y%m%d).db

# Or use Docker volume directly
docker run --rm -v advisorlink-ai_backend-data:/data -v $(pwd):/backup alpine cp /data/mentorlink.db /backup/backup.db
```

### Automated Backup (Recommended)
Create a scheduled task (Windows) or cron job (Linux) to backup daily:

```powershell
# backup-database.ps1
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupName = "mentorlink-backup-$timestamp.db"
docker cp mentorlink-backend:/app/data/mentorlink.db "C:\Backups\$backupName"
Write-Host "Backup created: $backupName"
```

---

## ⚠️ Important Warnings

### ❌ DON'T DO THIS:
```bash
# This deletes your database!
docker-compose down -v

# This removes all your data!
docker volume prune

# This wipes everything!
docker system prune -a --volumes
```

### ✅ SAFE OPERATIONS:
```bash
# Restart containers (data safe)
docker-compose restart

# Rebuild containers (data safe)
docker-compose down
docker-compose build
docker-compose up -d

# Stop containers (data safe)
docker-compose down

# View logs
docker logs mentorlink-backend
docker logs mentorlink-frontend
```

---

## 🎯 Quick Reference

| Action | Command | Data Safe? |
|--------|---------|------------|
| Restart laptop | `docker-compose up -d` | ✅ Yes |
| Restart containers | `docker-compose restart` | ✅ Yes |
| Stop containers | `docker-compose down` | ✅ Yes |
| Rebuild containers | `docker-compose build` | ✅ Yes |
| Update code | `docker-compose down && docker-compose build && docker-compose up -d` | ✅ Yes |
| Delete volumes | `docker-compose down -v` | ❌ **NO! Data deleted!** |
| Delete all Docker data | `docker system prune -a --volumes` | ❌ **NO! Everything deleted!** |

---

## 💾 Data Persistence Summary

**Your database is stored in:**
- Docker Volume: `advisorlink-ai_backend-data`
- Location: `/var/lib/docker/volumes/advisorlink-ai_backend-data/_data/`

**This volume:**
- ✅ Survives container restarts
- ✅ Survives container rebuilds
- ✅ Survives laptop reboots
- ✅ Survives Docker Desktop restarts
- ❌ Deleted ONLY if you explicitly remove it with `-v` flag

**Best Practice:**
- Keep `backend/mentorlink.db.backup-20251111-041458` safe
- Make regular backups
- Never use `docker-compose down -v` unless you want to start fresh

---

## 🆘 Emergency Recovery

**If you accidentally deleted the volume:**

1. Stop containers:
   ```bash
   docker-compose down
   ```

2. Restore from backup:
   ```bash
   cp backend/mentorlink.db.backup-20251111-041458 backend/mentorlink.db
   ```

3. Rebuild containers:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. Verify data is back:
   ```bash
   docker exec mentorlink-backend ls -lh /app/data/
   ```

Your data should be restored!

---

## 📞 Quick Help

**Containers won't start after reboot?**
- Make sure Docker Desktop is running
- Run: `docker-compose up -d`

**Made code changes but don't see them?**
- Run: `docker-compose down && docker-compose build && docker-compose up -d`

**Database seems empty?**
- Check volume: `docker volume ls | grep backend-data`
- Verify file: `docker exec mentorlink-backend ls -lh /app/data/`
- If missing, restore from backup (see Emergency Recovery)

**Need external access?**
- Run: `.\cloudflared.exe tunnel --url http://localhost:80`
- Note: URL changes each time (temporary tunnel)

---

**Remember: Your data is SAFE as long as you don't use the `-v` flag when stopping containers!**
