# 🚀 MentorLink Quick Start Guide

## ⚡ Automated Setup (Recommended)

**Just run this one command:**
```bash
setup-database.bat
```
This will automatically:
1. Create the database schema
2. Install backend dependencies
3. Generate 331 users (1 admin, 30 advisors, 300 students)
4. Create sample conversations

**Prerequisites:** MySQL must be running!

---

## 🔧 Manual Setup (Alternative)

### Step 1: Start MySQL

**Windows Services:**
1. Press `Win + R`, type `services.msc`, press Enter
2. Find "MySQL" or "MySQL80" service
3. Right-click → Start

**MySQL Workbench:**
- Open MySQL Workbench → Start local server instance

---

### Step 2: Create Database

**Option A: Command Line**
```bash
mysql -u root -p < database/schema.sql
```

**Option B: MySQL Workbench**
1. Open MySQL Workbench
2. Connect to local server
3. File → Open SQL Script → Select `database/schema.sql`
4. Execute (⚡ button)

---

### Step 3: Install & Seed Data

```bash
cd backend
npm install
npm run seed
```

**Expected Output:**
```
✅ Database connection successful
✓ Admin created: admin@example.com
✓ 30 advisors created (6 per level)
✓ 300 students created (60 per level, 20 per section)
✓ Students assigned to advisors
✓ 50+ sample conversations created
📊 Database Statistics:
   Total Users: 331
   Total Conversations: 50+
   Total Messages: 150+
```

---

## 🚀 Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Database connection successful
🚀 Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Expected Output:**
```
➜  Local:   http://localhost:8080/
```

---

## 🧪 Test the Application

Navigate to: **http://localhost:8080**

### Test Accounts

| User Type | Email | Password |
|-----------|-------|----------|
| **Admin** | admin@example.com | password123 |
| **Advisor** | advisor1@example.com | password123 |
| **Student** | student1@example.com | password123 |

*All 331 accounts use `password123` as password*

### Quick Test Checklist

#### 1. Student Login (2 min)
- [ ] Login as `student1@example.com`
- [ ] Dashboard shows: Profile, GPA, Courses, Advisor
- [ ] Click "AI Chat" → Ask "What is my GPA?"
- [ ] AI responds with personalized data

#### 2. Advisor Login (2 min)
- [ ] Login as `advisor1@example.com`
- [ ] Dashboard shows assigned students
- [ ] Navigate to Messages/Chat
- [ ] Send a test message

#### 3. Admin Login (3 min)
- [ ] Login as `admin@example.com`
- [ ] Dashboard shows 300 students, 30 advisors
- [ ] FAQs tab: Add/Edit/Delete FAQ
- [ ] Users tab: View all 331 users
- [ ] Conversations tab: View all chats

---

## 🔍 Troubleshooting

### Backend won't start
**Error:** `ECONNREFUSED ::1:3306`
**Fix:** MySQL is not running → Start MySQL service

**Error:** `ER_BAD_DB_ERROR: Unknown database 'mentorlink'`
**Fix:** Run `mysql -u root -p < database/schema.sql`

### Empty dashboards
**Error:** No students/advisors showing
**Fix:** Run `cd backend && npm run seed`

### AI Chat not working
**Error:** Gemini API errors
**Fix:** Check `GEMINI_API_KEY` in `backend/.env`

---

## 📁 Configuration Files

**Backend** (`backend/.env`):
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mentorlink
JWT_SECRET=mentorlink_dev_secret_key_2024
GEMINI_API_KEY=AIzaSyCucNtY7tHAND34lO0IUWiTyjxms8h36H4
FRONTEND_URL=http://localhost:8080
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📚 Additional Documentation

- **Detailed Testing:** `Claude Docs/TESTING_GUIDE.md`
- **Project Status:** `PROGRESS_REPORT.md`
- **Setup Instructions:** `SETUP_GUIDE.md`

---

## ✅ Success Criteria

After testing, you should have:
- ✅ All 3 user types can login
- ✅ Student dashboard displays personalized data
- ✅ AI chat provides relevant responses
- ✅ Advisor chat works with polling
- ✅ Admin panel shows accurate stats
- ✅ No console errors

**Need help?** See `Claude Docs/TESTING_GUIDE.md` for comprehensive testing procedures.
