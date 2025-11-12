-- Migration: student_gpa_history
-- Purpose: Track student GPA over time for trend analysis
-- Created: 2025-11-11

CREATE TABLE IF NOT EXISTS student_gpa_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  semester VARCHAR(20) NOT NULL, -- e.g., "Fall 2024", "Spring 2025"
  gpa DECIMAL(3,2) NOT NULL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraints
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,

  -- Constraints
  CHECK (gpa >= 0.00 AND gpa <= 4.00),

  -- Unique constraint: one GPA per student per semester
  UNIQUE(student_id, semester)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gpa_history_student
  ON student_gpa_history(student_id);

CREATE INDEX IF NOT EXISTS idx_gpa_history_semester
  ON student_gpa_history(semester);

CREATE INDEX IF NOT EXISTS idx_gpa_history_recorded
  ON student_gpa_history(recorded_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_gpa_history_student_semester
  ON student_gpa_history(student_id, semester);
