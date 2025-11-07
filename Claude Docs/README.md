# MentorLink - Claude Documentation

This folder contains comprehensive documentation for the MentorLink project.

## 📚 Documentation Files

### 🚀 Getting Started
- **[../QUICK_START.md](../QUICK_START.md)** - Fast 7-minute setup and testing guide
  - Automated setup with `setup-database.bat`
  - Test accounts and quick checklist
  - Common troubleshooting

### 🧪 Testing
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Comprehensive 15-step testing procedure
  - Detailed prerequisites setup
  - Complete testing checklist for all user types
  - API endpoint reference
  - Success criteria

- **[PHASE_7_STATUS.md](PHASE_7_STATUS.md)** - Current testing status
  - What's been completed (Phases 1-6)
  - Why testing is paused (MySQL not running)
  - Exact steps to resume testing
  - Troubleshooting guide

### 📊 Project Status
- **[../PROGRESS_REPORT.md](../PROGRESS_REPORT.md)** - Overall project progress (98% complete)
  - All phases documented
  - Database statistics
  - File structure
  - Quick commands

### ⚙️ Setup
- **[../SETUP_GUIDE.md](../SETUP_GUIDE.md)** - Detailed setup instructions
- **[../setup-database.bat](../setup-database.bat)** - Automated setup script

---

## 🎯 Current Status

**Phase 1-6:** ✅ **COMPLETE** (All development done)
**Phase 7:** ⏸️ **BLOCKED** (MySQL not running)

### What's Working:
- ✅ Complete Express + TypeScript backend (35+ API endpoints)
- ✅ MySQL database schema with 11 tables
- ✅ Mock data generator (331 users: 1 admin, 30 advisors, 300 students)
- ✅ React + TypeScript frontend with shadcn/ui
- ✅ JWT authentication system
- ✅ Google Gemini AI integration
- ✅ Student Dashboard (profile, GPA, courses, advisor, AI chat)
- ✅ Advisor Dashboard (assigned students, stats, chat with polling)
- ✅ Admin Panel (4 tabs: Dashboard, FAQs, Conversations, Users)
- ✅ Theme toggle (dark/light mode)
- ✅ Language toggle (English/Arabic with RTL)

### What's Blocking:
- ❌ MySQL service not running on port 3306
- ❌ Cannot test application without database

---

## 🚀 Quick Start (Resume Testing)

### Step 1: Start MySQL
**Windows Services:**
1. Press `Win + R` → type `services.msc` → Enter
2. Find "MySQL" or "MySQL80"
3. Right-click → Start

### Step 2: Run Setup Script
```bash
setup-database.bat
```

### Step 3: Start Servers
**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
npm run dev
```

### Step 4: Test Application
Navigate to: http://localhost:8080

**Test Accounts:**
- Admin: `admin@example.com / password123`
- Advisor: `advisor1@example.com / password123`
- Student: `student1@example.com / password123`

---

## 📖 Recommended Reading Order

1. **First Time Setup:**
   - Start with `../QUICK_START.md`
   - Run `setup-database.bat`
   - Follow quick test checklist

2. **Detailed Testing:**
   - Read `TESTING_GUIDE.md`
   - Follow 15-step testing procedure
   - Verify all API endpoints

3. **Troubleshooting:**
   - Check `PHASE_7_STATUS.md`
   - Review troubleshooting sections
   - Verify configuration files

4. **Project Overview:**
   - Read `../PROGRESS_REPORT.md`
   - See what's been completed
   - Understand project structure

---

## 🔍 Finding Information

### How do I...?
- **Start the app?** → `../QUICK_START.md`
- **Fix database errors?** → `PHASE_7_STATUS.md` (Troubleshooting section)
- **Test all features?** → `TESTING_GUIDE.md`
- **See what's done?** → `../PROGRESS_REPORT.md`
- **Get login credentials?** → All docs have them, or see below

### Test Accounts
All accounts use password: `password123`

| Type | Email Format | Count |
|------|--------------|-------|
| Admin | admin@example.com | 1 |
| Advisors | advisor1@example.com to advisor30@example.com | 30 |
| Students | student1@example.com to student300@example.com | 300 |

---

## 📁 File Locations

### Configuration
- Backend: `backend/.env`
- Frontend: `.env`

### Database
- Schema: `database/schema.sql`
- Seed Script: `backend/scripts/seed-data.ts`

### API Layer
- All API modules: `src/api/`
- Auth Context: `src/context/AuthContext.tsx`

### Pages
- Login: `src/pages/Auth.tsx`
- Student: `src/components/dashboard/StudentDashboard.tsx`
- Advisor: `src/components/dashboard/AdvisorDashboard.tsx`
- Admin: `src/pages/AdminPanel.tsx`

### Admin Components
- Dashboard: `src/components/dashboard/AdminDashboard.tsx`
- FAQ Manager: `src/components/admin/FAQManager.tsx`
- Conversations: `src/components/admin/ConversationViewer.tsx`
- Users: `src/components/admin/UserTable.tsx`

---

## ⚡ Quick Commands

```bash
# Start MySQL (Windows Services required)
# See QUICK_START.md for instructions

# Setup everything (run once)
setup-database.bat

# Start backend
cd backend && npm run dev

# Start frontend (in separate terminal)
npm run dev

# Re-seed database if needed
cd backend && npm run seed

# Verify backend setup
cd backend && npm run verify
```

---

## 🆘 Need Help?

1. **MySQL won't start:**
   - See `PHASE_7_STATUS.md` → "Troubleshooting Guide" → "If MySQL won't start"

2. **Backend won't connect:**
   - See `PHASE_7_STATUS.md` → "Troubleshooting Guide" → "If backend still won't connect"

3. **Empty dashboards:**
   - Run: `cd backend && npm run seed`

4. **API errors:**
   - Check `backend/.env` configuration
   - Verify both servers are running
   - Check browser console and network tab

---

## ✨ What Makes This Special

- **No Supabase:** Pure MySQL + Express backend
- **MVP Focus:** Simple, functional, proof of concept
- **AI-Powered:** Gemini 2.0 with personalized context
- **Load-Balanced:** Auto-assignment distributes students evenly
- **Real Mock Data:** 331 users with realistic relationships
- **Bilingual:** English/Arabic with RTL support
- **Polling:** Simple 3-second intervals (no WebSockets)
- **Complete Admin:** Full CRUD for FAQs, view all conversations/users

---

**Project Status:** 98% Complete - All Code Done, Ready for Testing

**Next Step:** Start MySQL → Run `setup-database.bat` → Test!

**Last Updated:** Phase 6 Complete, Phase 7 Ready
