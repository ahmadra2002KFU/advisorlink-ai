# Free Permanent Domain Setup Guide

## 🎯 Goal
Get a permanent domain like `mentorlink.yourdomain.com` that doesn't change every time you restart.

---

## ✨ Best Free Options

### Option 1: Cloudflare Tunnel + Free Domain (RECOMMENDED)
**Cost:** FREE
**Setup Time:** 15-20 minutes
**Permanence:** Forever (as long as you keep laptop running)

#### Step 1: Get a Free Domain

**Free Domain Providers:**

1. **Freenom** (FREE - .tk, .ml, .ga, .cf, .gq domains)
   - Website: https://www.freenom.com
   - Domains: yourname.tk, yourname.ml, etc.
   - Duration: Free for 12 months (renewable)
   - ⚠️ Sometimes unavailable in certain countries

2. **DuckDNS** (FREE - subdomain only)
   - Website: https://www.duckdns.org
   - Domain: yourname.duckdns.org
   - Duration: Forever
   - ✅ **EASIEST** - No registration needed!

3. **No-IP** (FREE - subdomain)
   - Website: https://www.noip.com
   - Domain: yourname.ddns.net
   - Duration: Free (confirm every 30 days)

4. **Afraid.org** (FREE - subdomain)
   - Website: https://freedns.afraid.org
   - Domain: yourname.mooo.com (many options)
   - Duration: Forever

**RECOMMENDED FOR YOU: DuckDNS** (simplest, no email needed)

---

#### Step 2: Setup DuckDNS (EASIEST METHOD)

1. **Visit:** https://www.duckdns.org

2. **Sign in with:**
   - Google, GitHub, Reddit, or Twitter account
   - No registration form!

3. **Create your subdomain:**
   ```
   Choose: mentorlink (or any name you want)
   You'll get: mentorlink.duckdns.org
   ```

4. **Get your token:**
   - Copy the token shown on your account page
   - Example: `12345678-1234-1234-1234-123456789012`

5. **Update IP (one-time):**
   ```bash
   # Update DuckDNS with your current IP
   curl "https://www.duckdns.org/update?domains=mentorlink&token=YOUR_TOKEN&ip="
   ```

---

#### Step 3: Setup Cloudflare Tunnel (Named Tunnel)

**A. Install cloudflared** (you already have this ✅)

**B. Login to Cloudflare:**
```powershell
cd C:\Users\Ahmad\Documents\GitHub\advisorlink-ai
.\cloudflared.exe tunnel login
```
- Browser opens → Login/Create Cloudflare account (FREE)
- Authorize access

**C. Create Named Tunnel:**
```powershell
# Create tunnel named "mentorlink"
.\cloudflared.exe tunnel create mentorlink

# Output will show:
# Created tunnel mentorlink with id: abc123def456
# Copy this ID!
```

**D. Create Configuration File:**

Create file: `cloudflared-config.yml` in your project folder:

```yaml
tunnel: abc123def456  # Your tunnel ID from above
credentials-file: C:\Users\Ahmad\.cloudflared\abc123def456.json

ingress:
  - hostname: mentorlink.duckdns.org
    service: http://localhost:80
  - service: http_status:404
```

**E. Route DNS:**
```powershell
.\cloudflared.exe tunnel route dns mentorlink mentorlink.duckdns.org
```

**F. Run Tunnel:**
```powershell
# Test run
.\cloudflared.exe tunnel run mentorlink

# If works, install as Windows service (auto-start)
.\cloudflared.exe service install
```

---

#### Step 4: Access Your App
Your app is now at: **https://mentorlink.duckdns.org** 🎉

---

### Option 2: Cloudflare Tunnel + Cloudflare Domain (Better but requires domain)

If you have a domain (or buy one for ~$10/year):

1. **Add domain to Cloudflare** (FREE)
   - Go to https://dash.cloudflare.com
   - Add your domain
   - Change nameservers at your registrar

2. **Create tunnel** (same as above)

3. **Route traffic:**
   ```powershell
   .\cloudflared.exe tunnel route dns mentorlink mentorlink.yourdomain.com
   ```

4. **Access at:** https://mentorlink.yourdomain.com

**Benefits:**
- Professional domain
- Better for production
- More reliable than free domains

---

### Option 3: ngrok Free Tier (Subdomain)

**Cost:** FREE
**Domain:** random-name-12345.ngrok-free.app (semi-permanent)
**Setup Time:** 5 minutes

#### Setup:
1. **Create account:** https://ngrok.com/signup (FREE)

2. **Install ngrok:**
   ```powershell
   # Download from https://ngrok.com/download
   # Or use: choco install ngrok
   ```

3. **Get authtoken:**
   - Login → Dashboard → Your Authtoken
   - Copy token

4. **Configure:**
   ```powershell
   ngrok authtoken YOUR_TOKEN_HERE
   ```

5. **Run tunnel:**
   ```powershell
   ngrok http 80
   ```

6. **Get permanent subdomain** (paid feature $8/mo)
   - Free tier: Domain changes on restart
   - Paid: Custom subdomain (yourname.ngrok.app)

---

### Option 4: LocalTunnel (Subdomain)

**Cost:** FREE
**Domain:** mentorlink.loca.lt (requested name)
**Setup Time:** 2 minutes

```bash
# Install
npm install -g localtunnel

# Run
lt --port 80 --subdomain mentorlink

# Access at: https://mentorlink.loca.lt
```

**Note:** Subdomain not guaranteed, might get random name

---

## 🏆 Recommendation Matrix

| Need | Best Option | Cost | Permanence |
|------|-------------|------|------------|
| **Quick Demo** | Quick Cloudflare Tunnel | FREE | Temporary |
| **Personal Project** | DuckDNS + Cloudflare Tunnel | FREE | Forever |
| **Professional** | Buy domain + Cloudflare | $10/year | Forever |
| **School Project** | DuckDNS + Cloudflare Tunnel | FREE | Forever |
| **Production App** | Buy domain + Cloud hosting | $5-15/mo | Forever |

---

## 🚀 Quick Start: DuckDNS + Cloudflare (RECOMMENDED)

**Total Time: 15 minutes**

### Step-by-Step:

1. **Get DuckDNS domain** (2 min)
   - Go to: https://www.duckdns.org
   - Login with Google/GitHub
   - Create subdomain: `mentorlink.duckdns.org`
   - Note your token

2. **Login to Cloudflare** (1 min)
   ```powershell
   cd C:\Users\Ahmad\Documents\GitHub\advisorlink-ai
   .\cloudflared.exe tunnel login
   ```

3. **Create named tunnel** (2 min)
   ```powershell
   .\cloudflared.exe tunnel create mentorlink
   # Copy the tunnel ID shown
   ```

4. **Create config file** (3 min)

   Create `cloudflared-config.yml`:
   ```yaml
   tunnel: YOUR_TUNNEL_ID_HERE
   credentials-file: C:\Users\Ahmad\.cloudflared\YOUR_TUNNEL_ID_HERE.json

   ingress:
     - hostname: mentorlink.duckdns.org
       service: http://localhost:80
     - service: http_status:404
   ```

5. **Route DNS** (1 min)
   ```powershell
   .\cloudflared.exe tunnel route dns mentorlink mentorlink.duckdns.org
   ```

6. **Run tunnel** (1 min)
   ```powershell
   # Test first
   .\cloudflared.exe tunnel --config cloudflared-config.yml run mentorlink

   # If works, install as service
   .\cloudflared.exe service install
   ```

7. **Done!** Access at: https://mentorlink.duckdns.org

---

## 🔧 Auto-Start on Laptop Boot

### Option A: Windows Service (Cloudflare Tunnel)
```powershell
# Install tunnel as Windows service
.\cloudflared.exe service install

# Service starts automatically on boot!
```

### Option B: Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: "At startup"
4. Action: Start program
   - Program: `C:\Users\Ahmad\Documents\GitHub\advisorlink-ai\start-all.bat`

Create `start-all.bat`:
```batch
@echo off
cd C:\Users\Ahmad\Documents\GitHub\advisorlink-ai
docker-compose up -d
.\cloudflared.exe tunnel run mentorlink
```

---

## 📊 Comparison Table

| Service | Domain | Free? | Permanent? | SSL | Auto-Start |
|---------|--------|-------|------------|-----|------------|
| Quick CF Tunnel | random.trycloudflare.com | ✅ Yes | ❌ Changes | ✅ Yes | ❌ No |
| DuckDNS + CF | yourname.duckdns.org | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Freenom + CF | yourname.tk | ✅ Yes | ✅ Yes (renew yearly) | ✅ Yes | ✅ Yes |
| ngrok Free | random.ngrok-free.app | ✅ Yes | ⚠️ Semi | ✅ Yes | ❌ No |
| ngrok Paid | yourname.ngrok.app | ❌ $8/mo | ✅ Yes | ✅ Yes | ✅ Yes |
| Custom Domain | yourdomain.com | ❌ $10/yr | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🎁 Bonus: Get a Real Domain Cheap

If you want a professional domain:

### Cheap Registrars:
1. **Namecheap** - $0.99 first year (.com)
2. **Porkbun** - $3-5/year
3. **Cloudflare Registrar** - At-cost pricing (~$9/year)
4. **Google Domains** (Now Squarespace) - $12/year

### Free Domain for Students:
- **GitHub Student Pack**: Free .me domain (1 year)
  - https://education.github.com/pack
  - Includes free domain from Namecheap

---

## 🆘 Troubleshooting

### DNS not resolving?
- Wait 5-10 minutes for DNS propagation
- Clear DNS cache: `ipconfig /flushdns`
- Try different network (mobile data)

### Tunnel won't start?
- Check credentials file exists
- Verify tunnel ID in config matches created tunnel
- Run: `.\cloudflared.exe tunnel list` to see your tunnels

### Domain expired?
- Freenom: Renew before 15 days of expiry
- DuckDNS: Update IP at least once every 30 days
- No-IP: Confirm hostname monthly

---

## ✅ Final Recommendation

**For Your School Project:**

Use **DuckDNS + Cloudflare Named Tunnel**

**Why:**
- ✅ Completely FREE
- ✅ Permanent domain (mentorlink.duckdns.org)
- ✅ Automatic HTTPS
- ✅ No credit card needed
- ✅ Can auto-start on boot
- ✅ Works from anywhere
- ✅ Professional enough for demos

**When to upgrade:**
- Real business → Buy custom domain ($10/year)
- High traffic → Cloud hosting (Railway/Render)
- 24/7 availability → VPS hosting

---

Want me to help you set up DuckDNS + Cloudflare named tunnel right now? It'll take about 15 minutes and you'll have a permanent domain! 🚀
