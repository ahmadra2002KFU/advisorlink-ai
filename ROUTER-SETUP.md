# MentorLink - Router Port Forwarding Setup Guide

## Quick Reference
- **Your Local IP**: `192.168.8.182`
- **Your Router IP**: `192.168.8.1`
- **Your Public IP**: `51.36.170.55`

## Step 1: Run Firewall Setup (Administrator Required)

1. Right-click on `setup-firewall.bat` in this folder
2. Select **"Run as administrator"**
3. Click **Yes** when Windows asks for permission
4. You should see success messages for ports 80, 443, and 5000

## Step 2: Configure Router Port Forwarding

### Access Your Router
1. Open browser and go to: http://192.168.8.1
2. Login with router credentials (usually on router sticker or manual)

### Add Port Forwarding Rules

Navigate to Port Forwarding section (may be called "Virtual Server", "NAT", or "Applications")

**Add these 3 rules:**

#### Rule 1: HTTP Traffic
- **Service Name**: MentorLink-HTTP
- **External Port**: 80
- **Internal IP**: 192.168.8.182
- **Internal Port**: 80
- **Protocol**: TCP
- **Status**: Enabled

#### Rule 2: HTTPS Traffic
- **Service Name**: MentorLink-HTTPS
- **External Port**: 443
- **Internal IP**: 192.168.8.182
- **Internal Port**: 443
- **Protocol**: TCP
- **Status**: Enabled

#### Rule 3: Backend API (Optional - for direct API access)
- **Service Name**: MentorLink-API
- **External Port**: 5000
- **Internal IP**: 192.168.8.182
- **Internal Port**: 5000
- **Protocol**: TCP
- **Status**: Enabled

### Save and Apply Changes
- Click **Save** or **Apply**
- Router may restart (wait 1-2 minutes)

## Step 3: Test Access

### Local Testing (Already Working ✓)
From your machine:
- Frontend: http://localhost
- Backend: http://localhost:5000/health

### Network Testing
From another device on your network (phone, another computer):
- Frontend: http://192.168.8.182
- Backend: http://192.168.8.182:5000/health

### Internet Testing
From outside your network (mobile data, friend's network):
- Frontend: **http://51.36.170.55**
- Backend: **http://51.36.170.55:5000/health**

## Troubleshooting

### Can't access from internet?
1. Verify port forwarding rules are saved and active
2. Check your public IP hasn't changed: https://www.whatismyip.com
3. Make sure Windows Firewall rules were added (run setup-firewall.bat)
4. Test if port is open: https://www.yougetsignal.com/tools/open-ports/
   - Enter IP: 51.36.170.55
   - Enter Port: 80 or 5000

### Router Admin Password Unknown?
- Check router label/sticker
- Common defaults:
  - admin/admin
  - admin/password
  - admin/1234
- Search online: "[Your Router Brand/Model] default password"

### Dynamic IP Issues
Your public IP (51.36.170.55) may change when router restarts. Solutions:
1. **Free DDNS**: Use No-IP, DuckDNS, or Dynu
2. **Static IP**: Contact ISP for static IP (usually costs extra)

### Port Already in Use
If port 80 is used by another service:
- Check: `netstat -ano | findstr :80`
- Stop conflicting service or use different port

## Security Warnings

⚠️ **Important Security Notes:**
- Your application is exposed to the internet
- No HTTPS/SSL encryption (traffic not secure)
- Keep Docker containers updated
- Monitor logs regularly
- Consider setting up SSL certificate (Let's Encrypt)
- Don't expose port 5000 in production (API should be behind frontend proxy)

## Next Steps for Production

1. **Get Domain Name**: Register domain (Namecheap, Google Domains)
2. **Setup DDNS**: Point domain to your dynamic IP
3. **Add SSL Certificate**: Use Certbot for Let's Encrypt
4. **Setup Monitoring**: Track uptime and errors
5. **Regular Backups**: Backup SQLite database regularly

---

**Need Help?**
- Check if containers are running: `docker ps`
- View logs: `docker logs mentorlink-frontend` or `docker logs mentorlink-backend`
- Restart containers: `docker-compose restart`
