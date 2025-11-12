-- ============================================
-- PHASE 3 MIGRATION 6: student_course_recommendations
-- ============================================
-- Purpose: Store AI-generated course recommendations for students
-- Created: 2025-11-11
-- Sprint: 2 (Course Intelligence)

CREATE TABLE IF NOT EXISTS student_course_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Student & Course
  student_id INTEGER NOT NULL,                  -- Foreign key to students table
  course_code TEXT NOT NULL,                    -- Course being recommended

  -- Recommendation details
  recommendation_score REAL NOT NULL,           -- Score 0-100 (higher = better match)
  recommendation_reason TEXT NOT NULL,          -- Why this course is recommended
  difficulty_match TEXT,                        -- Easy, Good, Challenging

  -- Prerequisites status
  prerequisites_met BOOLEAN DEFAULT 0,          -- All prerequisites completed
  missing_prerequisites TEXT,                   -- List of missing prerequisites (if any)

  -- Timing
  recommended_semester TEXT,                    -- Fall, Spring, Summer (when to take it)
  priority_level TEXT DEFAULT 'Medium',         -- High, Medium, Low

  -- Graduation impact
  required_for_graduation BOOLEAN DEFAULT 0,    -- Is this required for graduation?
  credits_toward_major INTEGER DEFAULT 0,       -- How many credits count toward major

  -- Metadata
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,                          -- Recommendations expire after semester
  is_viewed BOOLEAN DEFAULT 0,                  -- Student has viewed this recommendation
  is_accepted BOOLEAN DEFAULT 0,                -- Student registered for the course

  -- Foreign keys
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,

  -- Constraints
  CHECK (recommendation_score >= 0 AND recommendation_score <= 100),
  CHECK (credits_toward_major >= 0)
);

-- ============================================
-- INDEXES for performance
-- ============================================

-- Find recommendations for a specific student (most common query)
CREATE INDEX idx_recommendations_student ON student_course_recommendations(student_id);

-- Find recommendations for a specific course
CREATE INDEX idx_recommendations_course ON student_course_recommendations(course_code);

-- Find high-priority recommendations
CREATE INDEX idx_recommendations_priority ON student_course_recommendations(priority_level, recommendation_score DESC);

-- Find unviewed recommendations
CREATE INDEX idx_recommendations_unviewed ON student_course_recommendations(student_id, is_viewed);

-- Find recommendations by score
CREATE INDEX idx_recommendations_score ON student_course_recommendations(student_id, recommendation_score DESC);

-- Composite index for active recommendations
CREATE INDEX idx_recommendations_active ON student_course_recommendations(student_id, expires_at, is_accepted);

-- ============================================
-- SAMPLE DATA (for validation)
-- ============================================

-- Sample recommendations for student ID 1
INSERT INTO student_course_recommendations (
  student_id,
  course_code,
  recommendation_score,
  recommendation_reason,
  difficulty_match,
  prerequisites_met,
  missing_prerequisites,
  recommended_semester,
  priority_level,
  required_for_graduation,
  credits_toward_major,
  expires_at
)
VALUES
  -- High priority: Required course with prerequisites met
  (
    1,
    'CS201',
    95.0,
    'Required for CS major. You have completed CS101 with grade B. Strong GPA (3.99) indicates you are ready for this course.',
    'Good',
    1,
    NULL,
    'Fall',
    'High',
    1,
    3,
    datetime('now', '+6 months')
  ),

  -- Medium priority: Elective with good match
  (
    1,
    'MATH201',
    82.0,
    'Recommended elective. Your strong performance in MATH101 (grade A) suggests this is a good fit. Prepares for advanced CS courses.',
    'Good',
    1,
    NULL,
    'Spring',
    'Medium',
    0,
    0,
    datetime('now', '+6 months')
  ),

  -- Low priority: Prerequisites not met
  (
    1,
    'CS301',
    65.0,
    'Advanced CS course. Consider taking after completing CS201 and MATH201.',
    'Challenging',
    0,
    'CS201, MATH201',
    'Fall',
    'Low',
    1,
    3,
    datetime('now', '+6 months')
  );

-- ============================================
-- VALIDATION QUERIES
-- ============================================

-- Count total recommendations
SELECT COUNT(*) as total_recommendations FROM student_course_recommendations;

-- Count recommendations by priority
SELECT priority_level, COUNT(*) as count
FROM student_course_recommendations
GROUP BY priority_level;

-- Find expired recommendations
SELECT COUNT(*) as expired_count
FROM student_course_recommendations
WHERE expires_at < datetime('now');

-- Find unviewed high-priority recommendations
SELECT student_id, course_code, recommendation_score
FROM student_course_recommendations
WHERE priority_level = 'High' AND is_viewed = 0
ORDER BY recommendation_score DESC;

-- Check for invalid scores
SELECT 'Invalid score' as issue, id, recommendation_score
FROM student_course_recommendations
WHERE recommendation_score < 0 OR recommendation_score > 100;

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for active recommendations
CREATE VIEW IF NOT EXISTS v_active_recommendations AS
SELECT
  scr.id,
  scr.student_id,
  s.student_id as student_number,
  u.full_name as student_name,
  scr.course_code,
  cc.course_name,
  cc.credit_hours,
  scr.recommendation_score,
  scr.recommendation_reason,
  scr.difficulty_match,
  scr.prerequisites_met,
  scr.missing_prerequisites,
  scr.recommended_semester,
  scr.priority_level,
  scr.required_for_graduation,
  scr.is_viewed,
  scr.is_accepted,
  scr.generated_at,
  scr.expires_at
FROM student_course_recommendations scr
JOIN students s ON scr.student_id = s.id
JOIN users u ON s.user_id = u.id
LEFT JOIN course_catalog cc ON scr.course_code = cc.course_code
WHERE scr.expires_at > datetime('now')
  AND scr.is_accepted = 0;

-- ============================================
-- NOTES
-- ============================================

/*
Recommendation Scoring Algorithm:
- Graduation requirements: 40%
- GPA in related courses: 30%
- Course difficulty vs student capability: 20%
- Seat availability: 10%

Priority Levels:
- High: Required courses with prerequisites met
- Medium: Recommended electives, or required courses for next year
- Low: Exploratory courses or prerequisites not yet met

Difficulty Match:
- Easy: Student GPA significantly higher than course average
- Good: Student GPA similar to course average
- Challenging: Course difficulty higher than student's typical performance

Expiration:
- Recommendations expire at end of registration period
- Typically 6 months from generation (covers one full semester)
- System can auto-generate new recommendations each semester

Usage:
1. AI generates recommendations using getCourseRecommendations()
2. Recommendations stored in this table
3. Student views recommendations in dashboard
4. When student registers, is_accepted = 1
5. Expired recommendations cleaned up by background job
*/
