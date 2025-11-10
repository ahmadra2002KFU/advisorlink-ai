-- MentorLink SQLite Database Schema
-- SQLite automatically creates the database file, no CREATE DATABASE needed

-- 1. Users table (all users: students, advisors, admins)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK(user_type IN ('student', 'advisor', 'admin')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);

-- 2. Levels table (academic levels 1-5)
CREATE TABLE IF NOT EXISTS levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level_number INTEGER UNIQUE NOT NULL,
    level_name TEXT NOT NULL
);

-- 3. Sections table (class sections A, B, C)
CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level_id INTEGER NOT NULL,
    section_name TEXT NOT NULL,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
    UNIQUE (level_id, section_name)
);
CREATE INDEX IF NOT EXISTS idx_sections_level ON sections(level_id);

-- 4. Students table (student-specific data)
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    birthdate TEXT NOT NULL,
    level_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    gpa REAL CHECK (gpa >= 0.00 AND gpa <= 4.00),
    attendance_percentage REAL CHECK (attendance_percentage >= 0.00 AND attendance_percentage <= 100.00),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES levels(id),
    FOREIGN KEY (section_id) REFERENCES sections(id)
);
CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_level ON students(level_id);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(section_id);

-- 5. Student courses table (enrolled courses with enhanced details)
CREATE TABLE IF NOT EXISTS student_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_name TEXT NOT NULL,
    course_code TEXT NOT NULL,
    -- Enhanced fields (added 2025-11-07)
    instructor_name TEXT,
    instructor_email TEXT,
    class_time TEXT,
    class_days TEXT,
    room_number TEXT,
    building TEXT,
    credit_hours INTEGER DEFAULT 3,
    current_grade TEXT,
    semester TEXT,
    department TEXT,
    course_description TEXT,
    prerequisites TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_student_courses_student ON student_courses(student_id);

-- 6. Advisors table (advisor-specific data)
CREATE TABLE IF NOT EXISTS advisors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    level_id INTEGER NOT NULL,
    specialization TEXT,
    is_available INTEGER DEFAULT 1 CHECK(is_available IN (0, 1)),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES levels(id)
);
CREATE INDEX IF NOT EXISTS idx_advisors_user ON advisors(user_id);
CREATE INDEX IF NOT EXISTS idx_advisors_level ON advisors(level_id);
CREATE INDEX IF NOT EXISTS idx_advisors_available ON advisors(is_available);

-- 7. Advisor assignments (student-advisor mapping)
CREATE TABLE IF NOT EXISTS advisor_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER UNIQUE NOT NULL,
    advisor_id INTEGER NOT NULL,
    assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (advisor_id) REFERENCES advisors(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_advisor_assignments_student ON advisor_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_advisor_assignments_advisor ON advisor_assignments(advisor_id);

-- 8. Conversations table (chat conversations)
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    advisor_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'resolved', 'closed')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (advisor_id) REFERENCES advisors(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_conversations_student ON conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_conversations_advisor ON conversations(advisor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at);

-- Trigger to auto-update updated_at for conversations
CREATE TRIGGER IF NOT EXISTS update_conversations_timestamp
AFTER UPDATE ON conversations
BEGIN
  UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 9. Messages table (chat messages)
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    message_text TEXT NOT NULL,
    is_read INTEGER DEFAULT 0 CHECK(is_read IN (0, 1)),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- 10. FAQs table (frequently asked questions for AI)
CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);

-- Trigger to auto-update updated_at for faqs
CREATE TRIGGER IF NOT EXISTS update_faqs_timestamp
AFTER UPDATE ON faqs
BEGIN
  UPDATE faqs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 11. AI Chat History table (student AI conversations)
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_student ON ai_chat_history(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created ON ai_chat_history(created_at);

-- Insert initial levels
INSERT OR IGNORE INTO levels (level_number, level_name) VALUES
(1, 'Level 1'),
(2, 'Level 2'),
(3, 'Level 3'),
(4, 'Level 4'),
(5, 'Level 5');

-- Insert sections (A, B, C for each level)
INSERT OR IGNORE INTO sections (level_id, section_name)
SELECT l.id, s.section_name
FROM levels l
CROSS JOIN (
    SELECT 'A' AS section_name
    UNION SELECT 'B'
    UNION SELECT 'C'
) s;

-- Insert comprehensive FAQs
INSERT OR IGNORE INTO faqs (question, answer, category) VALUES
-- Registration
('How do I register for courses?', 'Course registration opens at the beginning of each semester. Log into the student portal, navigate to "Course Registration," select your desired courses from the available list, and click "Register." Make sure you meet all prerequisites and don''t exceed the credit hour limit for your level.', 'Registration'),
('What is the maximum number of credit hours I can take per semester?', 'Students can register for a maximum of 18 credit hours per semester. If you wish to exceed this limit, you need written approval from your academic advisor and the Dean''s office.', 'Registration'),
('When is the add/drop deadline?', 'Students can add courses during the first week of the semester and drop courses without penalty during the first two weeks. After that, dropping a course results in a "W" (Withdrawal) on your transcript.', 'Registration'),

-- Graduation
('What are the graduation requirements for my level?', 'Graduation requirements vary by level and program. Generally, you need to complete all required courses for your major, maintain a minimum GPA of 2.0, complete at least 120 credit hours (varies by program), and pass the comprehensive exam in your final year.', 'Graduation'),
('How many credit hours do I need to graduate?', 'Most bachelor''s degree programs require 120-130 credit hours, depending on your major. Check with your academic advisor for your specific program requirements.', 'Graduation'),
('Can I graduate early?', 'Yes, if you complete all graduation requirements ahead of schedule. You''ll need approval from your academic advisor and must submit an early graduation petition at least one semester before your intended graduation date.', 'Graduation'),

-- GPA
('How is my GPA calculated?', 'Your GPA is calculated by dividing the total number of grade points earned by the total number of credit hours attempted. Grade points are calculated by multiplying the credit hours for each course by the grade point value (A=4.0, B=3.0, C=2.0, D=1.0, F=0.0).', 'GPA'),
('What is academic probation?', 'Academic probation occurs when your cumulative GPA falls below 2.0. Students on probation have one semester to raise their GPA above 2.0 or face academic suspension. During probation, you may be limited to 12 credit hours per semester.', 'GPA'),
('What happens if I fail a course?', 'If you fail a required course, you must retake it. The new grade will replace the old grade in your GPA calculation, but both attempts will appear on your transcript. Failed electives don''t need to be retaken unless required for your degree.', 'GPA'),

-- Advisor
('How do I schedule a meeting with my academic advisor?', 'You can contact your advisor through the MentorLink platform or by email. Advisors typically hold office hours Monday-Thursday from 10 AM to 2 PM. You can also request a meeting at a different time if needed.', 'Advisor'),
('What does my academic advisor help me with?', 'Your academic advisor helps with course selection, graduation planning, academic concerns, career guidance, prerequisite clarification, and navigating university policies. They''re your primary contact for all academic matters.', 'Advisor'),
('Can I change my academic advisor?', 'Advisor assignments are based on your level and section. If you have a specific concern, contact the Dean''s office to discuss the possibility of reassignment.', 'Advisor'),

-- Transcripts
('How do I request an official transcript?', 'You can request official transcripts through the Registrar''s Office. Submit a transcript request form (available online or in person) with a $10 processing fee. Transcripts are typically processed within 3-5 business days.', 'Transcripts'),
('Can I see my unofficial transcript?', 'Yes, you can view and download your unofficial transcript anytime through the student portal under "Academic Records."', 'Transcripts'),

-- Transfer
('Can I transfer credits from another institution?', 'Yes, you can transfer credits from accredited institutions. Submit official transcripts to the Registrar''s Office for evaluation. Generally, courses with a grade of C or higher may transfer, but final decisions are made by the academic department.', 'Transfer'),
('How many transfer credits can I apply toward my degree?', 'You can transfer up to 60 credit hours toward a bachelor''s degree. At least 50% of your degree requirements must be completed at this institution.', 'Transfer'),

-- Prerequisites
('What are prerequisites and why do they matter?', 'Prerequisites are courses you must complete before enrolling in advanced courses. They ensure you have the necessary foundation. You cannot register for a course without completing its prerequisites unless you receive a waiver from the instructor.', 'Prerequisites'),
('How do I find out the prerequisites for a course?', 'Prerequisites are listed in the course catalog and on the course registration page. You can also ask your academic advisor or check the department website.', 'Prerequisites'),

-- Exams
('When are final exams held?', 'Final exams are held during the last two weeks of each semester according to the published exam schedule. Check the academic calendar or student portal for specific dates and times.', 'Exams'),
('What should I do if I have a conflict with an exam schedule?', 'If you have three exams scheduled on the same day or other conflicts, contact your instructors immediately to arrange for a makeup exam. Requests must be made at least two weeks before the exam date.', 'Exams'),
('Can I get an extension on an assignment?', 'Extension policies vary by instructor. Contact your professor directly to discuss your situation. Extensions are typically granted only for documented emergencies or extenuating circumstances.', 'Exams'),

-- General
('What is the attendance policy?', 'Attendance policies vary by course and instructor. Generally, missing more than 25% of classes may result in automatic failure. Check your course syllabus for specific attendance requirements.', 'General'),
('Can I take courses pass/fail?', 'Yes, you can take up to 12 credit hours of elective courses on a pass/fail basis. Required courses for your major must be taken for a letter grade. Discuss this option with your advisor.', 'General'),
('Where can I get tutoring help?', 'The Academic Success Center offers free tutoring for most subjects Monday-Friday from 9 AM to 5 PM. You can also find peer tutors through the student portal or ask your instructor for recommendations.', 'General'),
('What should I do if I''m struggling academically?', 'Contact your academic advisor immediately. They can connect you with tutoring services, counseling, time management workshops, and other resources. Don''t wait until it''s too late to seek help.', 'General');

-- Verification queries
SELECT 'Database created successfully' AS status;
SELECT COUNT(*) AS levels_count FROM levels;
SELECT COUNT(*) AS sections_count FROM sections;
SELECT COUNT(*) AS faqs_count FROM faqs;
