-- Seed data for facilities table
-- Date: 2025-11-07
-- Purpose: Populate facilities table with comprehensive sample data for university campus

-- ========================================
-- COMPUTER LABS (5)
-- ========================================

INSERT INTO facilities (name, type, building, room_number, floor, capacity, services, hours, contact_email, phone, description) VALUES
(
    'Main Computer Lab',
    'lab',
    'Computer Lab Center',
    'CL101',
    1,
    50,
    '["High-speed internet", "Windows & Linux systems", "Programming software", "Printing services", "Technical support"]',
    'Sunday-Thursday: 8:00 AM - 10:00 PM, Saturday: 9:00 AM - 5:00 PM',
    'mainlab@mentorlink.edu',
    '+966-11-234-5601',
    'The main computer lab features 50 workstations with dual-boot Windows and Linux systems. Equipped with the latest programming tools, IDEs, and development software. Technical support available during all operating hours.'
),
(
    'Advanced Programming Lab',
    'lab',
    'Computer Lab Center',
    'CL201',
    2,
    30,
    '["High-performance workstations", "GPU computing", "Machine learning tools", "Cloud computing access", "Development servers"]',
    'Sunday-Thursday: 9:00 AM - 8:00 PM',
    'advlab@mentorlink.edu',
    '+966-11-234-5602',
    'Specialized lab for advanced computer science courses featuring high-performance workstations with GPU acceleration for machine learning and AI development. Includes access to cloud computing platforms and dedicated development servers.'
),
(
    'Web Development Lab',
    'lab',
    'Computer Lab Center',
    'CL202',
    2,
    25,
    '["Mac & PC workstations", "Design software", "Web development tools", "Testing devices", "Color-calibrated monitors"]',
    'Sunday-Thursday: 9:00 AM - 7:00 PM',
    'weblab@mentorlink.edu',
    '+966-11-234-5603',
    'Dedicated lab for web and mobile development with both Mac and PC systems. Features design software including Adobe Creative Suite, modern web development tools, and various devices for cross-platform testing.'
),
(
    'Engineering CAD Lab',
    'lab',
    'Engineering Hall',
    'E201',
    2,
    35,
    '["CAD software", "3D modeling tools", "Simulation software", "Large displays", "Plotting services"]',
    'Sunday-Thursday: 8:00 AM - 9:00 PM',
    'cadlab@mentorlink.edu',
    '+966-11-234-5604',
    'Professional-grade computer lab for engineering students with powerful workstations running AutoCAD, SolidWorks, MATLAB, and other engineering software. Large displays and plotting services available.'
),
(
    'Data Science Lab',
    'lab',
    'Science Building',
    'S301',
    3,
    28,
    '["Statistical software", "Big data tools", "Database systems", "Data visualization", "Research datasets"]',
    'Sunday-Thursday: 9:00 AM - 8:00 PM',
    'datalab@mentorlink.edu',
    '+966-11-234-5605',
    'Specialized lab for data science and statistics courses featuring R, Python, SPSS, SAS, and other statistical software. Access to research datasets and big data analysis tools.'
);

-- ========================================
-- LIBRARIES (3)
-- ========================================

INSERT INTO facilities (name, type, building, room_number, floor, capacity, services, hours, contact_email, phone, description) VALUES
(
    'Main University Library',
    'library',
    'Arts & Humanities',
    'AH101',
    1,
    200,
    '["Book lending", "Study areas", "Computer stations", "Printing services", "Research assistance", "Group study rooms", "Silent reading areas"]',
    'Sunday-Thursday: 7:00 AM - 11:00 PM, Friday: 9:00 AM - 8:00 PM, Saturday: 8:00 AM - 10:00 PM',
    'library@mentorlink.edu',
    '+966-11-234-5610',
    'The main university library houses over 100,000 books and journals covering all academic disciplines. Features quiet study areas, group study rooms, computer stations, and professional research assistance. Free WiFi throughout the facility.'
),
(
    'Science & Engineering Library',
    'library',
    'Science Building',
    'S201',
    2,
    80,
    '["Technical journals", "Research databases", "Study carrels", "Computer access", "Scientific calculators lending", "Reference assistance"]',
    'Sunday-Thursday: 8:00 AM - 10:00 PM, Saturday: 9:00 AM - 6:00 PM',
    'sciencelibrary@mentorlink.edu',
    '+966-11-234-5611',
    'Specialized library focusing on science, technology, engineering, and mathematics. Extensive collection of technical journals, research papers, and digital databases. Individual study carrels available for focused work.'
),
(
    'Digital Resource Center',
    'library',
    'Computer Lab Center',
    'CL103',
    1,
    40,
    '["E-books", "Online journals", "Digital archives", "Multimedia resources", "Research tools", "Printing & scanning"]',
    'Sunday-Thursday: 8:00 AM - 9:00 PM, Saturday: 10:00 AM - 5:00 PM',
    'digital@mentorlink.edu',
    '+966-11-234-5612',
    'Modern digital library providing access to thousands of e-books, online journals, and multimedia resources. Features computer stations for research, printing and scanning services, and access to academic databases and digital archives.'
);

-- ========================================
-- DEPARTMENT OFFICES (8)
-- ========================================

INSERT INTO facilities (name, type, building, room_number, floor, capacity, services, hours, contact_email, phone, description) VALUES
(
    'Computer Science Department',
    'office',
    'Computer Lab Center',
    'CL301',
    3,
    NULL,
    '["Academic advising", "Faculty consultations", "Course registration", "Project approvals", "Internship coordination"]',
    'Sunday-Thursday: 8:00 AM - 4:00 PM',
    'cs.dept@mentorlink.edu',
    '+966-11-234-5620',
    'Computer Science Department office providing academic support, advising, and administrative services for CS students. Faculty members available during posted office hours for consultations.'
),
(
    'Mathematics Department',
    'office',
    'Science Building',
    'S302',
    3,
    NULL,
    '["Academic advising", "Tutoring coordination", "Course planning", "Graduate program info"]',
    'Sunday-Thursday: 8:00 AM - 4:00 PM',
    'math.dept@mentorlink.edu',
    '+966-11-234-5621',
    'Mathematics Department office offering academic guidance, tutoring services coordination, and support for undergraduate and graduate mathematics programs.'
),
(
    'Engineering Department',
    'office',
    'Engineering Hall',
    'E301',
    3,
    NULL,
    '["Academic advising", "Senior projects", "Lab reservations", "Industry partnerships", "Accreditation services"]',
    'Sunday-Thursday: 8:00 AM - 4:00 PM',
    'eng.dept@mentorlink.edu',
    '+966-11-234-5622',
    'Engineering Department office providing support for all engineering programs including project approvals, lab reservations, and industry partnership coordination.'
),
(
    'Business Administration Department',
    'office',
    'Business Complex',
    'B301',
    3,
    NULL,
    '["Academic advising", "Career services", "Internship placement", "Alumni networking"]',
    'Sunday-Thursday: 8:00 AM - 4:00 PM',
    'business.dept@mentorlink.edu',
    '+966-11-234-5623',
    'Business Administration Department office connecting students with career opportunities, internships, and academic guidance for business programs.'
),
(
    'Sciences Department',
    'office',
    'Science Building',
    'S101',
    1,
    NULL,
    '["Academic advising", "Lab safety training", "Research opportunities", "Equipment loans"]',
    'Sunday-Thursday: 8:00 AM - 4:00 PM',
    'sciences.dept@mentorlink.edu',
    '+966-11-234-5624',
    'Sciences Department office supporting students in physics, chemistry, and biology programs. Coordinates lab access, research opportunities, and safety training.'
),
(
    'English Department',
    'office',
    'Arts & Humanities',
    'AH201',
    2,
    NULL,
    '["Academic advising", "Writing center", "Language support", "Study abroad programs"]',
    'Sunday-Thursday: 8:00 AM - 4:00 PM',
    'english.dept@mentorlink.edu',
    '+966-11-234-5625',
    'English Department office providing language support, writing assistance, and coordination of international study programs.'
),
(
    'History Department',
    'office',
    'Arts & Humanities',
    'AH202',
    2,
    NULL,
    '["Academic advising", "Research guidance", "Archives access", "Graduate programs"]',
    'Sunday-Thursday: 8:00 AM - 4:00 PM',
    'history.dept@mentorlink.edu',
    '+966-11-234-5626',
    'History Department office providing academic support and facilitating access to historical archives and research resources.'
),
(
    'Psychology Department',
    'office',
    'Arts & Humanities',
    'AH203',
    2,
    NULL,
    '["Academic advising", "Research participation", "Clinical training", "Counseling referrals"]',
    'Sunday-Thursday: 8:00 AM - 4:00 PM',
    'psych.dept@mentorlink.edu',
    '+966-11-234-5627',
    'Psychology Department office coordinating research projects, clinical training opportunities, and academic guidance for psychology students.'
);

-- ========================================
-- STUDENT SERVICES (4)
-- ========================================

INSERT INTO facilities (name, type, building, room_number, floor, capacity, services, hours, contact_email, phone, description) VALUES
(
    'Registrar Office',
    'student_services',
    'Business Complex',
    'B101',
    1,
    NULL,
    '["Enrollment services", "Transcript requests", "Grade inquiries", "Schedule changes", "Academic records", "Graduation applications"]',
    'Sunday-Thursday: 8:00 AM - 4:00 PM',
    'registrar@mentorlink.edu',
    '+966-11-234-5630',
    'The Registrar Office handles all matters related to enrollment, academic records, transcripts, graduation applications, and schedule modifications. Services available in-person and online.'
),
(
    'Financial Aid Office',
    'student_services',
    'Business Complex',
    'B102',
    1,
    NULL,
    '["Scholarship applications", "Student loans", "Payment plans", "Financial counseling", "Grant programs", "Work-study"]',
    'Sunday-Thursday: 8:00 AM - 4:00 PM',
    'financialaid@mentorlink.edu',
    '+966-11-234-5631',
    'Financial Aid Office provides support for scholarships, grants, student loans, and payment plans. Financial counselors available to help students navigate funding options.'
),
(
    'Career Services Center',
    'student_services',
    'Business Complex',
    'B201',
    2,
    NULL,
    '["Career counseling", "Resume review", "Job search assistance", "Interview preparation", "Employer connections", "Career fairs"]',
    'Sunday-Thursday: 9:00 AM - 5:00 PM',
    'careers@mentorlink.edu',
    '+966-11-234-5632',
    'Career Services Center helps students with career planning, job search strategies, resume writing, interview skills, and connecting with potential employers. Regular career fairs and workshops.'
),
(
    'Student Counseling Center',
    'student_services',
    'Arts & Humanities',
    'AH301',
    3,
    NULL,
    '["Mental health support", "Academic stress counseling", "Personal counseling", "Crisis intervention", "Group therapy", "Workshops"]',
    'Sunday-Thursday: 8:00 AM - 6:00 PM, 24/7 crisis hotline',
    'counseling@mentorlink.edu',
    '+966-11-234-5633',
    'Confidential counseling services for students dealing with stress, anxiety, depression, or personal issues. Professional counselors available for individual and group sessions. 24/7 crisis support hotline available.'
);

-- ========================================
-- OTHER FACILITIES (5)
-- ========================================

INSERT INTO facilities (name, type, building, room_number, floor, capacity, services, hours, contact_email, phone, description) VALUES
(
    'University Cafeteria',
    'dining',
    'Student Center',
    'SC101',
    1,
    300,
    '["Hot meals", "Salad bar", "Beverages", "Snacks", "Halal food", "Vegetarian options", "Meal plans"]',
    'Sunday-Thursday: 7:00 AM - 8:00 PM, Friday: 12:00 PM - 6:00 PM',
    'cafeteria@mentorlink.edu',
    '+966-11-234-5640',
    'Main campus cafeteria offering a variety of hot meals, salads, beverages, and snacks. All food is halal-certified with vegetarian and vegan options available. Meal plans accepted.'
),
(
    'Fitness Center',
    'recreation',
    'Sports Complex',
    'SP101',
    1,
    80,
    '["Cardio equipment", "Weight training", "Fitness classes", "Personal training", "Locker rooms", "Showers"]',
    'Sunday-Thursday: 6:00 AM - 10:00 PM, Friday-Saturday: 8:00 AM - 8:00 PM',
    'fitness@mentorlink.edu',
    '+966-11-234-5641',
    'Modern fitness center with cardio equipment, weight training facilities, and group fitness classes. Professional trainers available for consultations. Separate sections for male and female students.'
),
(
    'Prayer Room - Men',
    'worship',
    'Student Center',
    'SC201',
    2,
    100,
    '["Prayer space", "Ablution facilities", "Prayer mats", "Quran copies", "Prayer time notifications"]',
    'Open 24/7',
    'facilities@mentorlink.edu',
    '+966-11-234-5642',
    'Dedicated prayer space for male students with ablution facilities and prayer mats provided. Clean and quiet environment maintained throughout the day.'
),
(
    'Prayer Room - Women',
    'worship',
    'Student Center',
    'SC202',
    2,
    100,
    '["Prayer space", "Ablution facilities", "Prayer mats", "Quran copies", "Prayer time notifications"]',
    'Open 24/7',
    'facilities@mentorlink.edu',
    '+966-11-234-5643',
    'Dedicated prayer space for female students with ablution facilities and prayer mats provided. Clean and quiet environment maintained throughout the day.'
),
(
    'Student Lounge',
    'common_area',
    'Student Center',
    'SC301',
    3,
    150,
    '["Comfortable seating", "WiFi", "TV screens", "Gaming area", "Vending machines", "Study tables", "Social space"]',
    'Sunday-Thursday: 7:00 AM - 11:00 PM, Friday-Saturday: 9:00 AM - 11:00 PM',
    'studentlife@mentorlink.edu',
    '+966-11-234-5644',
    'Casual student lounge for relaxation and socializing between classes. Features comfortable seating, entertainment options, study areas, and vending machines. Free WiFi available.'
);

-- Verification query
SELECT 'Facilities seed data inserted successfully' AS status;
SELECT type, COUNT(*) as count FROM facilities GROUP BY type ORDER BY type;
