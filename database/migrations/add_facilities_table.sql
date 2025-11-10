-- Migration: Create facilities table for campus facilities
-- Date: 2025-11-07
-- Purpose: Store comprehensive information about campus facilities including labs, libraries, offices, and services

-- Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('lab', 'library', 'office', 'classroom', 'student_services', 'recreation', 'dining', 'worship', 'common_area')),
    building TEXT NOT NULL,
    room_number TEXT,
    floor INTEGER,
    capacity INTEGER,
    services TEXT,
    hours TEXT,
    contact_email TEXT,
    phone TEXT,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities(type);
CREATE INDEX IF NOT EXISTS idx_facilities_building ON facilities(building);
CREATE INDEX IF NOT EXISTS idx_facilities_name ON facilities(name);

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_facilities_timestamp
AFTER UPDATE ON facilities
BEGIN
  UPDATE facilities SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Verification query
SELECT 'Facilities table created successfully' AS status;
