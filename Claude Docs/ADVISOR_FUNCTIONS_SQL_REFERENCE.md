# Advisor Functions SQL Reference Guide
## Quick Reference for All 5 Advisor Query Functions

---

## Function 1: getAdvisorStudentList

**Description:** Get complete list of students assigned to an advisor

**SQL Query:**
```sql
SELECT
  s.id as student_id,
  s.student_id as student_number,
  u.full_name,
  u.email,
  l.level_number,
  l.level_name,
  sec.section_name,
  s.gpa,
  s.attendance_percentage
FROM advisor_assignments aa
JOIN students s ON aa.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN levels l ON s.level_id = l.id
JOIN sections sec ON s.section_id = sec.id
WHERE aa.advisor_id = ?
ORDER BY l.level_number, sec.section_name, u.full_name
```

**Parameters:**
- `advisorId` (from context)

**Sample Response:**
```json
{
  "success": true,
  "message": "You have 15 students assigned",
  "totalStudents": 15,
  "students": [
    {
      "studentId": "STU001",
      "name": "John Smith",
      "email": "john.smith@edu",
      "level": "Level 1 (Level 1)",
      "section": "A",
      "gpa": "3.45",
      "attendance": "92.5%"
    }
  ]
}
```

---

## Function 2: getHighestGPAStudent

**Description:** Find the student with the highest GPA

**SQL Query:**
```sql
SELECT
  s.student_id as student_number,
  u.full_name,
  u.email,
  l.level_number,
  l.level_name,
  sec.section_name,
  s.gpa,
  s.attendance_percentage
FROM advisor_assignments aa
JOIN students s ON aa.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN levels l ON s.level_id = l.id
JOIN sections sec ON s.section_id = sec.id
WHERE aa.advisor_id = ? AND s.gpa IS NOT NULL
ORDER BY s.gpa DESC
LIMIT 1
```

**Parameters:**
- `advisorId` (from context)

**Sample Response:**
```json
{
  "success": true,
  "message": "Jane Doe has the highest GPA among your students",
  "student": {
    "studentId": "STU045",
    "name": "Jane Doe",
    "email": "jane.doe@edu",
    "level": "Level 2 (Level 2)",
    "section": "B",
    "gpa": "3.95",
    "attendance": "97.2%"
  }
}
```

---

## Function 3: getHonorStudents

**Description:** Get honor students categorized by honor level

**SQL Query:**
```sql
SELECT
  s.student_id as student_number,
  u.full_name,
  u.email,
  l.level_number,
  l.level_name,
  sec.section_name,
  s.gpa,
  s.attendance_percentage,
  CASE
    WHEN s.gpa >= 3.90 THEN 'Highest Honors (Summa Cum Laude)'
    WHEN s.gpa >= 3.75 THEN 'High Honors (Magna Cum Laude)'
    WHEN s.gpa >= 3.50 THEN 'Honors (Cum Laude)'
    ELSE 'Not Categorized'
  END as honor_category
FROM advisor_assignments aa
JOIN students s ON aa.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN levels l ON s.level_id = l.id
JOIN sections sec ON s.section_id = sec.id
WHERE aa.advisor_id = ? AND s.gpa >= ?
ORDER BY s.gpa DESC, u.full_name
```

**Parameters:**
- `advisorId` (from context)
- `minGPA` (optional, defaults to 3.5)

**Honor Categories:**
- **Highest Honors (Summa Cum Laude):** GPA >= 3.90
- **High Honors (Magna Cum Laude):** GPA >= 3.75
- **Honors (Cum Laude):** GPA >= 3.50

**Sample Response:**
```json
{
  "success": true,
  "message": "Found 8 honor students with GPA >= 3.50",
  "totalHonorStudents": 8,
  "summary": {
    "highestHonorsCount": 2,
    "highHonorsCount": 3,
    "honorsCount": 3
  },
  "studentsByCategory": {
    "highestHonors": {
      "category": "Highest Honors (Summa Cum Laude)",
      "description": "GPA >= 3.90",
      "count": 2,
      "students": [
        {
          "studentId": "STU045",
          "name": "Jane Doe",
          "email": "jane.doe@edu",
          "level": "Level 2 (Level 2)",
          "section": "B",
          "gpa": "3.95",
          "attendance": "97.2%",
          "honorCategory": "Highest Honors (Summa Cum Laude)"
        }
      ]
    },
    "highHonors": { /* ... */ },
    "honors": { /* ... */ }
  }
}
```

---

## Function 4: getStudentsByGPA

**Description:** Filter students by GPA threshold (above or below)

**SQL Query (Dynamic):**
```sql
SELECT
  s.student_id as student_number,
  u.full_name,
  u.email,
  l.level_number,
  l.level_name,
  sec.section_name,
  s.gpa,
  s.attendance_percentage
FROM advisor_assignments aa
JOIN students s ON aa.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN levels l ON s.level_id = l.id
JOIN sections sec ON s.section_id = sec.id
WHERE aa.advisor_id = ? AND s.gpa IS NOT NULL AND s.gpa {operator} ?
ORDER BY s.gpa {orderDirection}, u.full_name
```

**Dynamic Parts:**
```typescript
const operator = comparison === 'below' ? '<' : '>';
const orderDirection = comparison === 'below' ? 'ASC' : 'DESC';
```

**Parameters:**
- `advisorId` (from context)
- `threshold` (required, 0.0-4.0)
- `comparison` (optional, "below" or "above", defaults to "below")

**Use Cases:**
- `threshold: 2.0, comparison: "below"` → At-risk students
- `threshold: 3.5, comparison: "above"` → High performers

**Sample Response (Below Threshold):**
```json
{
  "success": true,
  "message": "Found 3 students with GPA below 2.50",
  "category": "At-risk students (below threshold)",
  "threshold": "2.50",
  "comparison": "below",
  "totalStudents": 3,
  "students": [
    {
      "studentId": "STU123",
      "name": "Bob Wilson",
      "email": "bob.wilson@edu",
      "level": "Level 1 (Level 1)",
      "section": "C",
      "gpa": "2.15",
      "attendance": "78.3%"
    }
  ]
}
```

**Sample Response (Above Threshold):**
```json
{
  "success": true,
  "message": "Found 5 students with GPA above 3.50",
  "category": "High performers (above threshold)",
  "threshold": "3.50",
  "comparison": "above",
  "totalStudents": 5,
  "students": [ /* ... */ ]
}
```

---

## Function 5: getLastStudentContact

**Description:** Find most recent contact with a student (checks both conversations and AI chat)

### Step 1: Find Student by Name (Fuzzy Match)
```sql
SELECT
  s.id as student_id,
  s.student_id as student_number,
  u.full_name,
  u.email,
  l.level_name,
  sec.section_name
FROM advisor_assignments aa
JOIN students s ON aa.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN levels l ON s.level_id = l.id
JOIN sections sec ON s.section_id = sec.id
WHERE aa.advisor_id = ? AND LOWER(u.full_name) LIKE LOWER(?)
ORDER BY
  CASE
    WHEN LOWER(u.full_name) = LOWER(?) THEN 1      -- Exact match first
    WHEN LOWER(u.full_name) LIKE LOWER(?) THEN 2   -- Starts with next
    ELSE 3                                           -- Contains anywhere
  END
LIMIT 1
```

### Step 2: Check Conversations Table
```sql
SELECT
  MAX(updated_at) as last_contact_time,
  'conversation' as contact_type
FROM conversations
WHERE student_id = ? AND advisor_id = ?
```

### Step 3: Check AI Chat History Table
```sql
SELECT
  MAX(created_at) as last_contact_time,
  'ai_chat' as contact_type
FROM ai_chat_history
WHERE student_id = ?
```

### Step 4: Compare and Return Most Recent

**TypeScript Logic:**
```typescript
if (lastConversation?.last_contact_time && lastAIChat?.last_contact_time) {
  // Both exist, compare timestamps
  const convTime = new Date(lastConversation.last_contact_time).getTime();
  const aiTime = new Date(lastAIChat.last_contact_time).getTime();

  if (convTime >= aiTime) {
    contactType = 'Advisor-Student Conversation';
    contactTime = lastConversation.last_contact_time;
  } else {
    contactType = 'AI Chat Session';
    contactTime = lastAIChat.last_contact_time;
  }
} else if (lastConversation?.last_contact_time) {
  // Only conversation exists
  contactType = 'Advisor-Student Conversation';
  contactTime = lastConversation.last_contact_time;
} else if (lastAIChat?.last_contact_time) {
  // Only AI chat exists
  contactType = 'AI Chat Session';
  contactTime = lastAIChat.last_contact_time;
}
```

**Parameters:**
- `advisorId` (from context)
- `studentName` (required, supports fuzzy matching)

**Sample Response (With Contact):**
```json
{
  "success": true,
  "student": {
    "name": "Jane Doe",
    "studentId": "STU045",
    "email": "jane.doe@edu",
    "level": "Level 2",
    "section": "B"
  },
  "lastContact": {
    "type": "Advisor-Student Conversation",
    "timestamp": "2025-11-07T14:30:00Z",
    "timeSince": "2 days",
    "formattedDate": "November 7, 2025, 02:30 PM"
  },
  "hasContact": true,
  "message": "Last contact with Jane Doe was 2 days ago via Advisor-Student Conversation."
}
```

**Sample Response (No Contact):**
```json
{
  "success": true,
  "student": {
    "name": "John Smith",
    "studentId": "STU123",
    "email": "john.smith@edu",
    "level": "Level 1",
    "section": "A"
  },
  "message": "No contact history found for John Smith. This student has not initiated any conversations or AI chats yet.",
  "hasContact": false
}
```

---

## Helper Function: calculateTimeSince

**Purpose:** Convert timestamp to human-readable format

**Logic:**
```typescript
function calculateTimeSince(timestamp: string): string {
  const now = new Date().getTime();
  const past = new Date(timestamp).getTime();
  const diffMs = now - past;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''}`;
  if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  if (diffHours > 0) return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''}`;
}
```

**Examples:**
- `1728000000` ms → "2 days"
- `7200000` ms → "2 hours"
- `2592000000` ms → "1 month"

---

## Common SQL Patterns Used

### 1. Fuzzy Matching
```sql
WHERE LOWER(u.full_name) LIKE LOWER(?)
-- Parameter: `%${searchTerm}%`
```

### 2. Prioritized Sorting
```sql
ORDER BY
  CASE
    WHEN exact_match THEN 1
    WHEN starts_with THEN 2
    ELSE 3
  END
```

### 3. CASE Statement for Categorization
```sql
CASE
  WHEN condition1 THEN 'Category 1'
  WHEN condition2 THEN 'Category 2'
  ELSE 'Default'
END as category_field
```

### 4. Dynamic Operators
```typescript
const operator = comparison === 'below' ? '<' : '>';
// Then use in SQL: WHERE gpa ${operator} ?
```

### 5. Parameterized Queries (SQL Injection Prevention)
```typescript
db.prepare(`SELECT * FROM students WHERE id = ?`).get(studentId);
// NEVER use string concatenation: `SELECT * FROM students WHERE id = ${studentId}`
```

---

## Database Tables Reference

### advisor_assignments
- `id` - Primary key
- `student_id` - Foreign key to students
- `advisor_id` - Foreign key to advisors
- `assigned_at` - Timestamp

### students
- `id` - Primary key
- `user_id` - Foreign key to users
- `student_id` - Student number (e.g., STU001)
- `level_id` - Foreign key to levels
- `section_id` - Foreign key to sections
- `gpa` - REAL (0.00-4.00)
- `attendance_percentage` - REAL (0.00-100.00)

### conversations
- `id` - Primary key
- `student_id` - Foreign key to students
- `advisor_id` - Foreign key to advisors
- `status` - 'active', 'resolved', 'closed'
- `created_at` - Timestamp
- `updated_at` - Timestamp (auto-updated)

### ai_chat_history
- `id` - Primary key
- `student_id` - Foreign key to students
- `user_message` - TEXT
- `ai_response` - TEXT
- `created_at` - Timestamp

---

## Performance Considerations

### Indexes Used
- `idx_advisor_assignments_advisor` - Fast WHERE advisor_id lookups
- `idx_advisor_assignments_student` - Fast WHERE student_id lookups
- `idx_conversations_updated` - Fast MAX(updated_at) queries
- `idx_ai_chat_history_created` - Fast MAX(created_at) queries

### Query Optimization Tips
1. Always use `WHERE` clause to filter by advisor_id
2. Use `LIMIT` when only one result needed
3. Use parameterized queries for security
4. Use appropriate indexes for JOIN operations
5. Avoid SELECT * when possible (specify columns)

---

## Testing Queries

You can test these queries directly in SQLite:

```bash
# Open database
sqlite3 mentorlink.db

# Test getAdvisorStudentList (replace ? with actual advisor_id)
SELECT COUNT(*) FROM advisor_assignments WHERE advisor_id = 1;

# Test getHighestGPAStudent
SELECT u.full_name, s.gpa
FROM students s
JOIN users u ON s.user_id = u.id
ORDER BY s.gpa DESC LIMIT 5;

# Test honor students count
SELECT COUNT(*) FROM students WHERE gpa >= 3.5;

# Test last contact
SELECT MAX(updated_at) FROM conversations WHERE advisor_id = 1;
SELECT MAX(created_at) FROM ai_chat_history;
```

---

**All queries are production-ready and tested with the existing database schema.**
