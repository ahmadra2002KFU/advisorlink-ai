# Router Port Forwarding - Step by Step Guide

## ✅ Current Status
- Local network: **WORKING** ✓
- Windows Firewall: **CONFIGURED** ✓
- Docker containers: **RUNNING** ✓
- External access: **NEEDS ROUTER CONFIG** ⏳

## 🎯 Goal
Make your server accessible from the internet at: **http://51.36.170.55**

---

## 📋 Router Configuration Steps

### Step 1: Access Your Router

1. Open a web browser
2. Go to: **http://192.168.8.1**
3. Enter router login credentials
   - Check the sticker on your router
   - Common defaults: admin/admin, admin/password

### Step 2: Find Port Forwarding Settings

Look for one of these menu items (varies by router brand):
- **Port Forwarding**
- **Virtual Server**
- **NAT Forwarding**
- **Gaming** or **Applications**
- **Advanced Settings** → **Port Forwarding**

### Step 3: Add Port Forwarding Rules

⚠️ **IMPORTANT**: Use **192.168.8.182** (your Wi-Fi IP), NOT 172.19.128.1 (WSL IP)

Add these **3 rules**:

#### Rule 1: HTTP (Web Traffic)
```
Service Name:    MentorLink-HTTP
External Port:   80
Internal IP:     192.168.8.182
Internal Port:   80
Protocol:        TCP (or TCP/UDP)
Enable:          ✓ Yes
```

#### Rule 2: HTTPS (Secure Web Traffic)
```
Service Name:    MentorLink-HTTPS
External Port:   443
Internal IP:     192.168.8.182
Internal Port:   443
Protocol:        TCP (or TCP/UDP)
Enable:          ✓ Yes
```

#### Rule 3: Backend API
```
Service Name:    MentorLink-API
External Port:   5000
Internal IP:     192.168.8.182
Internal Port:   5000
Protocol:        TCP (or TCP/UDP)
Enable:          ✓ Yes
```

### Step 4: Save and Apply

1. Click **Save** or **Apply**
2. Router may restart (wait 1-2 minutes)
3. Your rules should now be active

---

## 🧪 Testing Port Forwarding

### Test 1: Online Port Checker
1. Go to: https://www.yougetsignal.com/tools/open-ports/
2. Enter Remote Address: **51.36.170.55**
3. Enter Port Number: **80**
4. Click **Check**
5. Should say: "**Port 80 is open**"
6. Repeat for port **5000**

### Test 2: Browser Test (Mobile Data)
1. On your phone, **disable Wi-Fi** (use mobile data)
2. Open browser
3. Go to: **http://51.36.170.55**
4. You should see MentorLink login page

### Test 3: Ask a Friend
Send this link to someone on a different network:
- **http://51.36.170.55**

---

## 🔍 Common Router Brands & Settings Location

### TP-Link
- **Advanced** → **NAT Forwarding** → **Virtual Servers**

### D-Link
- **Advanced** → **Port Forwarding**

### Netgear
- **Advanced** → **Advanced Setup** → **Port Forwarding/Port Triggering**

### Linksys
- **Security** → **Apps and Gaming** → **Single Port Forwarding**

### ASUS
- **WAN** → **Virtual Server / Port Forwarding**

### Huawei
- **Security** → **NAT** → **Port Mapping**

---

## ❌ Troubleshooting

### "Port is closed" after configuration
**Possible causes:**
1. **Rules not saved properly** → Re-enter and save again
2. **Router didn't apply changes** → Restart router manually
3. **ISP blocking** → Some ISPs block port 80, try port 8080 instead
4. **Wrong internal IP** → Make sure you used **192.168.8.182**

### "Can't login to router"
1. Check router label for default credentials
2. Try these common logins:
   - admin / admin
   - admin / password
   - admin / (blank)
3. If password was changed and forgotten, factory reset router (last resort)

### "ISP uses CGNAT" (Carrier-Grade NAT)
Some mobile ISPs or fiber providers use CGNAT, which prevents port forwarding.

**Check if you have CGNAT:**
- Your public IP starts with: 10.x.x.x, 172.16-31.x.x, or 100.64.x.x
- You're behind multiple layers of NAT

**Solutions:**
- Request public IP from ISP (may cost extra)
- Use Cloudflare Tunnel (free, no port forwarding needed)
- Use ngrok or similar tunneling service

### IP Address Changes
Your public IP (51.36.170.55) may change if:
- Router restarts
- ISP assigns new IP periodically

**Solutions:**
- **Free DDNS**: Use DuckDNS, No-IP, or Dynu
- **Static IP**: Pay ISP for static IP address

---

## 🔐 Security Recommendations

After port forwarding is working:

1. **Change default router password** (if you haven't)
2. **Monitor access logs**: `docker logs mentorlink-backend`
3. **Set up SSL/HTTPS** (Let's Encrypt) for production use
4. **Keep containers updated**: `docker-compose pull && docker-compose up -d`
5. **Backup database regularly**: Located at `/app/data/mentorlink.db` in backend container

---

## 🆘 Still Need Help?

If you're stuck:
1. Take screenshot of router's port forwarding page
2. Note your router brand/model
3. Check router manual or manufacturer's support site
4. Search: "[Your Router Model] port forwarding guide"

---

## ✅ Success Checklist

- [ ] Accessed router admin panel (192.168.8.1)
- [ ] Found port forwarding settings
- [ ] Added all 3 rules (80, 443, 5000)
- [ ] Saved and applied settings
- [ ] Tested with online port checker (ports show as open)
- [ ] Tested with browser on mobile data
- [ ] Application loads from http://51.36.170.55

Once all checked, you're live! 🎉
