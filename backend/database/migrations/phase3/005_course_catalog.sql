-- ============================================
-- PHASE 3 MIGRATION 5: course_catalog
-- ============================================
-- Purpose: Comprehensive course catalog with all available courses
-- Created: 2025-11-11
-- Sprint: 2 (Course Intelligence)

CREATE TABLE IF NOT EXISTS course_catalog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Course identification
  course_code TEXT NOT NULL UNIQUE,             -- Unique course code (e.g., 'CS101')
  course_name TEXT NOT NULL,                    -- Course name (e.g., 'Introduction to Programming')

  -- Course details
  description TEXT,                             -- Course description
  credit_hours INTEGER NOT NULL DEFAULT 3,      -- Credit hours (typically 3)
  level INTEGER NOT NULL,                       -- Course level (1-5)

  -- Department & classification
  department TEXT NOT NULL,                     -- Department (CS, MATH, ENG, BUS, etc.)
  course_type TEXT DEFAULT 'required',          -- required, elective, general_education

  -- Instructor & scheduling
  instructor_name TEXT,                         -- Primary instructor
  semester_offered TEXT DEFAULT 'Both',         -- Fall, Spring, Summer, Both

  -- Enrollment
  max_enrollment INTEGER DEFAULT 30,            -- Maximum students
  current_enrollment INTEGER DEFAULT 0,         -- Current enrolled count

  -- Difficulty & workload
  difficulty_level TEXT DEFAULT 'Medium',       -- Easy, Medium, Hard
  estimated_workload_hours INTEGER DEFAULT 9,   -- Hours/week (includes class + study time)

  -- Success metrics
  historical_pass_rate REAL DEFAULT 75.0,       -- Percentage of students who pass (C or better)
  average_grade REAL DEFAULT 2.8,               -- Historical average grade (GPA scale)

  -- Availability
  is_active BOOLEAN DEFAULT 1,                  -- Course is currently offered
  seats_available INTEGER GENERATED ALWAYS AS (max_enrollment - current_enrollment) STORED,

  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK (credit_hours > 0 AND credit_hours <= 6),
  CHECK (level >= 1 AND level <= 5),
  CHECK (max_enrollment > 0),
  CHECK (current_enrollment >= 0),
  CHECK (current_enrollment <= max_enrollment),
  CHECK (historical_pass_rate >= 0 AND historical_pass_rate <= 100),
  CHECK (average_grade >= 0.0 AND average_grade <= 4.0)
);

-- ============================================
-- INDEXES for performance
-- ============================================

-- Find courses by code (primary lookup)
CREATE INDEX idx_course_catalog_code ON course_catalog(course_code);

-- Find courses by level (student progression)
CREATE INDEX idx_course_catalog_level ON course_catalog(level);

-- Find courses by department
CREATE INDEX idx_course_catalog_dept ON course_catalog(department);

-- Find active courses with available seats
CREATE INDEX idx_course_catalog_active ON course_catalog(is_active, seats_available);

-- Find courses by type (required vs elective)
CREATE INDEX idx_course_catalog_type ON course_catalog(course_type);

-- Find courses by difficulty
CREATE INDEX idx_course_catalog_difficulty ON course_catalog(difficulty_level);

-- Composite index for course recommendations
CREATE INDEX idx_course_catalog_level_dept ON course_catalog(level, department, is_active);

-- ============================================
-- SAMPLE DATA (for validation)
-- ============================================

-- Computer Science courses
INSERT INTO course_catalog (course_code, course_name, description, credit_hours, level, department, course_type, instructor_name, semester_offered, max_enrollment, difficulty_level, estimated_workload_hours, historical_pass_rate, average_grade)
VALUES
  ('CS101', 'Introduction to Programming', 'Fundamentals of programming using Python', 3, 1, 'CS', 'required', 'Dr. Ahmed Al-Hassan', 'Both', 40, 'Medium', 10, 82.5, 3.1),
  ('CS201', 'Data Structures', 'Study of fundamental data structures and algorithms', 3, 2, 'CS', 'required', 'Dr. Fatima Khalil', 'Both', 35, 'Hard', 12, 70.0, 2.7),
  ('CS301', 'Database Systems', 'Design and implementation of database systems', 3, 3, 'CS', 'required', 'Dr. Omar Rashid', 'Fall', 30, 'Hard', 11, 75.0, 2.9),
  ('CS401', 'Software Engineering', 'Principles of software development and project management', 3, 4, 'CS', 'required', 'Dr. Layla Hassan', 'Spring', 25, 'Medium', 10, 85.0, 3.3);

-- Mathematics courses
INSERT INTO course_catalog (course_code, course_name, description, credit_hours, level, department, course_type, instructor_name, semester_offered, max_enrollment, difficulty_level, estimated_workload_hours, historical_pass_rate, average_grade)
VALUES
  ('MATH101', 'Calculus I', 'Differential and integral calculus', 4, 1, 'MATH', 'required', 'Dr. Youssef Ibrahim', 'Both', 45, 'Hard', 12, 68.0, 2.5),
  ('MATH201', 'Calculus II', 'Advanced calculus and series', 4, 2, 'MATH', 'required', 'Dr. Nour Al-Din', 'Both', 40, 'Hard', 13, 65.0, 2.4),
  ('MATH301', 'Linear Algebra', 'Vector spaces, matrices, and linear transformations', 3, 3, 'MATH', 'required', 'Dr. Salma Zahra', 'Fall', 35, 'Medium', 10, 72.0, 2.8);

-- Engineering courses
INSERT INTO course_catalog (course_code, course_name, description, credit_hours, level, department, course_type, instructor_name, semester_offered, max_enrollment, difficulty_level, estimated_workload_hours, historical_pass_rate, average_grade)
VALUES
  ('ENG101', 'Engineering Mechanics', 'Statics and dynamics for engineers', 3, 1, 'ENG', 'required', 'Dr. Tariq Mansour', 'Both', 35, 'Medium', 11, 75.0, 2.9),
  ('ENG102', 'Engineering Physics', 'Physics principles for engineering applications', 3, 1, 'ENG', 'required', 'Dr. Maha Karim', 'Both', 35, 'Hard', 12, 70.0, 2.7),
  ('ENG301', 'Thermodynamics', 'Energy, heat, and work in engineering systems', 3, 3, 'ENG', 'required', 'Dr. Hassan Ali', 'Spring', 30, 'Hard', 11, 68.0, 2.6);

-- Business courses
INSERT INTO course_catalog (course_code, course_name, description, credit_hours, level, department, course_type, instructor_name, semester_offered, max_enrollment, difficulty_level, estimated_workload_hours, historical_pass_rate, average_grade)
VALUES
  ('BUS101', 'Introduction to Business', 'Fundamentals of business and management', 3, 1, 'BUS', 'required', 'Prof. Sara Nasser', 'Both', 50, 'Easy', 8, 88.0, 3.4),
  ('BUS201', 'Business Finance', 'Financial management and investment principles', 3, 2, 'BUS', 'required', 'Dr. Khaled Yousef', 'Both', 40, 'Medium', 10, 78.0, 3.0),
  ('BUS301', 'Marketing Management', 'Marketing strategies and consumer behavior', 3, 3, 'BUS', 'required', 'Dr. Amina Salem', 'Fall', 35, 'Medium', 9, 82.0, 3.2);

-- General Education electives
INSERT INTO course_catalog (course_code, course_name, description, credit_hours, level, department, course_type, instructor_name, semester_offered, max_enrollment, difficulty_level, estimated_workload_hours, historical_pass_rate, average_grade)
VALUES
  ('HIST101', 'World History', 'Survey of world civilizations', 3, 1, 'HIST', 'general_education', 'Dr. Jamila Faisal', 'Both', 60, 'Easy', 7, 90.0, 3.5),
  ('PHIL101', 'Introduction to Philosophy', 'Major philosophical concepts and thinkers', 3, 1, 'PHIL', 'general_education', 'Dr. Rashid Hamdan', 'Fall', 50, 'Medium', 8, 85.0, 3.3),
  ('ART101', 'Art Appreciation', 'Introduction to visual arts and art history', 3, 1, 'ART', 'elective', 'Prof. Layla Omar', 'Spring', 40, 'Easy', 6, 92.0, 3.6);

-- ============================================
-- VALIDATION QUERIES
-- ============================================

-- Count total courses
-- Expected: >= 15
SELECT COUNT(*) as total_courses FROM course_catalog;

-- Count courses by level
SELECT level, COUNT(*) as course_count
FROM course_catalog
GROUP BY level
ORDER BY level;

-- Count courses by department
SELECT department, COUNT(*) as course_count
FROM course_catalog
GROUP BY department
ORDER BY course_count DESC;

-- Find courses with available seats
SELECT course_code, course_name, seats_available
FROM course_catalog
WHERE is_active = 1 AND seats_available > 0
ORDER BY seats_available DESC;

-- Check constraint violations
SELECT 'Invalid credit hours' as issue, course_code
FROM course_catalog
WHERE credit_hours <= 0 OR credit_hours > 6
UNION ALL
SELECT 'Invalid level', course_code
FROM course_catalog
WHERE level < 1 OR level > 5
UNION ALL
SELECT 'Invalid enrollment', course_code
FROM course_catalog
WHERE current_enrollment > max_enrollment;

-- ============================================
-- NOTES
-- ============================================

/*
Course Types:
- required: Mandatory for the major
- elective: Optional courses within major
- general_education: Required for all students (any major)

Difficulty Levels:
- Easy: Pass rate > 85%, Average grade > 3.2
- Medium: Pass rate 70-85%, Average grade 2.5-3.2
- Hard: Pass rate < 70%, Average grade < 2.5

Semester Offerings:
- Fall: Offered in fall semester only
- Spring: Offered in spring semester only
- Summer: Offered in summer session only
- Both: Offered in both fall and spring

Estimated Workload:
- Includes in-class time (typically 3 hours/week for 3-credit course)
- Plus estimated study/homework time (typically 6-9 hours/week)
- Total: 9-12 hours/week for a 3-credit course

Historical Metrics:
- pass_rate: % of students earning C or better
- average_grade: Mean GPA for the course (0.0-4.0 scale)
*/
