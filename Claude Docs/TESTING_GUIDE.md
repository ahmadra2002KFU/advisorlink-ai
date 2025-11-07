# MentorLink Testing Guide

## Prerequisites Setup

### 1. Start MySQL Database

**Option A: Using Windows Services**
1. Open Windows Services (Press `Win + R`, type `services.msc`, press Enter)
2. Find "MySQL" or "MySQL80" in the list
3. Right-click and select "Start"
4. Verify status shows "Running"

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench
2. Start the MySQL Server instance
3. Verify connection is active

**Option C: Using Command Line (as Administrator)**
```bash
net start MySQL
# or
net start MySQL80
```

### 2. Create and Populate Database

Once MySQL is running, execute these commands:

```bash
# Navigate to project root
cd C:\00-Code\MentorLink2\advisorlink-ai

# Create the database schema
mysql -u root -p < database/schema.sql

# Install backend dependencies (if not done)
cd backend
npm install

# Run the seed script to generate 30 advisors + 300 students
npm run seed
```

**Expected Output from Seed Script:**
- ✅ Database connection successful
- ✅ 30 advisors created (6 per level)
- ✅ 300 students created (60 per level)
- ✅ Students auto-assigned to advisors
- ✅ 50+ sample conversations created
- ✅ Sample messages generated

### 3. Verify Environment Files

**Backend .env** (`backend/.env`):
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

**Frontend .env** (`.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Testing Procedure

### Phase 1: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Expected output:
```
[nodemon] starting `ts-node src/server.ts`
✅ Database connection successful
🚀 Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
```

### Phase 2: Test Student Flow

1. **Login as Student**
   - Navigate to: http://localhost:8080
   - Email: `student1@example.com`
   - Password: `password123`
   - Click "Sign In"

2. **Verify Student Dashboard** (src/components/dashboard/StudentDashboard.tsx:1)
   - ✅ Student ID displays correctly
   - ✅ Level and Section shown
   - ✅ GPA and Attendance percentage visible
   - ✅ Courses list populated
   - ✅ Assigned advisor information displayed
   - ✅ No console errors

3. **Test AI Chat** (src/pages/Chat.tsx:1)
   - Click "AI Chat" button
   - Type: "What is my GPA?"
   - ✅ AI responds with personalized data
   - Type: "How can I improve my attendance?"
   - ✅ AI provides relevant advice
   - ✅ Chat history persists during session
   - ✅ Check network tab for API call to `/api/ai/chat`

### Phase 3: Test Advisor Flow

1. **Logout and Login as Advisor**
   - Logout from student account
   - Email: `advisor1@example.com`
   - Password: `password123`

2. **Verify Advisor Dashboard** (src/components/dashboard/AdvisorDashboard.tsx:1)
   - ✅ Advisor profile displays
   - ✅ Specialization and office hours shown
   - ✅ Assigned students list populated
   - ✅ Statistics cards show correct numbers
   - ✅ Availability toggle works

3. **Test Advisor Chat** (src/pages/AdvisorChat.tsx:1)
   - Click "Messages" or navigate to `/advisor-chat`
   - ✅ Conversations list loads
   - Click on a student conversation
   - ✅ Message history displays
   - Type a message and send
   - ✅ Message appears in chat
   - ✅ Open browser DevTools > Network tab
   - ✅ Verify polling: requests to `/api/chat/messages/{id}` every 3 seconds
   - ✅ Verify no console errors

### Phase 4: Test Admin Flow

1. **Logout and Login as Admin**
   - Logout from advisor account
   - Email: `admin@example.com`
   - Password: `password123`

2. **Admin Dashboard Tab** (src/components/dashboard/AdminDashboard.tsx:1)
   - ✅ Total Students: 300
   - ✅ Total Advisors: 30
   - ✅ Total Conversations: 50+
   - ✅ Total Messages: 150+
   - ✅ AI Chat Sessions: Shows count
   - ✅ No loading errors

3. **FAQs Tab** (src/components/admin/FAQManager.tsx:1)
   - ✅ 25 FAQs displayed by category
   - Click "Add FAQ"
   - Fill in: Question, Answer, Category
   - ✅ FAQ created successfully
   - Click "Edit" on any FAQ
   - Modify and save
   - ✅ FAQ updated successfully
   - Click "Delete" on the test FAQ
   - ✅ FAQ deleted successfully
   - Test search functionality
   - ✅ Search filters FAQs correctly
   - Test category filter dropdown
   - ✅ Filter works correctly

4. **Conversations Tab** (src/components/admin/ConversationViewer.tsx:1)
   - ✅ All conversations displayed
   - ✅ Stats cards show correct counts (Total, Active, Resolved)
   - Use search bar to find student name
   - ✅ Search works correctly
   - Use status filter dropdown
   - ✅ Filter by status works
   - ✅ Timestamps formatted correctly
   - ✅ Student and advisor names displayed

5. **Users Tab** (src/components/admin/UserTable.tsx:1)
   - ✅ Table shows all 331 users (1 admin + 30 advisors + 300 students)
   - ✅ Stats cards show: 300 students, 30 advisors, 1 admin
   - Use search bar to find user by name
   - ✅ Search works correctly
   - Use type filter dropdown
   - ✅ Filter by user type works
   - ✅ User badges color-coded correctly
   - ✅ Table is sortable

---

## Test Accounts

### Admin
- Email: `admin@example.com`
- Password: `password123`

### Advisors (30 total)
- Email: `advisor1@example.com` through `advisor30@example.com`
- Password: `password123`

### Students (300 total)
- Email: `student1@example.com` through `student300@example.com`
- Password: `password123`

---

## Common Issues & Troubleshooting

### Backend won't start
**Error:** `ECONNREFUSED ::1:3306`
**Solution:** MySQL is not running. Start MySQL service first.

**Error:** `ER_BAD_DB_ERROR: Unknown database 'mentorlink'`
**Solution:** Run `mysql -u root -p < database/schema.sql` to create the database.

**Error:** `ER_NO_SUCH_TABLE`
**Solution:** Database tables not created. Re-run schema.sql.

### Frontend won't connect
**Error:** Network errors in console
**Solution:** Verify backend is running on port 5000 and `.env` has correct `VITE_API_URL`.

### Empty data in dashboards
**Error:** No students/advisors/conversations showing
**Solution:** Run `npm run seed` in backend directory to generate mock data.

### AI Chat not working
**Error:** Gemini API errors
**Solution:** Verify `GEMINI_API_KEY` in `backend/.env` is correct and valid.

---

## API Endpoints to Verify

### Auth
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Register (disabled for students/advisors)
- GET `/api/auth/me` - Get current user

### Student
- GET `/api/students/profile` - Get student profile
- GET `/api/students/courses` - Get enrolled courses
- GET `/api/students/advisor` - Get assigned advisor

### Advisor
- GET `/api/advisors/profile` - Get advisor profile
- GET `/api/advisors/students` - Get assigned students
- GET `/api/advisors/stats` - Get statistics
- PUT `/api/advisors/availability` - Toggle availability

### Chat
- GET `/api/chat/conversations` - Get user's conversations
- GET `/api/chat/messages/:conversationId` - Get messages (polled every 3s)
- POST `/api/chat/send` - Send message
- PUT `/api/chat/mark-read/:conversationId` - Mark as read

### AI
- POST `/api/ai/chat` - Chat with Gemini AI

### Admin
- GET `/api/admin/stats` - System statistics
- GET `/api/admin/conversations` - All conversations
- GET `/api/admin/users` - All users
- GET `/api/admin/faqs` - All FAQs
- POST `/api/admin/faqs` - Create FAQ
- PUT `/api/admin/faqs/:id` - Update FAQ
- DELETE `/api/admin/faqs/:id` - Delete FAQ

---

## Success Criteria

✅ All 3 user types can login successfully
✅ Student dashboard shows personalized data
✅ AI chat provides relevant, personalized responses
✅ Advisor dashboard displays assigned students
✅ Advisor chat polling works (3-second intervals)
✅ Admin dashboard shows accurate system stats
✅ FAQ CRUD operations work without errors
✅ Conversation viewer displays all conversations
✅ User table shows all 331 users correctly
✅ No console errors during normal usage
✅ All API calls complete successfully (check Network tab)

---

## Phase 7 Complete When:

1. All test flows completed successfully
2. All 15 testing tasks checked off
3. Any bugs documented and addressed
4. PROGRESS_REPORT.md updated to 100%
