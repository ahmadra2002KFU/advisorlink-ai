-- Migration: advisor_alerts
-- Purpose: Store automated and manual alerts for advisors about student issues
-- Created: 2025-11-11

CREATE TABLE IF NOT EXISTS advisor_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  advisor_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  alert_type VARCHAR(50) NOT NULL, -- 'gpa_drop', 'low_attendance', 'no_contact', 'declining_trend', 'at_risk'
  severity VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0, -- 0 = unread, 1 = read
  is_dismissed INTEGER DEFAULT 0, -- 0 = active, 1 = dismissed
  dismissed_at DATETIME NULL,
  dismissed_reason TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraints
  FOREIGN KEY (advisor_id) REFERENCES advisors(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,

  -- Constraints
  CHECK (severity IN ('high', 'medium', 'low')),
  CHECK (alert_type IN ('gpa_drop', 'low_attendance', 'no_contact', 'declining_trend', 'at_risk', 'academic_probation', 'honor_student', 'custom')),
  CHECK (is_read IN (0, 1)),
  CHECK (is_dismissed IN (0, 1))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_advisor
  ON advisor_alerts(advisor_id);

CREATE INDEX IF NOT EXISTS idx_alerts_student
  ON advisor_alerts(student_id);

CREATE INDEX IF NOT EXISTS idx_alerts_type
  ON advisor_alerts(alert_type);

CREATE INDEX IF NOT EXISTS idx_alerts_severity
  ON advisor_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_alerts_unread
  ON advisor_alerts(advisor_id, is_read, is_dismissed);

CREATE INDEX IF NOT EXISTS idx_alerts_created
  ON advisor_alerts(created_at DESC);

-- Composite index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_alerts_advisor_active
  ON advisor_alerts(advisor_id, is_dismissed, severity, created_at DESC);
