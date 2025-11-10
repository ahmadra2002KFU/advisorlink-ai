-- Migration: Add comprehensive course details to student_courses table
-- Date: 2025-11-07
-- Purpose: Enhance course records with instructor, schedule, location, and academic details

-- Add instructor information
ALTER TABLE student_courses ADD COLUMN instructor_name TEXT;
ALTER TABLE student_courses ADD COLUMN instructor_email TEXT;

-- Add schedule information
ALTER TABLE student_courses ADD COLUMN class_time TEXT; -- Format: "09:00 AM - 10:30 AM"
ALTER TABLE student_courses ADD COLUMN class_days TEXT; -- Format: "MWF" or "TR"

-- Add location information
ALTER TABLE student_courses ADD COLUMN room_number TEXT; -- Format: "201" or "A-305"
ALTER TABLE student_courses ADD COLUMN building TEXT; -- Building name

-- Add academic details
ALTER TABLE student_courses ADD COLUMN credit_hours INTEGER DEFAULT 3;
ALTER TABLE student_courses ADD COLUMN current_grade TEXT; -- Format: "A", "B+", "C", etc.
ALTER TABLE student_courses ADD COLUMN semester TEXT; -- Format: "Fall 2024", "Spring 2025"

-- Add course metadata
ALTER TABLE student_courses ADD COLUMN department TEXT; -- "CS", "MATH", "ENG", etc.
ALTER TABLE student_courses ADD COLUMN course_description TEXT;
ALTER TABLE student_courses ADD COLUMN prerequisites TEXT; -- Comma-separated list of prerequisite courses
