-- MentorLink MySQL Database Schema
-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS mentorlink;
CREATE DATABASE mentorlink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mentorlink;

-- 1. Users table (all users: students, advisors, admins)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'advisor', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);

-- 2. Levels table (academic levels 1-5)
CREATE TABLE levels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level_number INT UNIQUE NOT NULL,
    level_name VARCHAR(100) NOT NULL
);

-- 3. Sections table (class sections A, B, C)
CREATE TABLE sections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level_id INT NOT NULL,
    section_name VARCHAR(10) NOT NULL,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_level_section (level_id, section_name),
    INDEX idx_level (level_id)
);

-- 4. Students table (student-specific data)
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    birthdate DATE NOT NULL,
    level_id INT NOT NULL,
    section_id INT NOT NULL,
    gpa DECIMAL(3,2) CHECK (gpa >= 0.00 AND gpa <= 4.00),
    attendance_percentage DECIMAL(5,2) CHECK (attendance_percentage >= 0.00 AND attendance_percentage <= 100.00),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES levels(id),
    FOREIGN KEY (section_id) REFERENCES sections(id),
    INDEX idx_user (user_id),
    INDEX idx_student_id (student_id),
    INDEX idx_level (level_id),
    INDEX idx_section (section_id)
);

-- 5. Student courses table (enrolled courses)
CREATE TABLE student_courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student (student_id)
);

-- 6. Advisors table (advisor-specific data)
CREATE TABLE advisors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    level_id INT NOT NULL,
    specialization VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES levels(id),
    INDEX idx_user (user_id),
    INDEX idx_level (level_id),
    INDEX idx_available (is_available)
);

-- 7. Advisor assignments (student-advisor mapping)
CREATE TABLE advisor_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT UNIQUE NOT NULL,
    advisor_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (advisor_id) REFERENCES advisors(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_advisor (advisor_id)
);

-- 8. Conversations table (chat conversations)
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    advisor_id INT NOT NULL,
    status ENUM('active', 'resolved', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (advisor_id) REFERENCES advisors(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_advisor (advisor_id),
    INDEX idx_status (status),
    INDEX idx_updated (updated_at)
);

-- 9. Messages table (chat messages)
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created (created_at)
);

-- 10. FAQs table (frequently asked questions for AI)
CREATE TABLE faqs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);

-- 11. AI Chat History table (student AI conversations)
CREATE TABLE ai_chat_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_created (created_at)
);

-- Insert initial levels
INSERT INTO levels (level_number, level_name) VALUES
(1, 'Level 1'),
(2, 'Level 2'),
(3, 'Level 3'),
(4, 'Level 4'),
(5, 'Level 5');

-- Insert sections (A, B, C for each level)
INSERT INTO sections (level_id, section_name)
SELECT l.id, s.section_name
FROM levels l
CROSS JOIN (
    SELECT 'A' AS section_name
    UNION SELECT 'B'
    UNION SELECT 'C'
) s;

-- Insert comprehensive FAQs
INSERT INTO faqs (question, answer, category) VALUES
-- Registration
('How do I register for courses?', 'Course registration opens at the beginning of each semester. Log into the student portal, navigate to "Course Registration," select your desired courses from the available list, and click "Register." Make sure you meet all prerequisites and don\'t exceed the credit hour limit for your level.', 'Registration'),
('What is the maximum number of credit hours I can take per semester?', 'Students can register for a maximum of 18 credit hours per semester. If you wish to exceed this limit, you need written approval from your academic advisor and the Dean\'s office.', 'Registration'),
('When is the add/drop deadline?', 'Students can add courses during the first week of the semester and drop courses without penalty during the first two weeks. After that, dropping a course results in a "W" (Withdrawal) on your transcript.', 'Registration'),

-- Graduation
('What are the graduation requirements for my level?', 'Graduation requirements vary by level and program. Generally, you need to complete all required courses for your major, maintain a minimum GPA of 2.0, complete at least 120 credit hours (varies by program), and pass the comprehensive exam in your final year.', 'Graduation'),
('How many credit hours do I need to graduate?', 'Most bachelor\'s degree programs require 120-130 credit hours, depending on your major. Check with your academic advisor for your specific program requirements.', 'Graduation'),
('Can I graduate early?', 'Yes, if you complete all graduation requirements ahead of schedule. You\'ll need approval from your academic advisor and must submit an early graduation petition at least one semester before your intended graduation date.', 'Graduation'),

-- GPA
('How is my GPA calculated?', 'Your GPA is calculated by dividing the total number of grade points earned by the total number of credit hours attempted. Grade points are calculated by multiplying the credit hours for each course by the grade point value (A=4.0, B=3.0, C=2.0, D=1.0, F=0.0).', 'GPA'),
('What is academic probation?', 'Academic probation occurs when your cumulative GPA falls below 2.0. Students on probation have one semester to raise their GPA above 2.0 or face academic suspension. During probation, you may be limited to 12 credit hours per semester.', 'GPA'),
('What happens if I fail a course?', 'If you fail a required course, you must retake it. The new grade will replace the old grade in your GPA calculation, but both attempts will appear on your transcript. Failed electives don\'t need to be retaken unless required for your degree.', 'GPA'),

-- Advisor
('How do I schedule a meeting with my academic advisor?', 'You can contact your advisor through the MentorLink platform or by email. Advisors typically hold office hours Monday-Thursday from 10 AM to 2 PM. You can also request a meeting at a different time if needed.', 'Advisor'),
('What does my academic advisor help me with?', 'Your academic advisor helps with course selection, graduation planning, academic concerns, career guidance, prerequisite clarification, and navigating university policies. They\'re your primary contact for all academic matters.', 'Advisor'),
('Can I change my academic advisor?', 'Advisor assignments are based on your level and section. If you have a specific concern, contact the Dean\'s office to discuss the possibility of reassignment.', 'Advisor'),

-- Transcripts
('How do I request an official transcript?', 'You can request official transcripts through the Registrar\'s Office. Submit a transcript request form (available online or in person) with a $10 processing fee. Transcripts are typically processed within 3-5 business days.', 'Transcripts'),
('Can I see my unofficial transcript?', 'Yes, you can view and download your unofficial transcript anytime through the student portal under "Academic Records."', 'Transcripts'),

-- Transfer
('Can I transfer credits from another institution?', 'Yes, you can transfer credits from accredited institutions. Submit official transcripts to the Registrar\'s Office for evaluation. Generally, courses with a grade of C or higher may transfer, but final decisions are made by the academic department.', 'Transfer'),
('How many transfer credits can I apply toward my degree?', 'You can transfer up to 60 credit hours toward a bachelor\'s degree. At least 50% of your degree requirements must be completed at this institution.', 'Transfer'),

-- Prerequisites
('What are prerequisites and why do they matter?', 'Prerequisites are courses you must complete before enrolling in advanced courses. They ensure you have the necessary foundation. You cannot register for a course without completing its prerequisites unless you receive a waiver from the instructor.', 'Prerequisites'),
('How do I find out the prerequisites for a course?', 'Prerequisites are listed in the course catalog and on the course registration page. You can also ask your academic advisor or check the department website.', 'Prerequisites'),

-- Exams
('When are final exams held?', 'Final exams are held during the last two weeks of each semester according to the published exam schedule. Check the academic calendar or student portal for specific dates and times.', 'Exams'),
('What should I do if I have a conflict with an exam schedule?', 'If you have three exams scheduled on the same day or other conflicts, contact your instructors immediately to arrange for a makeup exam. Requests must be made at least two weeks before the exam date.', 'Exams'),
('Can I get an extension on an assignment?', 'Extension policies vary by instructor. Contact your professor directly to discuss your situation. Extensions are typically granted only for documented emergencies or extenuating circumstances.', 'Exams'),

-- General
('What is the attendance policy?', 'Attendance policies vary by course and instructor. Generally, missing more than 25% of classes may result in automatic failure. Check your course syllabus for specific attendance requirements.', 'General'),
('Can I take courses pass/fail?', 'Yes, you can take up to 12 credit hours of elective courses on a pass/fail basis. Required courses for your major must be taken for a letter grade. Discuss this option with your advisor.', 'General'),
('Where can I get tutoring help?', 'The Academic Success Center offers free tutoring for most subjects Monday-Friday from 9 AM to 5 PM. You can also find peer tutors through the student portal or ask your instructor for recommendations.', 'General'),
('What should I do if I\'m struggling academically?', 'Contact your academic advisor immediately. They can connect you with tutoring services, counseling, time management workshops, and other resources. Don\'t wait until it\'s too late to seek help.', 'General');

-- Verification queries
SELECT 'Database created successfully' AS status;
SELECT COUNT(*) AS levels_count FROM levels;
SELECT COUNT(*) AS sections_count FROM sections;
SELECT COUNT(*) AS faqs_count FROM faqs;
