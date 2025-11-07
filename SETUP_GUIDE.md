# MentorLink Setup Guide - MySQL + Express Backend

Complete step-by-step guide to set up and run MentorLink with the new MySQL backend.

---

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL** (v8.0 or higher)
3. **npm** or **yarn**

---

## Step 1: Install MySQL

### Windows:
1. Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
2. Run the installer and choose "Developer Default"
3. Set root password (or leave empty for development)
4. Complete the installation

### macOS:
```bash
brew install mysql
brew services start mysql
```

### Linux:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

---

## Step 2: Create Database and Populate Data

### Option A: Using MySQL Command Line

1. **Open MySQL command line:**
```bash
mysql -u root -p
# (Press Enter if no password, or enter your password)
```

2. **Run the schema file:**
```sql
source C:/00-Code/MentorLink2/advisorlink-ai/database/schema.sql
```
or
```bash
mysql -u root -p < database/schema.sql
```

3. **Verify database created:**
```sql
USE mentorlink;
SHOW TABLES;
SELECT COUNT(*) FROM levels;
SELECT COUNT(*) FROM sections;
SELECT COUNT(*) FROM faqs;
```

### Option B: Using MySQL Workbench (GUI)

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. File → Open SQL Script → Select `database/schema.sql`
4. Click Execute (lightning bolt icon)
5. Verify tables were created

---

## Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Step 4: Configure Environment Variables

The `.env` file is already created. If you need to modify it:

```bash
# backend/.env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=              # Your MySQL password (leave empty if none)
DB_NAME=mentorlink
JWT_SECRET=mentorlink_dev_secret_key_2024
GEMINI_API_KEY=AIzaSyCucNtY7tHAND34lO0IUWiTyjxms8h36H4
FRONTEND_URL=http://localhost:8080
```

---

## Step 5: Seed Mock Data (30 Advisors + 300 Students)

```bash
cd backend
npm run seed
```

**Expected Output:**
```
✓ Admin created: admin@mentorlink.com / password123
✓ Total advisors created: 30
✓ Total students created: 300
✓ Created 50 sample conversations
✓ Created AI chat history entries

Database Statistics:
Total Users:        331
  - Advisors:       30
  - Students:       300
  - Admins:         1
Conversations:      50
Messages:           ~200
AI Chat History:    ~100
FAQs:               25
```

---

## Step 6: Start Backend Server

```bash
cd backend
npm run dev
```

**You should see:**
```
========================================
   MentorLink Backend Server Started
========================================
🚀 Server running on port 5000
📡 Frontend URL: http://localhost:8080
🗄️  Database: mentorlink
🤖 Gemini API: Configured
```

---

## Step 7: Install Frontend Dependencies

```bash
# In the root directory
npm install
```

---

## Step 8: Start Frontend Development Server

```bash
npm run dev
```

The app will open at: **http://localhost:8080**

---

## 📧 Test Login Credentials

After seeding, you can log in with these accounts:

### Admin Account:
- **Email:** admin@mentorlink.com
- **Password:** password123

### Advisor Account (Example):
- **Email:** advisor.l1.1@mentorlink.com
- **Password:** password123
- *(There are 30 advisors total: advisor.l1.1 through advisor.l5.6)*

### Student Account (Example):
- **Email:** s1a001@student.mentorlink.com
- **Password:** password123
- *(There are 300 students total: s1a001 through s5c020)*

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students/profile` - Get student profile
- `GET /api/students/courses` - Get enrolled courses
- `GET /api/students/advisor` - Get assigned advisor

### Advisors
- `GET /api/advisors/profile` - Get advisor profile
- `GET /api/advisors/students` - Get assigned students
- `GET /api/advisors/stats` - Get advisor stats
- `PUT /api/advisors/availability` - Update availability

### Chat
- `GET /api/chat/conversations` - List conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message
- `PUT /api/chat/messages/:id/read` - Mark as read

### AI Assistant
- `POST /api/ai/chat` - Chat with AI
- `GET /api/ai/history` - Get AI chat history

### Admin
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/conversations` - All conversations
- `GET /api/admin/faqs` - List FAQs
- `POST /api/admin/faqs` - Create FAQ
- `PUT /api/admin/faqs/:id` - Update FAQ
- `DELETE /api/admin/faqs/:id` - Delete FAQ

---

## Troubleshooting

### Database Connection Error
```
Error: Access denied for user 'root'@'localhost'
```
**Fix:** Update `DB_PASSWORD` in `backend/.env`

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Fix:** Either:
1. Kill the process using port 5000, or
2. Change `PORT` in `backend/.env`

### Gemini API Error
```
Failed to get AI response
```
**Fix:** Verify `GEMINI_API_KEY` is set correctly in `backend/.env`

### MySQL Not Running
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Fix:**
- Windows: Start MySQL from Services
- macOS: `brew services start mysql`
- Linux: `sudo systemctl start mysql`

---

## Database Management

### View Data in MySQL Workbench:
1. Open MySQL Workbench
2. Connect to local instance
3. Navigate to `mentorlink` schema
4. Browse tables

### Reset Database:
```bash
mysql -u root -p < database/schema.sql
cd backend && npm run seed
```

### Backup Database:
```bash
mysqldump -u root -p mentorlink > mentorlink_backup.sql
```

---

## Development Workflow

1. **Backend changes:**
   - Modify files in `backend/src/`
   - Server auto-restarts (nodemon)

2. **Database schema changes:**
   - Update `database/schema.sql`
   - Recreate database: `mysql -u root -p < database/schema.sql`
   - Re-seed: `npm run seed`

3. **Frontend changes:**
   - Modify files in `src/`
   - Hot reload enabled

---

## Next Steps

1. ✅ Backend is running
2. ✅ Database is populated
3. ⏳ Frontend needs to be updated to use new API
4. ⏳ Remove Supabase dependencies
5. ⏳ Create API client layer
6. ⏳ Update all React components

---

## Architecture Overview

```
Frontend (React)          Backend (Express)        Database (MySQL)
    |                           |                         |
    |-- API Client ------------>|                         |
    |   (fetch/axios)           |                         |
    |                           |-- Controllers --------->|
    |                           |-- Routes                |
    |                           |-- Middleware (JWT)      |
    |                           |-- Gemini API            |
    |                           |                         |
    |<-- JSON Response ---------|<-- SQL Queries ---------|
```

---

##  Project Structure

```
mentorlink/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   ├── utils/          # JWT, Gemini API
│   │   └── server.ts       # Express app
│   ├── scripts/
│   │   └── seed-data.ts    # Mock data generator
│   └── package.json
├── database/
│   └── schema.sql          # MySQL schema
├── src/                    # React frontend
├── Claude Docs/            # Documentation
└── SETUP_GUIDE.md          # This file
```

---

You're all set! 🚀

For questions or issues, check the troubleshooting section above.
