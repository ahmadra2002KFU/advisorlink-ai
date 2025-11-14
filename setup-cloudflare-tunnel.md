# Cloudflare Tunnel Setup - Bypass Router Configuration

## Why Use Cloudflare Tunnel?
- ✅ **FREE** - No cost
- ✅ **No router configuration needed** - Bypasses port forwarding
- ✅ **Works with CGNAT** - Even if your ISP blocks ports
- ✅ **Free HTTPS/SSL** - Secure connections automatically
- ✅ **Custom domain** - Use your own domain or Cloudflare's

## Setup Steps (10 minutes)

### Step 1: Create Cloudflare Account
1. Go to: https://dash.cloudflare.com/sign-up
2. Create free account
3. Verify email

### Step 2: Install Cloudflare Tunnel (cloudflared)

**On Windows:**
1. Download: https://github.com/cloudflare/cloudflared/releases/latest
2. Get: `cloudflared-windows-amd64.exe`
3. Rename to: `cloudflared.exe`
4. Move to: `C:\Users\Ahmad\Documents\GitHub\advisorlink-ai\`

**Or use PowerShell:**
```powershell
# Download cloudflared
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
```

### Step 3: Login to Cloudflare
Open PowerShell in your project folder:
```powershell
cd C:\Users\Ahmad\Documents\GitHub\advisorlink-ai
.\cloudflared.exe tunnel login
```
- Browser will open
- Select your domain (or create one)
- Authorize

### Step 4: Create Tunnel
```powershell
# Create a tunnel named "mentorlink"
.\cloudflared.exe tunnel create mentorlink
```
This creates a tunnel and saves credentials.

### Step 5: Configure Tunnel

Create config file: `config.yml`
```yaml
tunnel: <YOUR-TUNNEL-ID>
credentials-file: C:\Users\Ahmad\.cloudflared\<TUNNEL-ID>.json

ingress:
  - hostname: mentorlink.yourdomain.com
    service: http://localhost:80
  - service: http_status:404
```

### Step 6: Route DNS
```powershell
.\cloudflared.exe tunnel route dns mentorlink mentorlink.yourdomain.com
```

### Step 7: Run Tunnel
```powershell
.\cloudflared.exe tunnel run mentorlink
```

Your app is now accessible at: **https://mentorlink.yourdomain.com**

---

## Quick Start (Without Custom Domain)

If you don't have a domain, use Quick Tunnel (temporary):

```powershell
cd C:\Users\Ahmad\Documents\GitHub\advisorlink-ai
.\cloudflared.exe tunnel --url http://localhost:80
```

You'll get a URL like: `https://random-name.trycloudflare.com`

**Note:** This URL changes each time you restart. For permanent URL, use custom domain.

---

## Running Tunnel as Background Service

### Option 1: PowerShell Background
```powershell
Start-Process -NoNewWindow -FilePath ".\cloudflared.exe" -ArgumentList "tunnel --url http://localhost:80"
```

### Option 2: Windows Service (Permanent)
```powershell
# Install as service
.\cloudflared.exe service install

# Start service
.\cloudflared.exe service start
```

---

## Troubleshooting

### "tunnel login failed"
- Make sure you have Cloudflare account
- Browser should open automatically
- If not, copy the URL from terminal

### "credentials-file not found"
- Check path: `C:\Users\Ahmad\.cloudflared\`
- Use correct tunnel ID in config.yml

### "service unreachable"
- Make sure Docker containers are running: `docker ps`
- Test local access: `curl http://localhost`

---

## Free Alternatives to Cloudflare

### ngrok (Free tier: 1 tunnel, changes URL)
```bash
# Download from: https://ngrok.com/download
ngrok http 80
```

### LocalTunnel (Free, open source)
```bash
npm install -g localtunnel
lt --port 80
```

### serveo (Free, SSH-based)
```bash
ssh -R 80:localhost:80 serveo.net
```

---

## Comparison: Router vs Cloudflare Tunnel

| Feature | Router Port Forwarding | Cloudflare Tunnel |
|---------|------------------------|-------------------|
| Cost | Free | Free |
| Setup Time | 5-10 min | 10-15 min |
| Router Access | Required | Not required |
| Works with CGNAT | No | Yes |
| SSL/HTTPS | Manual (Let's Encrypt) | Automatic |
| Custom Domain | Need DDNS | Included |
| Static IP Needed | Recommended | No |
| ISP Port Blocking | Problem | No problem |

**Recommendation:** Use Cloudflare Tunnel if router port forwarding doesn't work or if you want HTTPS.

