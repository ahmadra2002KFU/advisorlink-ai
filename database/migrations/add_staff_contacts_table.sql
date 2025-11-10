-- Migration: Create staff_contacts table
-- Purpose: Store comprehensive staff contact information for students
-- Date: 2025-11-07

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS staff_contacts;

-- Create staff_contacts table
CREATE TABLE IF NOT EXISTS staff_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  office_location TEXT NOT NULL,
  office_hours TEXT NOT NULL,
  responsibilities TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN (
    'registration',
    'technical_support',
    'financial',
    'academic',
    'student_services',
    'career_services',
    'library',
    'international',
    'facilities'
  )),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster searching
CREATE INDEX IF NOT EXISTS idx_staff_contacts_category ON staff_contacts(category);
CREATE INDEX IF NOT EXISTS idx_staff_contacts_department ON staff_contacts(department);
CREATE INDEX IF NOT EXISTS idx_staff_contacts_role ON staff_contacts(role);

-- Insert comprehensive staff contact data
INSERT INTO staff_contacts (name, role, department, email, phone, office_location, office_hours, responsibilities, category) VALUES

-- REGISTRATION OFFICE (3 staff members)
(
  'Fatima Al-Rashid',
  'Registrar',
  'Registration Office',
  'fatima.rashid@mentorlink.edu',
  '+962-6-555-0101',
  'Administration Building, Room 102',
  'Sunday-Thursday 8:00 AM - 4:00 PM',
  'Oversees course registration, add/drop deadlines, course scheduling conflicts, enrollment verification, academic records, transcript requests, degree audits, graduation clearance. Contact for: course registration issues, add/drop after deadline, schedule conflicts, enrollment problems, transcript requests.',
  'registration'
),
(
  'Hassan Al-Mansoori',
  'Assistant Registrar',
  'Registration Office',
  'hassan.mansoori@mentorlink.edu',
  '+962-6-555-0102',
  'Administration Building, Room 103',
  'Sunday-Thursday 8:30 AM - 3:30 PM',
  'Handles course add/drop procedures, section changes, waitlist management, course prerequisites verification, enrollment status updates, course withdrawal processing. Contact for: adding courses late, dropping courses, section transfers, waitlist issues, prerequisite problems.',
  'registration'
),
(
  'Mariam Al-Khalifa',
  'Registration Coordinator',
  'Registration Office',
  'mariam.khalifa@mentorlink.edu',
  '+962-6-555-0103',
  'Administration Building, Room 104',
  'Sunday-Thursday 9:00 AM - 4:00 PM',
  'Assists with online registration system issues, registration holds, credit hour limits, course overload requests, registration appointments, registration errors and technical problems. Contact for: registration system errors, registration holds, overload permission, online registration issues.',
  'registration'
),

-- IT SUPPORT (3 staff members)
(
  'Omar Al-Sayed',
  'IT Support Manager',
  'Information Technology',
  'omar.sayed@mentorlink.edu',
  '+962-6-555-0201',
  'Computer Lab Center, Room 201',
  'Sunday-Thursday 8:00 AM - 5:00 PM',
  'Manages student account issues, password resets, email problems, MentorLink platform technical issues, system access problems, network connectivity, Wi-Fi issues, computer lab access. Contact for: account locked, forgot password, email not working, login problems, system access denied.',
  'technical_support'
),
(
  'Layla Mansour',
  'Technical Support Specialist',
  'Information Technology',
  'layla.mansour@mentorlink.edu',
  '+962-6-555-0202',
  'Computer Lab Center, Room 202',
  'Sunday-Thursday 9:00 AM - 6:00 PM',
  'Provides help with learning management system (LMS), online course access, software installation, computer lab equipment, printing services, student portal issues, mobile app problems. Contact for: LMS not working, cannot access online course, software problems, printing issues, portal errors.',
  'technical_support'
),
(
  'Youssef Karim',
  'Network Administrator',
  'Information Technology',
  'youssef.karim@mentorlink.edu',
  '+962-6-555-0203',
  'Computer Lab Center, Room 203',
  'Sunday-Thursday 8:00 AM - 4:00 PM',
  'Handles campus network issues, VPN access for off-campus students, network security, internet connectivity problems, bandwidth issues, network maintenance schedules. Contact for: Wi-Fi not connecting, internet slow, VPN not working, network connection drops.',
  'technical_support'
),

-- FINANCIAL AID (2 staff members)
(
  'Amina Hassan',
  'Financial Aid Director',
  'Financial Services',
  'amina.hassan@mentorlink.edu',
  '+962-6-555-0301',
  'Administration Building, Room 201',
  'Sunday-Thursday 8:00 AM - 3:00 PM',
  'Oversees scholarship applications, financial aid eligibility, grant programs, student loan applications, payment plans, tuition assistance, emergency financial aid. Contact for: scholarship applications, financial aid questions, payment problems, tuition assistance, emergency funds.',
  'financial'
),
(
  'Waleed Ibrahim',
  'Financial Aid Counselor',
  'Financial Services',
  'waleed.ibrahim@mentorlink.edu',
  '+962-6-555-0302',
  'Administration Building, Room 202',
  'Sunday-Thursday 9:00 AM - 4:00 PM',
  'Assists with payment deadlines, tuition billing questions, refund requests, payment plan setup, fee waivers, late payment penalties, financial documentation. Contact for: payment deadline extension, billing questions, refund issues, payment plan setup, fee waiver requests.',
  'financial'
),

-- ACADEMIC AFFAIRS (2 staff members)
(
  'Dina Al-Sabah',
  'Dean of Academic Affairs',
  'Academic Affairs',
  'dina.sabah@mentorlink.edu',
  '+962-6-555-0401',
  'Administration Building, Room 301',
  'Sunday-Thursday 10:00 AM - 2:00 PM (By appointment)',
  'Handles academic probation appeals, academic dismissal cases, grade appeals, academic integrity violations, special academic accommodations, transfer credit evaluations, academic policy exceptions. Contact for: academic probation, grade appeals, dismissal appeals, academic integrity issues, policy exceptions.',
  'academic'
),
(
  'Bassam Al-Nahyan',
  'Academic Coordinator',
  'Academic Affairs',
  'bassam.nahyan@mentorlink.edu',
  '+962-6-555-0402',
  'Administration Building, Room 302',
  'Sunday-Thursday 8:30 AM - 4:00 PM',
  'Assists with program changes, major/minor declarations, degree requirement questions, course substitutions, transfer credit processing, academic standing questions, graduation requirements. Contact for: changing major, declaring minor, transfer credits, degree requirements, course substitutions.',
  'academic'
),

-- STUDENT SERVICES (2 staff members)
(
  'Samira Yousef',
  'Student Services Director',
  'Student Services',
  'samira.yousef@mentorlink.edu',
  '+962-6-555-0501',
  'Student Center, Room 101',
  'Sunday-Thursday 8:00 AM - 4:00 PM',
  'Provides mental health counseling, personal counseling, stress management support, crisis intervention, student wellness programs, disability services, accommodation requests, student clubs and activities coordination. Contact for: counseling services, mental health support, disability accommodations, wellness programs, student activities.',
  'student_services'
),
(
  'Huda Salem',
  'Student Life Coordinator',
  'Student Services',
  'huda.salem@mentorlink.edu',
  '+962-6-555-0502',
  'Student Center, Room 102',
  'Sunday-Thursday 9:00 AM - 5:00 PM',
  'Manages student organizations, campus events, student ID cards, orientation programs, student leadership programs, peer mentoring, student complaints and grievances. Contact for: student clubs, campus events, student ID issues, orientation, student complaints.',
  'student_services'
),

-- CAREER SERVICES (2 staff members)
(
  'Fahad Nasser',
  'Career Services Director',
  'Career Development',
  'fahad.nasser@mentorlink.edu',
  '+962-6-555-0601',
  'Career Center, Room 101',
  'Sunday-Thursday 9:00 AM - 4:00 PM',
  'Provides career counseling, resume writing assistance, interview preparation, job search strategies, internship placement, employer networking events, career fairs, graduate school advising. Contact for: career advice, resume help, interview prep, internship opportunities, job search.',
  'career_services'
),
(
  'Salma Mahmoud',
  'Internship Coordinator',
  'Career Development',
  'salma.mahmoud@mentorlink.edu',
  '+962-6-555-0602',
  'Career Center, Room 102',
  'Sunday-Thursday 10:00 AM - 3:00 PM',
  'Coordinates internship programs, co-op opportunities, practicum placements, industry partnerships, employer relations, internship credit approval, work-study programs. Contact for: internship opportunities, co-op programs, practicum placement, work-study jobs.',
  'career_services'
),

-- LIBRARY SERVICES (2 staff members)
(
  'Leena Al-Rahman',
  'Head Librarian',
  'University Library',
  'leena.rahman@mentorlink.edu',
  '+962-6-555-0701',
  'Main Library, Information Desk',
  'Sunday-Thursday 8:00 AM - 8:00 PM',
  'Manages library resources, research assistance, database access, interlibrary loans, citation help, research workshops, special collections, library card issues, overdue books. Contact for: research help, finding sources, database access, citation questions, library resources.',
  'library'
),
(
  'Ali Al-Masri',
  'Digital Resources Librarian',
  'University Library',
  'ali.masri@mentorlink.edu',
  '+962-6-555-0702',
  'Main Library, Digital Resources Office',
  'Sunday-Thursday 9:00 AM - 5:00 PM',
  'Assists with online databases, e-books access, digital archives, research tools, reference management software, plagiarism detection tools, remote library access. Contact for: online database access, e-books not working, digital resources, research tools, remote access.',
  'library'
),

-- INTERNATIONAL STUDENT OFFICE (2 staff members)
(
  'Sana Al-Khalil',
  'International Student Advisor',
  'International Programs',
  'sana.khalil@mentorlink.edu',
  '+962-6-555-0801',
  'International Center, Room 101',
  'Sunday-Thursday 8:00 AM - 4:00 PM',
  'Handles visa and immigration issues, international student orientation, cultural adjustment support, immigration document verification, travel signatures, F-1/J-1 visa matters, work authorization. Contact for: visa problems, immigration questions, travel signatures, international student issues.',
  'international'
),
(
  'Ibrahim Al-Nasser',
  'Study Abroad Coordinator',
  'International Programs',
  'ibrahim.nasser@mentorlink.edu',
  '+962-6-555-0802',
  'International Center, Room 102',
  'Sunday-Thursday 9:00 AM - 3:00 PM',
  'Coordinates study abroad programs, exchange student applications, international partnerships, credit transfer for study abroad, scholarship opportunities abroad, pre-departure orientation. Contact for: study abroad programs, exchange opportunities, studying overseas, international scholarships.',
  'international'
),

-- FACILITIES MANAGEMENT (2 staff members)
(
  'Reem Al-Said',
  'Facilities Manager',
  'Facilities Management',
  'reem.said@mentorlink.edu',
  '+962-6-555-0901',
  'Maintenance Building, Room 101',
  'Sunday-Thursday 7:00 AM - 3:00 PM',
  'Manages campus maintenance, building repairs, classroom issues, parking permits, campus safety concerns, facility reservations, lost and found, security issues. Contact for: building problems, classroom issues, parking permits, safety concerns, lost items.',
  'facilities'
),
(
  'Jamal Hussein',
  'Campus Safety Officer',
  'Campus Security',
  'jamal.hussein@mentorlink.edu',
  '+962-6-555-0902',
  'Security Office, Main Gate',
  '24/7 (Emergency: 0999)',
  'Handles campus security, emergency response, safety escorts, security concerns, incident reports, access card issues, parking violations, campus safety education. Contact for: security concerns, emergency situations, safety escorts, access card problems, parking issues.',
  'facilities'
);

-- Verification query (commented out - for reference)
-- SELECT category, COUNT(*) as count FROM staff_contacts GROUP BY category ORDER BY category;
