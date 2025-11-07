# MySQL Installation Guide for MentorLink

## 🚨 Problem
MySQL is not installed on your system. The backend requires MySQL to store and manage data.

---

## ✅ Solution: Install MySQL

### Option 1: MySQL Installer (Recommended)

**Best for:** Proper long-term setup with GUI tools

**Steps:**

1. **Download MySQL Installer**
   - Go to: https://dev.mysql.com/downloads/installer/
   - Download: `mysql-installer-community-8.0.x.x.msi` (Windows)
   - Click: "No thanks, just start my download"

2. **Run Installer**
   - Double-click the downloaded `.msi` file
   - Choose: **"Developer Default"**
   - This includes:
     - MySQL Server 8.0
     - MySQL Workbench (GUI)
     - MySQL Shell
     - Connectors

3. **Installation Configuration**
   - Click "Next" until you reach "Accounts and Roles"
   - **Root Password:** Leave empty OR set to `password123`
   - **Important:** Remember your choice for `backend/.env` configuration

4. **Windows Service Configuration**
   - Service Name: Keep default **"MySQL80"**
   - Start at System Startup: ✅ **Check this**
   - Click "Execute"

5. **Complete Installation**
   - Wait for installation to complete (~5 minutes)
   - Click "Finish"

6. **Verify Installation**
   ```bash
   # Open Command Prompt
   mysql --version
   ```
   Should show: `mysql  Ver 8.0.x for Win64`

   ```bash
   # Test connection
   mysql -u root -p
   # Press Enter if no password, or type your password
   ```
   Should see: `mysql>` prompt

**Installation Time:** 5-10 minutes

---

### Option 2: XAMPP (Fastest)

**Best for:** Quick testing, all-in-one solution

**Steps:**

1. **Download XAMPP**
   - Go to: https://www.apachefriends.org/download.html
   - Download latest version for Windows
   - File size: ~150MB

2. **Install XAMPP**
   - Run installer
   - Select components: Check **MySQL** (Apache optional)
   - Install to default location: `C:\xampp`
   - Complete installation

3. **Start MySQL**
   - Open "XAMPP Control Panel" from Start Menu
   - Click **"Start"** button next to MySQL
   - Status should turn green
   - MySQL is now running on port 3306

4. **Verify Connection**
   ```bash
   # XAMPP MySQL is at: C:\xampp\mysql\bin\mysql.exe
   C:\xampp\mysql\bin\mysql -u root
   ```
   Should see: `mysql>` prompt

5. **Add to PATH (Optional but Recommended)**
   - Right-click "This PC" → Properties → Advanced → Environment Variables
   - Edit "Path" → Add: `C:\xampp\mysql\bin`
   - Now you can use `mysql` command from anywhere

**Installation Time:** 3-5 minutes

**Note:** XAMPP MySQL has no root password by default.

---

### Option 3: Portable MySQL (No Installation)

**Best for:** Can't install software, need portable solution

**Steps:**

1. **Download MySQL ZIP**
   - Go to: https://dev.mysql.com/downloads/mysql/
   - Select: "Windows (x86, 64-bit), ZIP Archive"
   - Download the ZIP file

2. **Extract**
   - Extract to: `C:\mysql` (or any folder)
   - You'll have: `C:\mysql\bin\`, `C:\mysql\data\`, etc.

3. **Initialize Database**
   ```bash
   cd C:\mysql\bin
   mysqld --initialize-insecure --console
   ```
   This creates the data directory with no root password

4. **Start MySQL Server**
   ```bash
   mysqld --console
   ```
   Keep this window open (MySQL is running)

5. **Connect (in new terminal)**
   ```bash
   C:\mysql\bin\mysql -u root
   ```

**Installation Time:** Varies (manual setup required)

---

## 🎯 After Installation: Update Backend Configuration

Once MySQL is installed, verify the configuration:

**File:** `backend/.env`

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=           # Leave empty if you set no password
DB_NAME=mentorlink
JWT_SECRET=mentorlink_dev_secret_key_2024
GEMINI_API_KEY=AIzaSyCucNtY7tHAND34lO0IUWiTyjxms8h36H4
FRONTEND_URL=http://localhost:8080
```

**If you set a password during installation:**
```env
DB_PASSWORD=password123    # Or whatever you set
```

---

## ✅ Verify MySQL is Running

### Method 1: Windows Services
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "MySQL80" (or "MySQL" for XAMPP)
4. Status should be **"Running"**

### Method 2: Command Line
```bash
# Test connection
mysql -u root -p
# Press Enter if no password
```

Should see:
```
Welcome to the MySQL monitor.
mysql>
```

### Method 3: Check Port
```bash
netstat -ano | findstr :3306
```

Should show:
```
TCP    0.0.0.0:3306    0.0.0.0:0    LISTENING    <PID>
```

---

## 🚀 Continue Setup

Once MySQL is running:

1. **Run setup script:**
   ```bash
   cd C:\00-Code\MentorLink2\advisorlink-ai
   setup-database.bat
   ```

2. **Expected output:**
   ```
   ✓ Database schema created successfully
   ✓ Dependencies installed
   ✓ Seed completed successfully
   ```

3. **Start servers:**
   ```bash
   # Terminal 1
   cd backend
   npm run dev

   # Terminal 2
   npm run dev
   ```

4. **Test application:**
   - Navigate to: http://localhost:8080
   - Login with: `admin@example.com / password123`

---

## 🔍 Troubleshooting

### Error: "Port 3306 is already in use"
Another service is using port 3306.

**Solution:**
```bash
# Find what's using the port
netstat -ano | findstr :3306

# Kill the process (replace <PID> with actual number)
taskkill /F /PID <PID>

# Then start MySQL again
```

---

### Error: "Access denied for user 'root'@'localhost'"
Wrong password or user doesn't exist.

**Solution:**
- If using XAMPP: No password needed, remove password from `backend/.env`
- If using MySQL Installer: Use the password you set during installation
- Reset password if forgotten (see MySQL docs)

---

### MySQL won't start
Service fails to start.

**Common causes:**
1. Port 3306 is taken (see above)
2. Data directory is corrupted
3. Configuration file has errors

**Quick fix (nuclear option):**
1. Uninstall MySQL completely
2. Delete data directory
3. Reinstall using Option 2 (XAMPP) - it's simpler

---

## 📋 Summary: Which Option?

| Your Situation | Recommended Option | Why |
|----------------|-------------------|-----|
| Need it for development long-term | MySQL Installer | Professional setup, includes GUI tools |
| Just testing MentorLink quickly | XAMPP | Fastest setup, easy start/stop |
| Can't install software (work PC) | Portable | No admin rights needed |
| Already have WAMP/MAMP/etc | Use existing | Already have MySQL |

---

## 🎓 MySQL Basics (For Reference)

After installation, useful commands:

```bash
# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use mentorlink database
USE mentorlink;

# Show tables
SHOW TABLES;

# Count users
SELECT COUNT(*) FROM users;

# Exit MySQL
exit;
```

---

## ✅ Verification Checklist

Before continuing with MentorLink setup:

- [ ] MySQL installed (via Installer, XAMPP, or Portable)
- [ ] MySQL service is running (check Windows Services)
- [ ] Can connect: `mysql -u root -p` works
- [ ] Port 3306 is listening: `netstat -ano | findstr :3306`
- [ ] `backend/.env` has correct password (empty or your password)

Once all checked, run: `setup-database.bat`

---

## 📞 Need More Help?

- **MySQL Official Docs:** https://dev.mysql.com/doc/
- **XAMPP Docs:** https://www.apachefriends.org/faq_windows.html
- **Common MySQL Errors:** https://dev.mysql.com/doc/mysql-errors/8.0/en/

---

**Next:** After MySQL is running, see `QUICK_START.md` to continue with MentorLink setup.
