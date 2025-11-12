-- ============================================
-- PHASE 3 MIGRATION 4: course_prerequisites
-- ============================================
-- Purpose: Define prerequisite relationships between courses
-- Created: 2025-11-11
-- Sprint: 2 (Course Intelligence)

CREATE TABLE IF NOT EXISTS course_prerequisites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Course relationship
  course_code TEXT NOT NULL,                    -- The course requiring prerequisites (e.g., 'CS201')
  prerequisite_code TEXT NOT NULL,              -- The prerequisite course (e.g., 'CS101')

  -- Requirement details
  minimum_grade TEXT DEFAULT 'D',               -- Minimum grade required (A, B, C, D, F)
  is_strict BOOLEAN DEFAULT 1,                  -- If 1, prerequisite is mandatory; if 0, recommended

  -- Alternative prerequisites
  prerequisite_group INTEGER DEFAULT 1,         -- Group number for OR logic (e.g., "CS101 OR CS102")

  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  UNIQUE(course_code, prerequisite_code)        -- Prevent duplicate prerequisite entries
);

-- ============================================
-- INDEXES for performance
-- ============================================

-- Find all prerequisites for a specific course (most common query)
CREATE INDEX idx_prerequisites_course ON course_prerequisites(course_code);

-- Find all courses that require a specific course as prerequisite
CREATE INDEX idx_prerequisites_prereq ON course_prerequisites(prerequisite_code);

-- Filter by strictness (mandatory vs recommended)
CREATE INDEX idx_prerequisites_strict ON course_prerequisites(is_strict);

-- Composite index for prerequisite groups
CREATE INDEX idx_prerequisites_course_group ON course_prerequisites(course_code, prerequisite_group);

-- ============================================
-- SAMPLE DATA (for validation)
-- ============================================

-- Computer Science prerequisite chain
INSERT INTO course_prerequisites (course_code, prerequisite_code, minimum_grade, is_strict, prerequisite_group)
VALUES
  -- CS courses
  ('CS201', 'CS101', 'C', 1, 1),
  ('CS301', 'CS201', 'C', 1, 1),
  ('CS401', 'CS301', 'C', 1, 1),
  ('CS301', 'MATH201', 'C', 1, 2),  -- CS301 also needs MATH201

  -- Math courses
  ('MATH201', 'MATH101', 'C', 1, 1),
  ('MATH301', 'MATH201', 'C', 1, 1),

  -- Engineering courses (with OR logic)
  ('ENG301', 'ENG101', 'C', 1, 1),
  ('ENG301', 'ENG102', 'C', 1, 1),  -- ENG301 needs (ENG101 OR ENG102)

  -- Business courses
  ('BUS201', 'BUS101', 'C', 1, 1),
  ('BUS301', 'BUS201', 'C', 1, 1);

-- ============================================
-- VALIDATION QUERIES
-- ============================================

-- Count total prerequisites
-- Expected: >= 10
SELECT COUNT(*) as total_prerequisites FROM course_prerequisites;

-- Check for duplicate prerequisites
-- Expected: 0
SELECT course_code, prerequisite_code, COUNT(*) as duplicate_count
FROM course_prerequisites
GROUP BY course_code, prerequisite_code
HAVING COUNT(*) > 1;

-- Find courses with multiple prerequisite groups (OR logic)
-- Expected: At least 1 (ENG301)
SELECT course_code, COUNT(DISTINCT prerequisite_group) as group_count
FROM course_prerequisites
GROUP BY course_code
HAVING COUNT(DISTINCT prerequisite_group) > 1;

-- ============================================
-- NOTES
-- ============================================

/*
Prerequisite Logic:
- Same prerequisite_group = OR relationship
  Example: ENG301 requires (ENG101 OR ENG102)

- Different prerequisite_group = AND relationship
  Example: CS301 requires (CS201) AND (MATH201)

- is_strict = 1: Mandatory prerequisite (student cannot register without it)
- is_strict = 0: Recommended prerequisite (system will warn but allow registration)

Minimum Grades:
- A = 4.0
- B = 3.0
- C = 2.0
- D = 1.0
- F = 0.0 (fail)

Common patterns:
- Linear chain: CS101 → CS201 → CS301 → CS401
- Branch: CS301 needs both CS201 AND MATH201
- Choice: ENG301 needs either ENG101 OR ENG102
*/
