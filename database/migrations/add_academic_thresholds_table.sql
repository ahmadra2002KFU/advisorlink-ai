-- Migration: Add academic_thresholds table
-- Phase 2.1: Academic Thresholds System
-- Created: 2025-11-09
-- Description: Creates a table to store GPA thresholds for various academic honors and statuses

-- Create academic_thresholds table
CREATE TABLE IF NOT EXISTS academic_thresholds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  honor_type TEXT NOT NULL UNIQUE CHECK(honor_type IN (
    'highest_honors',
    'high_honors',
    'honors',
    'dean_list',
    'academic_probation'
  )),
  min_gpa REAL NOT NULL CHECK(min_gpa >= 0.0 AND min_gpa <= 4.0),
  max_gpa REAL CHECK(max_gpa >= 0.0 AND max_gpa <= 4.0),
  description TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_academic_thresholds_timestamp
AFTER UPDATE ON academic_thresholds
BEGIN
  UPDATE academic_thresholds SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Create index on honor_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_academic_thresholds_honor_type ON academic_thresholds(honor_type);

-- Create index on GPA ranges for efficient queries
CREATE INDEX IF NOT EXISTS idx_academic_thresholds_gpa ON academic_thresholds(min_gpa, max_gpa);
