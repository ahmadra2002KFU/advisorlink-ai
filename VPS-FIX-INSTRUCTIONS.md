# 🔧 VPS CORS Fix - Deploy Updated Version

## What Was Fixed

✅ **Frontend API URL**: Changed from `http://localhost:5000/api` to `/api` (relative path)
✅ **Backend CORS**: Updated to allow any origin in production
✅ **Works on VPS**: No more CORS errors!

---

## 🚀 Deploy to Your VPS (138.68.137.154)

### Option 1: Upload Updated Code (Recommended)

#### Step 1: Upload Files from Your Laptop
```powershell
# From your laptop (Windows PowerShell)
cd C:\00-Code\MentorLink2\advisorlink-ai

# Upload to VPS
scp -r * root@138.68.137.154:/opt/advisorlink-ai/
```

#### Step 2: Deploy on VPS
```bash
# SSH to your VPS
ssh root@138.68.137.154

# Navigate to project
cd /opt/advisorlink-ai

# Make script executable
chmod +x VPS-DEPLOY.sh

# Run deployment script
./VPS-DEPLOY.sh
```

Done! Your app will be at: **http://138.68.137.154**

**Note:** Database is now automatically included in the Docker image - no manual copying needed!

---

### Option 2: Git Push/Pull (If Using Git)

#### Step 1: Commit Changes (On Laptop)
```powershell
cd C:\00-Code\MentorLink2\advisorlink-ai

git add .
git commit -m "Fix CORS and API URL for production"
git push origin main
```

#### Step 2: Pull and Deploy (On VPS)
```bash
# SSH to VPS
ssh root@138.68.137.154

# Pull latest code
cd /opt/advisorlink-ai
git pull origin main

# Deploy
./VPS-DEPLOY.sh
```

---

### Option 3: Manual Deployment (On VPS)

If you can't upload files, manually apply these changes on the VPS:

#### Fix 1: Frontend API URL
```bash
# Edit file
nano /opt/advisorlink-ai/src/api/client.ts

# Change line 3 from:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

# To:
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

# Save: Ctrl+X, Y, Enter
```

#### Fix 2: Backend CORS
```bash
# Edit file
nano /opt/advisorlink-ai/backend/src/server.ts

# Replace the CORS configuration (lines 19-28) with:
```
```javascript
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL]
      : ['http://localhost', 'http://localhost:8080'];
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

#### Then Deploy:
```bash
cd /opt/advisorlink-ai

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Database is automatically included in the container image!
# No manual copying needed.
```

---

## ✅ Verify It Works

### Check Services
```bash
docker-compose ps
docker-compose logs backend | tail -20
```

### Test Health
```bash
curl http://localhost:5000/health
```

### Test from Browser
Open: **http://138.68.137.154**

Try logging in - CORS error should be gone!

---

## 🔍 What Changed

### Before (❌ Broken)
- Frontend called `http://localhost:5000/api` (absolute URL)
- Backend CORS only allowed `http://localhost`
- Result: CORS error on VPS

### After (✅ Fixed)
- Frontend calls `/api` (relative URL, proxied by nginx)
- Backend CORS allows any origin in production
- Result: Works on VPS!

---

## 📁 Files Changed

1. **`src/api/client.ts`** - Frontend API URL
2. **`backend/src/server.ts`** - Backend CORS policy
3. **`VPS-DEPLOY.sh`** - New deployment script

---

## 🆘 Troubleshooting

### Still Getting CORS Error?

**Check backend logs:**
```bash
docker-compose logs backend | grep -i cors
```

**Verify NODE_ENV:**
```bash
docker-compose exec backend sh -c 'echo $NODE_ENV'
# Should show: production
```

### Frontend Still Calling localhost:5000?

**You need to rebuild the frontend:**
```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Can't Access from Browser?

**Check firewall:**
```bash
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## 🎯 Quick Verification Checklist

After deployment, verify:

- [ ] `docker-compose ps` shows both containers healthy
- [ ] `curl http://localhost:5000/health` returns `{"status":"ok"}`
- [ ] Browser can open `http://138.68.137.154`
- [ ] Can login without CORS errors
- [ ] AI chat works

---

## 📚 Additional Info

### Your VPS Info
- **IP:** 138.68.137.154
- **App URL:** http://138.68.137.154
- **Backend:** http://138.68.137.154/api (proxied)

### Environment Variables
Make sure `.env` on VPS has:
```env
JWT_SECRET=your_secure_secret
GLM_API_KEY=your_glm_key
```

---

**Deploy the fix now and your CORS issue will be resolved!** 🚀
