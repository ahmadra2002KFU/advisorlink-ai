# MentorLink MVP Implementation Plan

## 🎯 MVP Objectives
Build a proof-of-concept student-advisor platform with AI assistance, real-time messaging, and admin oversight.

---

## 📊 Current State Analysis

**✅ Already Built:**
- Complete React + TypeScript + Vite setup with Supabase backend
- Authentication system with email/password
- 3-tier role system (Admin, Advisor, Student)
- Basic dashboards for all three roles
- Real-time messaging infrastructure
- Database schema with RLS policies
- Dark mode + i18n (English/Arabic)
- 50+ shadcn/ui components

**⚠️ Needs Implementation:**
- Auto-assign advisors to students by level
- Class section management
- Gemini AI integration with personalized context
- FAQ management system for AI
- Enhanced admin dashboard with comprehensive stats
- Improved chat archiving and search
- Student personal data display (GPA, courses, etc.)

---

## 🗄️ Database Schema Updates

### New Tables to Create:
1. **`sections`** - Class sections within levels
   - id, level_id, section_name (A, B, C, etc.), created_at

2. **`student_academic_data`** - Academic records for AI personalization
   - id, student_id, gpa, enrolled_courses (jsonb), attendance_percentage, created_at, updated_at

3. **`advisor_assignments`** - Track advisor-student relationships
   - id, student_id, advisor_id, level_id, section_id, assigned_at

### Tables to Update:
- **`profiles`** - Add `section_id` field
- **`faqs`** - Populate with sample academic FAQs (15-20 entries)

---

## 🤖 Gemini AI Integration Strategy

### Implementation Approach:
1. **Replace current AI Gateway** with direct Gemini API integration
2. **Use Gemini 2.5 Flash model** (fast, cost-effective for MVP)
3. **Create Supabase Edge Function**: `gemini-assistant`

### AI Context Strategy:
**System Instruction Template:**
```
You are an academic advisor assistant for [College Name].
Help students with academic questions using the FAQ database and their personal information.

Student Context:
- ID: {student_id}
- Name: {full_name}
- Level: {level}
- Section: {section}
- GPA: {gpa}
- Courses: {enrolled_courses}
- Assigned Advisor: {advisor_name}

Base your responses on the provided FAQs and this student's specific situation.
Be helpful, concise, and refer students to their advisor for complex issues.
```

### Features:
- Multi-turn conversation with chat history
- FAQ-based responses
- Personalized advice using student data
- Streaming responses for better UX
- Error handling for API limits

---

## 📁 Implementation Phases

### **Phase 1: Database & Auto-Assignment** (Foundation)
**Files to Create:**
- `supabase/migrations/[timestamp]_add_sections_and_academic_data.sql`
- `supabase/migrations/[timestamp]_add_advisor_assignment_logic.sql`

**Files to Modify:**
- Database types will auto-regenerate

**What to Build:**
1. Create `sections` table
2. Create `student_academic_data` table
3. Create `advisor_assignments` table
4. Add `section_id` to profiles
5. Create SQL function `auto_assign_advisor()` triggered on student creation
6. Populate sample sections (A, B, C for each level 1-5)
7. Populate sample academic data for existing students

---

### **Phase 2: Gemini AI Integration** (Core Feature)
**Files to Create:**
- `supabase/functions/gemini-assistant/index.ts` (new Edge Function)
- `supabase/functions/gemini-assistant/deno.json`
- `src/lib/gemini-config.ts` (API configuration)
- `Claude Docs/gemini-integration.md` (documentation)
- `Claude Docs/sample-faqs.md` (FAQ reference)

**Files to Modify:**
- `src/pages/Chat.tsx` (update to use new Gemini endpoint)
- `src/integrations/supabase/client.ts` (add Gemini types if needed)

**What to Build:**
1. Create new Edge Function with Gemini API integration
2. Implement system instruction builder with student context
3. Add FAQ retrieval from database
4. Implement multi-turn chat with history
5. Add streaming response support
6. Update Chat.tsx to call new endpoint
7. Populate `faqs` table with 15-20 sample academic FAQs
8. Add error handling for API rate limits

**Sample FAQs to Create:**
- Course registration process
- Graduation requirements by level
- GPA calculation
- Add/drop deadlines
- Academic probation policies
- Advisor meeting scheduling
- Transcript requests
- Transfer credit policies
- Prerequisite requirements
- Exam schedules
- etc.

---

### **Phase 3: Enhanced Admin Dashboard** (Oversight)
**Files to Modify:**
- `src/components/dashboard/AdminDashboard.tsx`
- `src/pages/AdminPanel.tsx`

**What to Build:**
1. **Real-time Stats Display:**
   - Total students by level & section
   - Total advisors by level
   - Active conversations count
   - AI chat usage metrics
   - Average response times

2. **Chat Archive Viewer:**
   - View all student-advisor conversations
   - View all AI assistant conversations
   - Filter by student, advisor, level, date
   - Search message content

3. **User Management (Basic):**
   - List all users with roles
   - View user details
   - Simple role assignment

4. **FAQ Management Interface:**
   - CRUD operations for FAQs
   - Category management
   - Preview how AI uses FAQs

---

### **Phase 4: Student & Advisor Enhancements** (Polish)
**Files to Modify:**
- `src/components/dashboard/StudentDashboard.tsx`
- `src/components/dashboard/AdvisorDashboard.tsx`
- `src/pages/Chat.tsx`
- `src/pages/AdvisorChat.tsx`

**What to Build:**

**Student Side:**
1. Display personal academic data (GPA, courses, attendance)
2. Show assigned advisor with availability
3. Display section and level info
4. Better AI chat interface with typing indicators
5. View chat history with advisor

**Advisor Side:**
1. View all assigned students (by level/section)
2. View student academic data when chatting
3. Mark conversations as resolved/ongoing
4. Set availability schedule (simple on/off toggle for MVP)
5. Student search and filter

---

## 🛠️ Technical Implementation Details

### Gemini API Setup:
```javascript
// Direct REST API approach (no SDK needed for MVP)
const GEMINI_API_KEY = 'AIzaSyCucNtY7tHAND34lO0IUWiTyjxms8h36H4';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Headers
{
  'Content-Type': 'application/json',
  'x-goog-api-key': GEMINI_API_KEY
}

// Payload structure
{
  system_instruction: { parts: [{ text: systemPrompt }] },
  contents: [...chatHistory, currentMessage],
  generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
}
```

### Auto-Assignment Logic:
```sql
-- Trigger function to assign advisor when student profile created
CREATE OR REPLACE FUNCTION auto_assign_advisor()
RETURNS TRIGGER AS $$
DECLARE
  assigned_advisor_id UUID;
BEGIN
  -- Find available advisor for student's level with least students
  SELECT a.id INTO assigned_advisor_id
  FROM advisors a
  WHERE a.level_id = NEW.level_id
    AND a.is_available = true
  ORDER BY (
    SELECT COUNT(*)
    FROM advisor_assignments aa
    WHERE aa.advisor_id = a.id
  ) ASC
  LIMIT 1;

  -- Create assignment
  IF assigned_advisor_id IS NOT NULL THEN
    INSERT INTO advisor_assignments (student_id, advisor_id, level_id, section_id)
    VALUES (NEW.id, assigned_advisor_id, NEW.level_id, NEW.section_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 📂 File Structure for New Features

```
advisorlink-ai/
├── Claude Docs/                          # NEW
│   ├── plan.md                          # This plan
│   ├── gemini-integration.md            # Gemini API documentation
│   ├── sample-faqs.md                   # FAQ reference
│   └── database-schema.md               # Updated schema docs
├── supabase/
│   ├── migrations/
│   │   ├── [new]_add_sections.sql       # NEW
│   │   ├── [new]_add_academic_data.sql  # NEW
│   │   └── [new]_auto_assign_advisor.sql # NEW
│   └── functions/
│       └── gemini-assistant/             # NEW (replaces ai-assistant)
│           ├── index.ts
│           └── deno.json
├── src/
│   ├── lib/
│   │   └── gemini-config.ts              # NEW
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AdminDashboard.tsx        # MODIFY
│   │   │   ├── AdvisorDashboard.tsx      # MODIFY
│   │   │   └── StudentDashboard.tsx      # MODIFY
│   │   └── admin/                        # NEW
│   │       ├── FAQManager.tsx
│   │       ├── ChatArchiveViewer.tsx
│   │       └── UserManagementTable.tsx
│   └── pages/
│       ├── Chat.tsx                      # MODIFY (use Gemini)
│       ├── AdvisorChat.tsx               # MODIFY (enhancements)
│       └── AdminPanel.tsx                # MODIFY (full features)
```

---

## 🎨 Key Features Summary

| Feature | Status | Priority |
|---------|--------|----------|
| Auto-assign advisors by level | ⚪ New | HIGH |
| Section management | ⚪ New | HIGH |
| Gemini AI with personalization | ⚪ New | HIGH |
| FAQ management system | ⚪ New | HIGH |
| Student academic data display | ⚪ New | MEDIUM |
| Enhanced admin dashboard | 🟡 Improve | MEDIUM |
| Chat archive & search | ⚪ New | MEDIUM |
| Advisor availability toggle | 🟡 Improve | LOW |

---

## ⚡ MVP Simplifications (Not Prod-Ready)

✅ **What We're Skipping:**
- Email notifications
- File uploads in chats
- Advanced analytics/reporting
- Profile editing (admin can use DB directly)
- Password reset flow (use Supabase dashboard)
- Complex scheduling system
- Mobile app
- Extensive error handling
- Rate limiting
- Input sanitization (beyond basic)
- Comprehensive testing
- Performance optimization
- Caching strategies

✅ **Security Approach:**
- Use existing Supabase RLS (already good)
- Basic API key handling
- No additional security hardening
- Trust Supabase Auth

---

## 🚀 Execution Order

1. **Create Claude Docs folder** with plan.md ✅
2. **Database migrations** (sections, academic data, auto-assignment)
3. **Populate sample data** (sections, FAQs, academic records)
4. **Build Gemini Edge Function** with personalization
5. **Update Chat.tsx** to use Gemini
6. **Enhance Admin Dashboard** with stats and FAQ manager
7. **Improve Student/Advisor dashboards** with new data
8. **Test end-to-end** flow (signup → auto-assign → chat with AI → chat with advisor → admin views)

---

## ✨ Expected MVP Outcome

**Student Experience:**
- Signup → Auto-assigned to advisor by level
- View personal data (ID, level, section, GPA, courses)
- Chat with AI assistant that knows their context
- Contact assigned advisor via real-time chat

**Advisor Experience:**
- View assigned students by level/section
- See student academic data during conversations
- Real-time messaging with multiple students
- Toggle availability

**Admin Experience:**
- View all system statistics
- Monitor all conversations (student-advisor + AI chats)
- Manage FAQs for AI
- Basic user management

**AI Assistant:**
- Responds using FAQ knowledge base
- Personalizes responses with student data
- Maintains conversation history
- Streams responses for better UX

---

This is a **complete, working MVP** that demonstrates all core functionality without production-grade polish.
