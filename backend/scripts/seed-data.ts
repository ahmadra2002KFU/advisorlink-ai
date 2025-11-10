import { db } from '../src/config/database';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// ========================================
// SAMPLE DATA ARRAYS
// ========================================

const firstNames = [
  'Ahmed', 'Mohammed', 'Fatima', 'Aisha', 'Omar', 'Sara', 'Ali', 'Mariam',
  'Khaled', 'Layla', 'Hassan', 'Nour', 'Youssef', 'Zahra', 'Ibrahim', 'Maha',
  'Abdullah', 'Hana', 'Tariq', 'Salma', 'Karim', 'Dina', 'Mustafa', 'Rana',
  'Hamza', 'Yasmin', 'Waleed', 'Amina', 'Samir', 'Leena', 'Rami', 'Sana',
  'Fahad', 'Huda', 'Majid', 'Nada', 'Jamal', 'Reem', 'Bassam', 'Samira'
];

const lastNames = [
  'Al-Rashid', 'Al-Saud', 'Al-Mansoori', 'Al-Khalifa', 'Al-Maktoum',
  'Al-Thani', 'Al-Sabah', 'Al-Nahyan', 'Hassan', 'Hussein',
  'Mahmoud', 'Abdullah', 'Ibrahim', 'Mohammed', 'Ahmad',
  'Salem', 'Khalil', 'Nasser', 'Karim', 'Yousef'
];

const specializations = [
  'Computer Science', 'Business Administration', 'Engineering',
  'Mathematics', 'English Literature', 'Biology', 'Chemistry',
  'Physics', 'History', 'Psychology'
];

// ========================================
// INSTRUCTOR POOL (40 instructors)
// ========================================

interface Instructor {
  name: string;
  email: string;
  specialization: string;
  department: string;
}

const instructors: Instructor[] = [
  // Computer Science (8)
  { name: 'Dr. Sarah Al-Rahman', email: 'sarah.rahman@mentorlink.edu', specialization: 'Computer Science', department: 'CS' },
  { name: 'Prof. Ahmad Khalil', email: 'ahmad.khalil@mentorlink.edu', specialization: 'Computer Science', department: 'CS' },
  { name: 'Dr. Layla Mansour', email: 'layla.mansour@mentorlink.edu', specialization: 'Computer Science', department: 'CS' },
  { name: 'Dr. Hassan Ibrahim', email: 'hassan.ibrahim@mentorlink.edu', specialization: 'Computer Science', department: 'CS' },
  { name: 'Prof. Nour Al-Sayed', email: 'nour.alsayed@mentorlink.edu', specialization: 'Computer Science', department: 'CS' },
  { name: 'Dr. Youssef Karim', email: 'youssef.karim@mentorlink.edu', specialization: 'Computer Science', department: 'CS' },
  { name: 'Dr. Fatima Al-Zahra', email: 'fatima.zahra@mentorlink.edu', specialization: 'Computer Science', department: 'CS' },
  { name: 'Prof. Omar Al-Masri', email: 'omar.masri@mentorlink.edu', specialization: 'Computer Science', department: 'CS' },

  // Mathematics (6)
  { name: 'Dr. Mariam Al-Khalifa', email: 'mariam.khalifa@mentorlink.edu', specialization: 'Mathematics', department: 'MATH' },
  { name: 'Prof. Tariq Al-Mansoori', email: 'tariq.mansoori@mentorlink.edu', specialization: 'Mathematics', department: 'MATH' },
  { name: 'Dr. Amina Hassan', email: 'amina.hassan@mentorlink.edu', specialization: 'Mathematics', department: 'MATH' },
  { name: 'Dr. Waleed Ibrahim', email: 'waleed.ibrahim@mentorlink.edu', specialization: 'Mathematics', department: 'MATH' },
  { name: 'Prof. Hana Al-Saud', email: 'hana.saud@mentorlink.edu', specialization: 'Mathematics', department: 'MATH' },
  { name: 'Dr. Rami Al-Thani', email: 'rami.thani@mentorlink.edu', specialization: 'Mathematics', department: 'MATH' },

  // Engineering (7)
  { name: 'Dr. Majid Al-Rashid', email: 'majid.rashid@mentorlink.edu', specialization: 'Engineering', department: 'ENGR' },
  { name: 'Prof. Dina Al-Sabah', email: 'dina.sabah@mentorlink.edu', specialization: 'Engineering', department: 'ENGR' },
  { name: 'Dr. Bassam Al-Nahyan', email: 'bassam.nahyan@mentorlink.edu', specialization: 'Engineering', department: 'ENGR' },
  { name: 'Dr. Samira Yousef', email: 'samira.yousef@mentorlink.edu', specialization: 'Engineering', department: 'ENGR' },
  { name: 'Prof. Fahad Nasser', email: 'fahad.nasser@mentorlink.edu', specialization: 'Engineering', department: 'ENGR' },
  { name: 'Dr. Huda Salem', email: 'huda.salem@mentorlink.edu', specialization: 'Engineering', department: 'ENGR' },
  { name: 'Dr. Mustafa Ahmad', email: 'mustafa.ahmad@mentorlink.edu', specialization: 'Engineering', department: 'ENGR' },

  // Business Administration (6)
  { name: 'Dr. Salma Mahmoud', email: 'salma.mahmoud@mentorlink.edu', specialization: 'Business', department: 'BUS' },
  { name: 'Prof. Khaled Abdullah', email: 'khaled.abdullah@mentorlink.edu', specialization: 'Business', department: 'BUS' },
  { name: 'Dr. Zahra Al-Maktoum', email: 'zahra.maktoum@mentorlink.edu', specialization: 'Business', department: 'BUS' },
  { name: 'Dr. Hamza Mohammed', email: 'hamza.mohammed@mentorlink.edu', specialization: 'Business', department: 'BUS' },
  { name: 'Prof. Rana Al-Hussein', email: 'rana.hussein@mentorlink.edu', specialization: 'Business', department: 'BUS' },
  { name: 'Dr. Samir Khalil', email: 'samir.khalil@mentorlink.edu', specialization: 'Business', department: 'BUS' },

  // Sciences - Physics, Chemistry, Biology (7)
  { name: 'Dr. Leena Al-Rahman', email: 'leena.rahman@mentorlink.edu', specialization: 'Physics', department: 'SCI' },
  { name: 'Prof. Ali Al-Masri', email: 'ali.masri@mentorlink.edu', specialization: 'Chemistry', department: 'SCI' },
  { name: 'Dr. Sana Al-Khalil', email: 'sana.khalil@mentorlink.edu', specialization: 'Biology', department: 'SCI' },
  { name: 'Dr. Ibrahim Al-Nasser', email: 'ibrahim.nasser@mentorlink.edu', specialization: 'Physics', department: 'SCI' },
  { name: 'Prof. Nada Al-Karim', email: 'nada.karim@mentorlink.edu', specialization: 'Chemistry', department: 'SCI' },
  { name: 'Dr. Reem Al-Said', email: 'reem.said@mentorlink.edu', specialization: 'Biology', department: 'SCI' },
  { name: 'Dr. Jamal Hussein', email: 'jamal.hussein@mentorlink.edu', specialization: 'Physics', department: 'SCI' },

  // English (3)
  { name: 'Dr. Aisha Al-Salem', email: 'aisha.salem@mentorlink.edu', specialization: 'English', department: 'ENG' },
  { name: 'Prof. Mohammed Al-Khalil', email: 'mohammed.khalil@mentorlink.edu', specialization: 'English', department: 'ENG' },
  { name: 'Dr. Yasmin Al-Abbas', email: 'yasmin.abbas@mentorlink.edu', specialization: 'English', department: 'ENG' },

  // History & Psychology (3)
  { name: 'Dr. Abdullah Al-Rashid', email: 'abdullah.rashid@mentorlink.edu', specialization: 'History', department: 'HIST' },
  { name: 'Prof. Maha Al-Yousef', email: 'maha.yousef@mentorlink.edu', specialization: 'Psychology', department: 'PSYC' },
  { name: 'Dr. Sara Al-Ibrahim', email: 'sara.ibrahim@mentorlink.edu', specialization: 'History', department: 'HIST' }
];

// ========================================
// COMPREHENSIVE COURSE CATALOG
// ========================================

interface Course {
  name: string;
  code: string;
  department: string;
  level: number; // Minimum level required
  creditHours: number;
  description: string;
  prerequisites?: string;
}

const courseCatalog: Course[] = [
  // Level 1 Courses (Foundation)
  { name: 'Introduction to Computer Science', code: 'CS101', department: 'CS', level: 1, creditHours: 3, description: 'Fundamentals of programming and computational thinking' },
  { name: 'Calculus I', code: 'MATH101', department: 'MATH', level: 1, creditHours: 4, description: 'Limits, derivatives, and basic integration' },
  { name: 'English Composition', code: 'ENG101', department: 'ENG', level: 1, creditHours: 3, description: 'Academic writing and critical reading skills' },
  { name: 'General Physics I', code: 'SCI101', department: 'SCI', level: 1, creditHours: 4, description: 'Mechanics, motion, and energy', prerequisites: 'MATH101' },
  { name: 'Introduction to Business', code: 'BUS101', department: 'BUS', level: 1, creditHours: 3, description: 'Fundamentals of business operations and management' },
  { name: 'General Chemistry', code: 'SCI102', department: 'SCI', level: 1, creditHours: 4, description: 'Atomic structure, bonding, and reactions' },
  { name: 'World History', code: 'HIST101', department: 'HIST', level: 1, creditHours: 3, description: 'Survey of world civilizations' },
  { name: 'Introduction to Psychology', code: 'PSYC101', department: 'PSYC', level: 1, creditHours: 3, description: 'Basic principles of human behavior' },

  // Level 2 Courses
  { name: 'Data Structures', code: 'CS201', department: 'CS', level: 2, creditHours: 3, description: 'Arrays, linked lists, trees, and graphs', prerequisites: 'CS101' },
  { name: 'Object-Oriented Programming', code: 'CS202', department: 'CS', level: 2, creditHours: 3, description: 'OOP principles using Java', prerequisites: 'CS101' },
  { name: 'Calculus II', code: 'MATH201', department: 'MATH', level: 2, creditHours: 4, description: 'Integration techniques and series', prerequisites: 'MATH101' },
  { name: 'Linear Algebra', code: 'MATH202', department: 'MATH', level: 2, creditHours: 3, description: 'Matrices, vectors, and transformations', prerequisites: 'MATH101' },
  { name: 'Technical Writing', code: 'ENG201', department: 'ENG', level: 2, creditHours: 3, description: 'Professional and technical communication', prerequisites: 'ENG101' },
  { name: 'General Physics II', code: 'SCI201', department: 'SCI', level: 2, creditHours: 4, description: 'Electricity, magnetism, and waves', prerequisites: 'SCI101' },
  { name: 'Microeconomics', code: 'BUS201', department: 'BUS', level: 2, creditHours: 3, description: 'Supply, demand, and market structures', prerequisites: 'BUS101' },
  { name: 'Financial Accounting', code: 'BUS202', department: 'BUS', level: 2, creditHours: 3, description: 'Basic accounting principles and practices', prerequisites: 'BUS101' },
  { name: 'Engineering Mechanics', code: 'ENGR201', department: 'ENGR', level: 2, creditHours: 3, description: 'Statics and dynamics fundamentals', prerequisites: 'SCI101' },

  // Level 3 Courses
  { name: 'Algorithms', code: 'CS301', department: 'CS', level: 3, creditHours: 3, description: 'Algorithm design and complexity analysis', prerequisites: 'CS201, MATH202' },
  { name: 'Database Systems', code: 'CS302', department: 'CS', level: 3, creditHours: 3, description: 'Relational databases and SQL', prerequisites: 'CS201' },
  { name: 'Computer Networks', code: 'CS303', department: 'CS', level: 3, creditHours: 3, description: 'Network protocols and architectures', prerequisites: 'CS202' },
  { name: 'Statistics', code: 'MATH301', department: 'MATH', level: 3, creditHours: 3, description: 'Probability and statistical inference', prerequisites: 'MATH201' },
  { name: 'Differential Equations', code: 'MATH302', department: 'MATH', level: 3, creditHours: 3, description: 'ODEs and their applications', prerequisites: 'MATH201' },
  { name: 'Macroeconomics', code: 'BUS301', department: 'BUS', level: 3, creditHours: 3, description: 'National income, inflation, and policy', prerequisites: 'BUS201' },
  { name: 'Marketing Principles', code: 'BUS302', department: 'BUS', level: 3, creditHours: 3, description: 'Consumer behavior and market strategy', prerequisites: 'BUS101' },
  { name: 'Organic Chemistry', code: 'SCI301', department: 'SCI', level: 3, creditHours: 4, description: 'Carbon compounds and reactions', prerequisites: 'SCI102' },
  { name: 'Thermodynamics', code: 'ENGR301', department: 'ENGR', level: 3, creditHours: 3, description: 'Energy transfer and system analysis', prerequisites: 'ENGR201' },

  // Level 4 Courses
  { name: 'Software Engineering', code: 'CS401', department: 'CS', level: 4, creditHours: 3, description: 'SDLC, testing, and project management', prerequisites: 'CS301, CS302' },
  { name: 'Operating Systems', code: 'CS402', department: 'CS', level: 4, creditHours: 3, description: 'Process management and memory allocation', prerequisites: 'CS301' },
  { name: 'Web Development', code: 'CS403', department: 'CS', level: 4, creditHours: 3, description: 'Full-stack web application development', prerequisites: 'CS302' },
  { name: 'Artificial Intelligence', code: 'CS404', department: 'CS', level: 4, creditHours: 3, description: 'Search, learning, and knowledge representation', prerequisites: 'CS301, MATH301' },
  { name: 'Advanced Calculus', code: 'MATH401', department: 'MATH', level: 4, creditHours: 3, description: 'Multivariable calculus and analysis', prerequisites: 'MATH302' },
  { name: 'Managerial Accounting', code: 'BUS401', department: 'BUS', level: 4, creditHours: 3, description: 'Cost analysis and budgeting', prerequisites: 'BUS202' },
  { name: 'Business Strategy', code: 'BUS402', department: 'BUS', level: 4, creditHours: 3, description: 'Competitive advantage and planning', prerequisites: 'BUS301, BUS302' },
  { name: 'Circuit Analysis', code: 'ENGR401', department: 'ENGR', level: 4, creditHours: 3, description: 'AC/DC circuits and network theorems', prerequisites: 'ENGR201' },
  { name: 'Materials Science', code: 'ENGR402', department: 'ENGR', level: 4, creditHours: 3, description: 'Properties and selection of materials', prerequisites: 'ENGR301' },

  // Level 5 Courses (Advanced)
  { name: 'Machine Learning', code: 'CS501', department: 'CS', level: 5, creditHours: 3, description: 'Supervised and unsupervised learning algorithms', prerequisites: 'CS404, MATH301' },
  { name: 'Computer Security', code: 'CS502', department: 'CS', level: 5, creditHours: 3, description: 'Cryptography and network security', prerequisites: 'CS303, CS402' },
  { name: 'Mobile Development', code: 'CS503', department: 'CS', level: 5, creditHours: 3, description: 'iOS and Android app development', prerequisites: 'CS403' },
  { name: 'Cloud Computing', code: 'CS504', department: 'CS', level: 5, creditHours: 3, description: 'Distributed systems and services', prerequisites: 'CS303, CS402' },
  { name: 'Senior Project', code: 'CS590', department: 'CS', level: 5, creditHours: 4, description: 'Capstone design project', prerequisites: 'CS401' },
  { name: 'Advanced Statistics', code: 'MATH501', department: 'MATH', level: 5, creditHours: 3, description: 'Regression and experimental design', prerequisites: 'MATH301' },
  { name: 'Financial Management', code: 'BUS501', department: 'BUS', level: 5, creditHours: 3, description: 'Investment and capital budgeting', prerequisites: 'BUS401' },
  { name: 'International Business', code: 'BUS502', department: 'BUS', level: 5, creditHours: 3, description: 'Global trade and market entry', prerequisites: 'BUS402' },
  { name: 'Digital Signal Processing', code: 'ENGR501', department: 'ENGR', level: 5, creditHours: 3, description: 'Signal analysis and filtering', prerequisites: 'ENGR401' },
  { name: 'Control Systems', code: 'ENGR502', department: 'ENGR', level: 5, creditHours: 3, description: 'Feedback and system stability', prerequisites: 'ENGR401' }
];

// ========================================
// SCHEDULE DATA
// ========================================

interface TimeSlot {
  time: string;
  period: 'morning' | 'afternoon' | 'evening';
}

const timeSlots: TimeSlot[] = [
  { time: '08:00 AM - 09:30 AM', period: 'morning' },
  { time: '09:45 AM - 11:15 AM', period: 'morning' },
  { time: '11:30 AM - 01:00 PM', period: 'morning' },
  { time: '01:15 PM - 02:45 PM', period: 'afternoon' },
  { time: '03:00 PM - 04:30 PM', period: 'afternoon' },
  { time: '04:45 PM - 06:15 PM', period: 'afternoon' },
  { time: '06:30 PM - 08:00 PM', period: 'evening' },
  { time: '08:15 PM - 09:45 PM', period: 'evening' }
];

const dayPatterns = ['MWF', 'TR', 'MW', 'MW', 'MWF', 'TR']; // Favor MWF and TR

// ========================================
// LOCATION DATA
// ========================================

interface Building {
  name: string;
  rooms: string[];
}

const buildings: Building[] = [
  { name: 'Science Building', rooms: ['S101', 'S102', 'S103', 'S201', 'S202', 'S203', 'S301', 'S302', 'S303'] },
  { name: 'Engineering Hall', rooms: ['E101', 'E102', 'E201', 'E202', 'E301', 'E302'] },
  { name: 'Computer Lab Center', rooms: ['CL101', 'CL102', 'CL103', 'CL201', 'CL202', 'CL203'] },
  { name: 'Business Complex', rooms: ['B101', 'B102', 'B201', 'B202', 'B301', 'B302'] },
  { name: 'Arts & Humanities', rooms: ['AH101', 'AH102', 'AH103', 'AH201', 'AH202', 'AH203'] }
];

// ========================================
// GRADE DISTRIBUTION
// ========================================

const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'In Progress'];

function randomGrade(): string {
  const rand = Math.random();
  if (rand < 0.15) return 'A';
  if (rand < 0.25) return 'A-';
  if (rand < 0.35) return 'B+';
  if (rand < 0.50) return 'B';
  if (rand < 0.60) return 'B-';
  if (rand < 0.70) return 'C+';
  if (rand < 0.80) return 'C';
  if (rand < 0.85) return 'C-';
  if (rand < 0.88) return 'D';
  if (rand < 0.90) return 'F';
  return 'In Progress'; // 10% current semester
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomGPA(): number {
  return parseFloat((2.0 + Math.random() * 2.0).toFixed(2));
}

function randomAttendance(): number {
  return parseFloat((70 + Math.random() * 30).toFixed(2));
}

function randomBirthdate(): string {
  const year = randomInt(1999, 2005);
  const month = String(randomInt(1, 12)).padStart(2, '0');
  const day = String(randomInt(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateStudentID(level: number, section: string, index: number): string {
  return `S${level}${section}${String(index).padStart(3, '0')}`;
}

function getCurrentSemester(): string {
  const semesters = ['Fall 2024', 'Spring 2025'];
  return randomElement(semesters);
}

function getInstructorByDepartment(department: string): Instructor {
  const deptInstructors = instructors.filter(i => i.department === department);
  if (deptInstructors.length > 0) {
    return randomElement(deptInstructors);
  }
  return randomElement(instructors); // Fallback
}

function getLocationByDepartment(department: string): { building: string; room: string } {
  let building: Building;

  if (department === 'CS') {
    building = buildings[2]; // Computer Lab Center
  } else if (department === 'ENGR') {
    building = buildings[1]; // Engineering Hall
  } else if (department === 'BUS') {
    building = buildings[3]; // Business Complex
  } else if (department === 'SCI' || department === 'MATH') {
    building = buildings[0]; // Science Building
  } else {
    building = buildings[4]; // Arts & Humanities
  }

  return {
    building: building.name,
    room: randomElement(building.rooms)
  };
}

// ========================================
// SCHEDULE CONFLICT DETECTION
// ========================================

interface ScheduleEntry {
  time: string;
  days: string;
}

function hasScheduleConflict(existingSchedules: ScheduleEntry[], newSchedule: ScheduleEntry): boolean {
  for (const existing of existingSchedules) {
    // Check if times overlap
    if (existing.time === newSchedule.time) {
      // Check if days overlap
      const existingDays = existing.days.split('');
      const newDays = newSchedule.days.split('');

      for (const day of newDays) {
        if (existingDays.includes(day)) {
          return true; // Conflict found
        }
      }
    }
  }
  return false;
}

// ========================================
// MAIN SEED FUNCTION
// ========================================

function seedDatabase() {
  try {
    console.log('Loading SQLite database...');

    // Drop all existing tables
    console.log('Dropping existing tables...');
    const tables = [
      'ai_chat_history',
      'messages',
      'conversations',
      'advisor_assignments',
      'student_courses',
      'advisors',
      'students',
      'users',
      'faqs',
      'sections',
      'levels'
    ];

    for (const table of tables) {
      try {
        db.exec(`DROP TABLE IF EXISTS ${table}`);
      } catch (error) {
        // Ignore errors if table doesn't exist
      }
    }
    console.log('Existing tables dropped successfully!');

    // Load and execute schema
    console.log('Creating database schema...');
    const schemaPath = path.join(__dirname, '../../database/schema-sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('Schema created successfully!');

    // Hash password for all users (simple: "password123")
    const passwordHash = bcrypt.hashSync('password123', 10);

    // Get levels and sections
    const levels = db.prepare('SELECT * FROM levels ORDER BY level_number').all() as any[];
    const sections = db.prepare('SELECT * FROM sections ORDER BY id').all() as any[];

    console.log(`\nFound ${levels.length} levels and ${sections.length} sections`);

    // ====================
    // 1. CREATE ADMIN USER
    // ====================
    console.log('\n--- Creating Admin User ---');
    const adminResult = db.prepare(
      'INSERT INTO users (email, password_hash, full_name, user_type) VALUES (?, ?, ?, ?)'
    ).run('admin@mentorlink.com', passwordHash, 'System Administrator', 'admin');
    console.log(`✓ Admin created: admin@mentorlink.com / password123`);

    // ====================
    // 2. CREATE 30 ADVISORS (6 per level)
    // ====================
    console.log('\n--- Creating 30 Advisors (6 per level) ---');
    const advisorIds: number[] = [];

    for (const level of levels) {
      console.log(`\nLevel ${level.level_number}:`);

      for (let i = 0; i < 6; i++) {
        const fullName = `${randomElement(firstNames)} ${randomElement(lastNames)}`;
        const email = `advisor.l${level.level_number}.${i + 1}@mentorlink.com`;
        const specialization = randomElement(specializations);

        // Create user
        const userResult = db.prepare(
          'INSERT INTO users (email, password_hash, full_name, user_type) VALUES (?, ?, ?, ?)'
        ).run(email, passwordHash, fullName, 'advisor');

        const userId = userResult.lastInsertRowid;

        // Create advisor record
        const advisorResult = db.prepare(
          'INSERT INTO advisors (user_id, level_id, specialization, is_available) VALUES (?, ?, ?, ?)'
        ).run(userId, level.id, specialization, 1);

        advisorIds.push(advisorResult.lastInsertRowid as number);
        console.log(`  ✓ ${fullName} (${specialization}) - ${email}`);
      }
    }

    console.log(`\n✓ Total advisors created: ${advisorIds.length}`);

    // ====================
    // 3. CREATE 300 STUDENTS (60 per level, 20 per section)
    // ====================
    console.log('\n--- Creating 300 Students with Enhanced Course Data (60 per level, 20 per section) ---');
    let totalStudents = 0;
    let totalCourses = 0;

    // Prepare statements for better performance
    const insertUserStmt = db.prepare('INSERT INTO users (email, password_hash, full_name, user_type) VALUES (?, ?, ?, ?)');
    const insertStudentStmt = db.prepare('INSERT INTO students (user_id, student_id, birthdate, level_id, section_id, gpa, attendance_percentage) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertCourseStmt = db.prepare(`
      INSERT INTO student_courses (
        student_id, course_name, course_code, instructor_name, instructor_email,
        class_time, class_days, room_number, building, credit_hours,
        current_grade, semester, department, course_description, prerequisites
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertAssignmentStmt = db.prepare('INSERT INTO advisor_assignments (student_id, advisor_id) VALUES (?, ?)');
    const countAssignmentsStmt = db.prepare('SELECT COUNT(*) as count FROM advisor_assignments WHERE advisor_id = ?');

    for (const level of levels) {
      console.log(`\nLevel ${level.level_number}:`);

      // Get sections for this level
      const levelSections = sections.filter((s: any) => s.level_id === level.id);

      for (const section of levelSections) {
        console.log(`  Section ${section.section_name}:`);

        for (let i = 1; i <= 20; i++) {
          const fullName = `${randomElement(firstNames)} ${randomElement(lastNames)}`;
          const studentId = generateStudentID(level.level_number, section.section_name, i);
          const email = `${studentId.toLowerCase()}@student.mentorlink.com`;
          const birthdate = randomBirthdate();
          const gpa = randomGPA();
          const attendance = randomAttendance();

          // Create user
          const userResult = insertUserStmt.run(email, passwordHash, fullName, 'student');
          const userId = userResult.lastInsertRowid;

          // Create student record
          const studentResult = insertStudentStmt.run(userId, studentId, birthdate, level.id, section.id, gpa, attendance);
          const studentDbId = studentResult.lastInsertRowid;

          // ========================================
          // ENHANCED COURSE ASSIGNMENT
          // ========================================

          // Get level-appropriate courses
          const availableCourses = courseCatalog.filter(c => c.level <= level.level_number);

          // Assign 4-6 courses per student
          const numCourses = randomInt(4, 6);
          const assignedCourses: Course[] = [];
          const studentSchedule: ScheduleEntry[] = [];

          let attempts = 0;
          const maxAttempts = 50;

          while (assignedCourses.length < numCourses && attempts < maxAttempts) {
            attempts++;
            const course = randomElement(availableCourses);

            // Skip if already assigned
            if (assignedCourses.find(c => c.code === course.code)) {
              continue;
            }

            // Generate schedule
            const timeSlot = randomElement(timeSlots);
            const days = randomElement(dayPatterns);
            const schedule: ScheduleEntry = { time: timeSlot.time, days };

            // Check for schedule conflicts
            if (hasScheduleConflict(studentSchedule, schedule)) {
              continue; // Try another course
            }

            // Get instructor from same department
            const instructor = getInstructorByDepartment(course.department);

            // Get location based on department
            const location = getLocationByDepartment(course.department);

            // Get semester
            const semester = getCurrentSemester();

            // Get grade
            const grade = randomGrade();

            // Insert course with all details
            insertCourseStmt.run(
              studentDbId,
              course.name,
              course.code,
              instructor.name,
              instructor.email,
              timeSlot.time,
              days,
              location.room,
              location.building,
              course.creditHours,
              grade,
              semester,
              course.department,
              course.description,
              course.prerequisites || null
            );

            assignedCourses.push(course);
            studentSchedule.push(schedule);
            totalCourses++;
          }

          // Auto-assign to advisor (load-balanced: least assigned)
          const levelAdvisorIds = advisorIds.slice(
            (level.level_number - 1) * 6,
            level.level_number * 6
          );

          const advisorLoads = levelAdvisorIds.map((advisorId) => {
            const result: any = countAssignmentsStmt.get(advisorId);
            return { advisorId, count: result.count };
          });

          const leastLoadedAdvisor = advisorLoads.reduce((min, current) =>
            current.count < min.count ? current : min
          );

          insertAssignmentStmt.run(studentDbId, leastLoadedAdvisor.advisorId);

          totalStudents++;

          if (i % 5 === 0) {
            console.log(`    Created ${i}/20 students... (${assignedCourses.length} courses each)`);
          }
        }
      }
    }

    console.log(`\n✓ Total students created: ${totalStudents}`);
    console.log(`✓ Total courses assigned: ${totalCourses}`);

    // ====================
    // 4. CREATE SAMPLE CONVERSATIONS
    // ====================
    console.log('\n--- Creating Sample Conversations ---');

    const allStudents = db.prepare('SELECT * FROM students ORDER BY RANDOM() LIMIT 50').all();

    let conversationCount = 0;

    const getAssignmentStmt = db.prepare('SELECT advisor_id FROM advisor_assignments WHERE student_id = ?');
    const getAdvisorStmt = db.prepare('SELECT user_id FROM advisors WHERE id = ?');
    const insertConversationStmt = db.prepare('INSERT INTO conversations (student_id, advisor_id, status) VALUES (?, ?, ?)');
    const insertMessageStmt = db.prepare('INSERT INTO messages (conversation_id, sender_id, message_text, is_read) VALUES (?, ?, ?, ?)');

    for (const student of allStudents as any[]) {
      const assignment: any = getAssignmentStmt.get(student.id);

      if (assignment) {
        const advisorId = assignment.advisor_id;
        const advisor: any = getAdvisorStmt.get(advisorId);

        const convResult = insertConversationStmt.run(
          student.id,
          advisorId,
          randomElement(['active', 'active', 'active', 'resolved'])
        );

        const conversationId = convResult.lastInsertRowid;

        const numMessages = randomInt(2, 5);

        for (let i = 0; i < numMessages; i++) {
          const isStudentSender = i % 2 === 0;
          const senderId = isStudentSender ? student.user_id : advisor.user_id;

          const sampleMessages = isStudentSender
            ? [
                'Hello, I have a question about my courses.',
                'Can we schedule a meeting to discuss my progress?',
                'I need help choosing electives for next semester.',
                'What are the graduation requirements again?'
              ]
            : [
                'Hi! I\'m happy to help. What specific courses are you asking about?',
                'Sure, I have availability on Tuesday and Thursday afternoons.',
                'Let\'s review your degree plan together. What\'s your major?',
                'You need to complete 120 credit hours with a minimum 2.0 GPA.'
              ];

          insertMessageStmt.run(
            conversationId,
            senderId,
            randomElement(sampleMessages),
            Math.random() > 0.3 ? 1 : 0
          );
        }

        conversationCount++;
      }
    }

    console.log(`✓ Created ${conversationCount} sample conversations`);

    // ====================
    // 5. CREATE AI CHAT HISTORY
    // ====================
    console.log('\n--- Creating AI Chat History ---');

    const randomStudents = db.prepare('SELECT * FROM students ORDER BY RANDOM() LIMIT 100').all();

    let aiChatCount = 0;

    const insertAIChatStmt = db.prepare('INSERT INTO ai_chat_history (student_id, user_message, ai_response) VALUES (?, ?, ?)');

    for (const student of randomStudents as any[]) {
      const numChats = randomInt(1, 3);

      const sampleUserMessages = [
        'What is the add/drop deadline?',
        'How is GPA calculated?',
        'Can I graduate early?',
        'What courses should I take?',
        'How do I contact my advisor?'
      ];

      const sampleAIResponses = [
        'Students can add courses during the first week and drop during the first two weeks without penalty.',
        'Your GPA is calculated by dividing total grade points by total credit hours attempted.',
        'Yes, you can graduate early with advisor approval if you complete all requirements.',
        'Based on your level and major, I recommend consulting with your advisor for personalized course selection.',
        'You can contact your advisor through the MentorLink platform or during office hours.'
      ];

      for (let i = 0; i < numChats; i++) {
        insertAIChatStmt.run(
          student.id,
          randomElement(sampleUserMessages),
          randomElement(sampleAIResponses)
        );
        aiChatCount++;
      }
    }

    console.log(`✓ Created ${aiChatCount} AI chat history entries`);

    // ====================
    // SUMMARY
    // ====================
    console.log('\n========================================');
    console.log('      ENHANCED DATABASE SEED COMPLETE    ');
    console.log('========================================');

    const stats: any = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM advisors) as total_advisors,
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM student_courses) as total_course_enrollments,
        (SELECT COUNT(*) FROM conversations) as total_conversations,
        (SELECT COUNT(*) FROM messages) as total_messages,
        (SELECT COUNT(*) FROM ai_chat_history) as total_ai_chats,
        (SELECT COUNT(*) FROM faqs) as total_faqs
    `).get();

    console.log('\n📊 Database Statistics:');
    console.log('-------------------');
    console.log(`Total Users:           ${stats.total_users}`);
    console.log(`  - Advisors:          ${stats.total_advisors}`);
    console.log(`  - Students:          ${stats.total_students}`);
    console.log(`  - Admins:            1`);
    console.log(`Course Enrollments:    ${stats.total_course_enrollments}`);
    console.log(`Conversations:         ${stats.total_conversations}`);
    console.log(`Messages:              ${stats.total_messages}`);
    console.log(`AI Chat History:       ${stats.total_ai_chats}`);
    console.log(`FAQs:                  ${stats.total_faqs}`);

    console.log('\n📚 Enhanced Course Features:');
    console.log('---------------------------');
    console.log(`✓ ${instructors.length} instructors across 7 departments`);
    console.log(`✓ ${courseCatalog.length} courses with descriptions`);
    console.log(`✓ ${timeSlots.length} different time slots`);
    console.log(`✓ ${buildings.reduce((sum, b) => sum + b.rooms.length, 0)} rooms in ${buildings.length} buildings`);
    console.log('✓ Schedule conflict detection enabled');
    console.log('✓ Level-appropriate course assignments');
    console.log('✓ Department-specific instructors and locations');
    console.log('✓ Prerequisite tracking');
    console.log('✓ Grade distribution with current semester courses');

    console.log('\n📧 LOGIN CREDENTIALS:');
    console.log('====================');
    console.log('Admin:   admin@mentorlink.com / password123');
    console.log('Advisor: advisor.l1.1@mentorlink.com / password123');
    console.log('Student: s1a001@student.mentorlink.com / password123');
    console.log('\n✅ Enhanced seed complete! Database ready with realistic course data.');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seedDatabase();
