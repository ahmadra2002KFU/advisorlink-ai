-- Migration: student_attendance_history
-- Purpose: Track monthly attendance percentages for trend analysis
-- Created: 2025-11-11

CREATE TABLE IF NOT EXISTS student_attendance_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  month VARCHAR(7) NOT NULL, -- Format: "2024-11"
  attendance_percentage DECIMAL(5,2) NOT NULL,
  total_days INTEGER NOT NULL,
  days_present INTEGER NOT NULL,
  days_absent INTEGER NOT NULL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraints
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,

  -- Constraints
  CHECK (attendance_percentage >= 0.00 AND attendance_percentage <= 100.00),
  CHECK (total_days >= 0),
  CHECK (days_present >= 0),
  CHECK (days_absent >= 0),
  CHECK (days_present + days_absent = total_days),

  -- Unique constraint: one record per student per month
  UNIQUE(student_id, month)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_history_student
  ON student_attendance_history(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_history_month
  ON student_attendance_history(month);

CREATE INDEX IF NOT EXISTS idx_attendance_history_recorded
  ON student_attendance_history(recorded_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_attendance_history_student_month
  ON student_attendance_history(student_id, month);
