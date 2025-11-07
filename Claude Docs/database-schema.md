# MentorLink Database Schema Documentation

Complete database schema for the MentorLink MVP system.

---

## Existing Tables (Already Implemented)

### `levels`
Academic levels (1-5) in the college system.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| level_number | integer | Level number (1-5) |
| name | text | Level name (e.g., "Level 1", "First Year") |
| created_at | timestamp | Creation timestamp |

### `profiles`
User profile information for all users (students, advisors, admins).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (references auth.users) |
| student_id | text | Student ID (nullable for non-students) |
| full_name | text | Full name |
| email | text | Email address |
| level_id | uuid | Foreign key to levels (nullable for non-students) |
| section_id | uuid | Foreign key to sections (NEW FIELD) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Row Level Security:**
- Users can view their own profile
- Advisors can view profiles of their assigned students
- Admins can view all profiles

### `user_roles`
Role assignments for users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| role | user_role_enum | Role: 'admin', 'advisor', or 'student' |
| created_at | timestamp | Creation timestamp |

**RLS:** Users can view their own roles, admins can view all.

### `advisors`
Advisor-specific information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to profiles |
| level_id | uuid | Foreign key to levels |
| specialization | text | Area of specialization |
| is_available | boolean | Availability status |
| created_at | timestamp | Creation timestamp |

**RLS:** Advisors can view their own record, admins can view all.

### `conversations`
Chat conversations between students and advisors.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| student_id | uuid | Foreign key to profiles |
| advisor_id | uuid | Foreign key to profiles |
| status | text | Status: 'active', 'resolved', 'closed' |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**RLS:**
- Students can view their own conversations
- Advisors can view conversations they're part of
- Admins can view all conversations

### `messages`
Individual messages within conversations.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| conversation_id | uuid | Foreign key to conversations |
| sender_id | uuid | Foreign key to profiles |
| content | text | Message content |
| is_read | boolean | Read status |
| created_at | timestamp | Creation timestamp |

**RLS:**
- Users can view messages in their conversations
- Real-time subscriptions enabled

**Realtime:** Enabled for live messaging

### `faqs`
Frequently asked questions for AI assistant.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| question | text | Question text |
| answer | text | Answer text |
| category | text | Category (e.g., "Registration", "GPA") |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**RLS:** Read access for all authenticated users, write access for admins only.

---

## New Tables (To Be Created)

### `sections`
Class sections within each academic level.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (default: gen_random_uuid()) |
| level_id | uuid | Foreign key to levels |
| section_name | text | Section name (e.g., "A", "B", "C") |
| created_at | timestamp | Creation timestamp (default: now()) |

**Unique Constraint:** (level_id, section_name)

**RLS Policies:**
- SELECT: All authenticated users can view
- INSERT: Only admins
- UPDATE: Only admins
- DELETE: Only admins

**Sample Data:**
```sql
-- Sections A, B, C for each of 5 levels (15 rows total)
Level 1: Section A, Section B, Section C
Level 2: Section A, Section B, Section C
... etc
```

### `student_academic_data`
Academic performance and enrollment data for students.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (default: gen_random_uuid()) |
| student_id | uuid | Foreign key to profiles (unique) |
| gpa | decimal(3,2) | Grade point average (0.00 - 4.00) |
| enrolled_courses | jsonb | Array of enrolled course names |
| attendance_percentage | decimal(5,2) | Attendance percentage (0.00 - 100.00) |
| created_at | timestamp | Creation timestamp (default: now()) |
| updated_at | timestamp | Last update timestamp (default: now()) |

**Unique Constraint:** student_id

**RLS Policies:**
- SELECT: Students can view their own data, advisors can view assigned students' data, admins can view all
- INSERT: Only admins
- UPDATE: Only admins
- DELETE: Only admins

**Sample enrolled_courses format:**
```json
["Introduction to Computer Science", "Calculus I", "English Composition", "Physics I"]
```

### `advisor_assignments`
Tracks which advisor is assigned to which student.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (default: gen_random_uuid()) |
| student_id | uuid | Foreign key to profiles (unique) |
| advisor_id | uuid | Foreign key to advisors |
| level_id | uuid | Foreign key to levels |
| section_id | uuid | Foreign key to sections |
| assigned_at | timestamp | Assignment timestamp (default: now()) |

**Unique Constraint:** student_id (one advisor per student)

**Foreign Keys:**
- student_id → profiles(id) ON DELETE CASCADE
- advisor_id → advisors(id) ON DELETE SET NULL
- level_id → levels(id) ON DELETE SET NULL
- section_id → sections(id) ON DELETE SET NULL

**RLS Policies:**
- SELECT: Students can view their own assignment, advisors can view their assignments, admins can view all
- INSERT: Triggered by auto_assign_advisor() function or admins
- UPDATE: Only admins
- DELETE: Only admins

---

## Functions and Triggers

### `auto_assign_advisor()`
Automatically assigns an advisor to a student when their profile is created.

**Trigger:** AFTER INSERT on `profiles` table (when level_id is not null)

**Logic:**
1. Find all available advisors for the student's level
2. Count current student assignments for each advisor
3. Select advisor with fewest assignments
4. Create entry in `advisor_assignments` table
5. Return the new profile row

**SQL Implementation:**
```sql
CREATE OR REPLACE FUNCTION auto_assign_advisor()
RETURNS TRIGGER AS $$
DECLARE
  assigned_advisor_id UUID;
BEGIN
  -- Only auto-assign for students (those with a level_id)
  IF NEW.level_id IS NOT NULL THEN
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

    -- Create assignment if advisor found
    IF assigned_advisor_id IS NOT NULL THEN
      INSERT INTO advisor_assignments (student_id, advisor_id, level_id, section_id)
      VALUES (NEW.id, assigned_advisor_id, NEW.level_id, NEW.section_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_assign_advisor
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_advisor();
```

---

## Indexes for Performance

```sql
-- Existing indexes
CREATE INDEX idx_profiles_level_id ON profiles(level_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_conversations_student_id ON conversations(student_id);
CREATE INDEX idx_conversations_advisor_id ON conversations(advisor_id);

-- New indexes
CREATE INDEX idx_sections_level_id ON sections(level_id);
CREATE INDEX idx_student_academic_data_student_id ON student_academic_data(student_id);
CREATE INDEX idx_advisor_assignments_student_id ON advisor_assignments(student_id);
CREATE INDEX idx_advisor_assignments_advisor_id ON advisor_assignments(advisor_id);
CREATE INDEX idx_advisor_assignments_level_id ON advisor_assignments(level_id);
CREATE INDEX idx_profiles_section_id ON profiles(section_id);
CREATE INDEX idx_faqs_category ON faqs(category);
```

---

## Database Views (Optional - For Admin Dashboard)

### `v_student_overview`
Convenient view combining student data for admin dashboard.

```sql
CREATE OR REPLACE VIEW v_student_overview AS
SELECT
  p.id,
  p.student_id,
  p.full_name,
  p.email,
  l.name as level_name,
  s.section_name,
  sa.gpa,
  sa.attendance_percentage,
  aa.advisor_id,
  adv_prof.full_name as advisor_name
FROM profiles p
LEFT JOIN levels l ON p.level_id = l.id
LEFT JOIN sections s ON p.section_id = s.id
LEFT JOIN student_academic_data sa ON p.id = sa.student_id
LEFT JOIN advisor_assignments aa ON p.id = aa.student_id
LEFT JOIN advisors adv ON aa.advisor_id = adv.id
LEFT JOIN profiles adv_prof ON adv.user_id = adv_prof.id
WHERE EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'student');
```

### `v_advisor_workload`
View showing advisor workload for admin.

```sql
CREATE OR REPLACE VIEW v_advisor_workload AS
SELECT
  a.id as advisor_id,
  p.full_name as advisor_name,
  l.name as level_name,
  a.specialization,
  a.is_available,
  COUNT(aa.student_id) as assigned_students
FROM advisors a
JOIN profiles p ON a.user_id = p.id
LEFT JOIN levels l ON a.level_id = l.id
LEFT JOIN advisor_assignments aa ON a.id = aa.advisor_id
GROUP BY a.id, p.full_name, l.name, a.specialization, a.is_available;
```

---

## Migration Order

1. **Migration 1:** Create `sections` table
2. **Migration 2:** Create `student_academic_data` table
3. **Migration 3:** Create `advisor_assignments` table and add section_id to profiles
4. **Migration 4:** Create `auto_assign_advisor()` function and trigger
5. **Migration 5:** Populate sample data (sections, FAQs, academic data)
6. **Migration 6:** Create performance indexes
7. **Migration 7:** Create admin views (optional)

---

## Data Privacy and Security

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Students: Access to their own data only
- Advisors: Access to assigned students' data
- Admins: Full access to all data

### Sensitive Data
- API keys stored in environment variables (never in database)
- Student academic records protected by RLS
- Chat messages encrypted in transit (Supabase default)

### Audit Trail
- All tables have `created_at` timestamps
- Update-sensitive tables have `updated_at` timestamps
- Consider adding audit log table for admin actions (post-MVP)

---

## Sample Data Requirements

### Sections (15 rows)
- 3 sections (A, B, C) for each of 5 levels

### FAQs (20 rows)
- See `sample-faqs.md` for complete list
- Categories: Registration, Graduation, GPA, Advisor, Transcripts, Transfer, Prerequisites, Exams, General

### Student Academic Data (for existing students)
- Generate realistic GPA (2.0 - 4.0)
- Sample course lists appropriate for each level
- Random attendance (75% - 100%)

---

This schema supports the complete MVP functionality including auto-assignment, personalized AI assistance, and comprehensive admin oversight.
