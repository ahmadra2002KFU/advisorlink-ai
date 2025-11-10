-- Seed Data: Academic Thresholds
-- Phase 2.1: Academic Thresholds System
-- Created: 2025-11-09
-- Description: Populates academic_thresholds table with standard honor classifications

-- Insert academic threshold records
INSERT OR IGNORE INTO academic_thresholds (honor_type, min_gpa, max_gpa, description) VALUES
(
  'highest_honors',
  3.90,
  4.00,
  'Summa Cum Laude - The highest academic distinction awarded to students who have demonstrated exceptional academic excellence throughout their studies. Students achieving this honor have maintained a GPA of 3.90 or above and are recognized at graduation ceremonies.'
),
(
  'high_honors',
  3.75,
  3.89,
  'Magna Cum Laude - A high academic distinction awarded to students who have shown outstanding academic performance. Students achieving this honor have maintained a GPA between 3.75 and 3.89 and are recognized at graduation ceremonies.'
),
(
  'honors',
  3.50,
  3.74,
  'Cum Laude - An academic distinction awarded to students who have demonstrated strong academic performance. Students achieving this honor have maintained a GPA between 3.50 and 3.74 and are recognized at graduation ceremonies.'
),
(
  'dean_list',
  3.25,
  4.00,
  'Dean''s List - A semester-based recognition for students who have achieved academic excellence during a specific term. Students must maintain a GPA of 3.25 or higher during the semester while enrolled in at least 12 credit hours. This recognition appears on the student''s transcript for that semester.'
),
(
  'academic_probation',
  0.00,
  1.99,
  'Academic Probation - A warning status indicating that a student''s academic performance has fallen below the minimum acceptable standard. Students with a GPA below 2.0 are placed on academic probation and must improve their performance within one semester or face academic suspension. Students on probation may be limited to 12 credit hours per semester and are required to meet regularly with their academic advisor.'
);

-- Verification query
SELECT 'Academic thresholds seeded successfully' AS status;
SELECT COUNT(*) AS total_thresholds FROM academic_thresholds;
