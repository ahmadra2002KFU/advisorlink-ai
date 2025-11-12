import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../../mentorlink.db');

console.log('🚀 Seeding Course Catalog...\n');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Course data structure
interface Course {
  code: string;
  name: string;
  description: string;
  creditHours: number;
  level: number;
  department: string;
  courseType: string;
  instructor: string;
  semester: string;
  maxEnrollment: number;
  difficulty: string;
  workload: number;
  passRate: number;
  avgGrade: number;
}

// Comprehensive course catalog
const courses: Course[] = [
  // =============== COMPUTER SCIENCE (CS) ===============
  // Level 1
  { code: 'CS102', name: 'Computer Systems Fundamentals', description: 'Introduction to computer hardware and operating systems', creditHours: 3, level: 1, department: 'CS', courseType: 'required', instructor: 'Dr. Hassan Mahmoud', semester: 'Both', maxEnrollment: 40, difficulty: 'Medium', workload: 10, passRate: 78, avgGrade: 2.9 },
  { code: 'CS103', name: 'Web Development Basics', description: 'HTML, CSS, JavaScript fundamentals', creditHours: 3, level: 1, department: 'CS', courseType: 'elective', instructor: 'Prof. Sara Ahmed', semester: 'Both', maxEnrollment: 35, difficulty: 'Easy', workload: 8, passRate: 86, avgGrade: 3.2 },

  // Level 2
  { code: 'CS202', name: 'Object-Oriented Programming', description: 'OOP principles using Java', creditHours: 3, level: 2, department: 'CS', courseType: 'required', instructor: 'Dr. Omar Khalil', semester: 'Both', maxEnrollment: 35, difficulty: 'Medium', workload: 11, passRate: 74, avgGrade: 2.8 },
  { code: 'CS203', name: 'Discrete Mathematics for CS', description: 'Logic, sets, graphs for computer science', creditHours: 4, level: 2, department: 'CS', courseType: 'required', instructor: 'Dr. Layla Ibrahim', semester: 'Fall', maxEnrollment: 40, difficulty: 'Hard', workload: 13, passRate: 66, avgGrade: 2.4 },
  { code: 'CS204', name: 'Web Application Development', description: 'Building full-stack web applications', creditHours: 3, level: 2, department: 'CS', courseType: 'elective', instructor: 'Prof. Tariq Hassan', semester: 'Spring', maxEnrollment: 30, difficulty: 'Medium', workload: 10, passRate: 80, avgGrade: 3.1 },

  // Level 3
  { code: 'CS302', name: 'Algorithms', description: 'Design and analysis of algorithms', creditHours: 3, level: 3, department: 'CS', courseType: 'required', instructor: 'Dr. Fatima Yousef', semester: 'Both', maxEnrollment: 30, difficulty: 'Hard', workload: 12, passRate: 68, avgGrade: 2.6 },
  { code: 'CS303', name: 'Computer Networks', description: 'Networking protocols and architectures', creditHours: 3, level: 3, department: 'CS', courseType: 'required', instructor: 'Dr. Ahmed Rashid', semester: 'Fall', maxEnrollment: 30, difficulty: 'Hard', workload: 11, passRate: 72, avgGrade: 2.7 },
  { code: 'CS304', name: 'Operating Systems', description: 'OS principles, processes, memory management', creditHours: 3, level: 3, department: 'CS', courseType: 'required', instructor: 'Dr. Nour Al-Din', semester: 'Spring', maxEnrollment: 28, difficulty: 'Hard', workload: 12, passRate: 70, avgGrade: 2.6 },
  { code: 'CS305', name: 'Mobile App Development', description: 'iOS and Android application development', creditHours: 3, level: 3, department: 'CS', courseType: 'elective', instructor: 'Prof. Maha Salem', semester: 'Both', maxEnrollment: 25, difficulty: 'Medium', workload: 10, passRate: 82, avgGrade: 3.2 },

  // Level 4
  { code: 'CS402', name: 'Machine Learning', description: 'ML algorithms and applications', creditHours: 3, level: 4, department: 'CS', courseType: 'elective', instructor: 'Dr. Khaled Omar', semester: 'Fall', maxEnrollment: 25, difficulty: 'Hard', workload: 13, passRate: 75, avgGrade: 2.9 },
  { code: 'CS403', name: 'Computer Security', description: 'Cybersecurity principles and practices', creditHours: 3, level: 4, department: 'CS', courseType: 'required', instructor: 'Dr. Salma Karim', semester: 'Spring', maxEnrollment: 25, difficulty: 'Hard', workload: 11, passRate: 76, avgGrade: 3.0 },
  { code: 'CS404', name: 'Cloud Computing', description: 'Cloud platforms and distributed systems', creditHours: 3, level: 4, department: 'CS', courseType: 'elective', instructor: 'Dr. Hassan Ali', semester: 'Both', maxEnrollment: 25, difficulty: 'Medium', workload: 10, passRate: 80, avgGrade: 3.1 },
  { code: 'CS405', name: 'Artificial Intelligence', description: 'AI concepts, search, reasoning', creditHours: 3, level: 4, department: 'CS', courseType: 'elective', instructor: 'Dr. Layla Hassan', semester: 'Fall', maxEnrollment: 25, difficulty: 'Hard', workload: 12, passRate: 73, avgGrade: 2.8 },

  // =============== MATHEMATICS (MATH) ===============
  // Level 1
  { code: 'MATH102', name: 'Statistics I', description: 'Descriptive and inferential statistics', creditHours: 3, level: 1, department: 'MATH', courseType: 'required', instructor: 'Dr. Amina Faisal', semester: 'Both', maxEnrollment: 45, difficulty: 'Medium', workload: 10, passRate: 75, avgGrade: 2.9 },
  { code: 'MATH103', name: 'Geometry', description: 'Euclidean and analytic geometry', creditHours: 3, level: 1, department: 'MATH', courseType: 'elective', instructor: 'Prof. Rashid Mansour', semester: 'Fall', maxEnrollment: 40, difficulty: 'Easy', workload: 8, passRate: 85, avgGrade: 3.3 },

  // Level 2
  { code: 'MATH202', name: 'Differential Equations', description: 'Ordinary differential equations', creditHours: 4, level: 2, department: 'MATH', courseType: 'required', instructor: 'Dr. Youssef Ibrahim', semester: 'Both', maxEnrollment: 38, difficulty: 'Hard', workload: 13, passRate: 64, avgGrade: 2.3 },
  { code: 'MATH203', name: 'Statistics II', description: 'Advanced statistical methods', creditHours: 3, level: 2, department: 'MATH', courseType: 'required', instructor: 'Dr. Nour Al-Nahyan', semester: 'Spring', maxEnrollment: 40, difficulty: 'Medium', workload: 11, passRate: 72, avgGrade: 2.7 },
  { code: 'MATH204', name: 'Discrete Mathematics', description: 'Combinatorics, graph theory, logic', creditHours: 3, level: 2, department: 'MATH', courseType: 'required', instructor: 'Dr. Salma Zahra', semester: 'Fall', maxEnrollment: 38, difficulty: 'Hard', workload: 12, passRate: 68, avgGrade: 2.5 },

  // Level 3
  { code: 'MATH302', name: 'Real Analysis', description: 'Rigorous calculus and analysis', creditHours: 4, level: 3, department: 'MATH', courseType: 'required', instructor: 'Dr. Omar Rashid', semester: 'Fall', maxEnrollment: 30, difficulty: 'Hard', workload: 14, passRate: 60, avgGrade: 2.2 },
  { code: 'MATH303', name: 'Abstract Algebra', description: 'Groups, rings, fields', creditHours: 4, level: 3, department: 'MATH', courseType: 'required', instructor: 'Dr. Layla Hassan', semester: 'Spring', maxEnrollment: 30, difficulty: 'Hard', workload: 13, passRate: 62, avgGrade: 2.3 },
  { code: 'MATH304', name: 'Probability Theory', description: 'Mathematical probability', creditHours: 3, level: 3, department: 'MATH', courseType: 'elective', instructor: 'Dr. Khaled Yousef', semester: 'Both', maxEnrollment: 32, difficulty: 'Medium', workload: 11, passRate: 74, avgGrade: 2.8 },

  // Level 4
  { code: 'MATH401', name: 'Numerical Analysis', description: 'Numerical methods for computation', creditHours: 3, level: 4, department: 'MATH', courseType: 'elective', instructor: 'Dr. Hassan Ali', semester: 'Fall', maxEnrollment: 25, difficulty: 'Hard', workload: 12, passRate: 70, avgGrade: 2.6 },
  { code: 'MATH402', name: 'Complex Analysis', description: 'Functions of complex variables', creditHours: 4, level: 4, department: 'MATH', courseType: 'elective', instructor: 'Dr. Fatima Khalil', semester: 'Spring', maxEnrollment: 25, difficulty: 'Hard', workload: 13, passRate: 65, avgGrade: 2.4 },

  // =============== ENGINEERING (ENG) ===============
  // Level 1
  { code: 'ENG103', name: 'Engineering Drawing', description: 'Technical drawing and CAD', creditHours: 3, level: 1, department: 'ENG', courseType: 'required', instructor: 'Prof. Tariq Mansour', semester: 'Both', maxEnrollment: 35, difficulty: 'Easy', workload: 8, passRate: 82, avgGrade: 3.1 },
  { code: 'ENG104', name: 'Engineering Materials', description: 'Properties of engineering materials', creditHours: 3, level: 1, department: 'ENG', courseType: 'required', instructor: 'Dr. Maha Karim', semester: 'Fall', maxEnrollment: 35, difficulty: 'Medium', workload: 9, passRate: 78, avgGrade: 2.9 },

  // Level 2
  { code: 'ENG201', name: 'Fluid Mechanics', description: 'Fluid statics and dynamics', creditHours: 3, level: 2, department: 'ENG', courseType: 'required', instructor: 'Dr. Hassan Ali', semester: 'Both', maxEnrollment: 32, difficulty: 'Hard', workload: 12, passRate: 68, avgGrade: 2.5 },
  { code: 'ENG202', name: 'Circuits and Electronics', description: 'Electrical circuits and components', creditHours: 4, level: 2, department: 'ENG', courseType: 'required', instructor: 'Dr. Omar Khalil', semester: 'Both', maxEnrollment: 30, difficulty: 'Hard', workload: 13, passRate: 65, avgGrade: 2.4 },
  { code: 'ENG203', name: 'Mechanical Design', description: 'Machine element design', creditHours: 3, level: 2, department: 'ENG', courseType: 'required', instructor: 'Dr. Nour Al-Din', semester: 'Spring', maxEnrollment: 30, difficulty: 'Medium', workload: 10, passRate: 74, avgGrade: 2.8 },

  // Level 3
  { code: 'ENG302', name: 'Control Systems', description: 'Feedback control and automation', creditHours: 3, level: 3, department: 'ENG', courseType: 'required', instructor: 'Dr. Layla Hassan', semester: 'Fall', maxEnrollment: 28, difficulty: 'Hard', workload: 12, passRate: 70, avgGrade: 2.6 },
  { code: 'ENG303', name: 'Heat Transfer', description: 'Conduction, convection, radiation', creditHours: 3, level: 3, department: 'ENG', courseType: 'required', instructor: 'Dr. Ahmed Rashid', semester: 'Spring', maxEnrollment: 28, difficulty: 'Hard', workload: 11, passRate: 72, avgGrade: 2.7 },
  { code: 'ENG304', name: 'Manufacturing Processes', description: 'Production methods and techniques', creditHours: 3, level: 3, department: 'ENG', courseType: 'elective', instructor: 'Prof. Salma Karim', semester: 'Both', maxEnrollment: 25, difficulty: 'Medium', workload: 9, passRate: 80, avgGrade: 3.0 },

  // Level 4
  { code: 'ENG401', name: 'Robotics', description: 'Robot kinematics and control', creditHours: 3, level: 4, department: 'ENG', courseType: 'elective', instructor: 'Dr. Khaled Omar', semester: 'Fall', maxEnrollment: 22, difficulty: 'Hard', workload: 13, passRate: 74, avgGrade: 2.8 },
  { code: 'ENG402', name: 'Renewable Energy Systems', description: 'Solar, wind, and sustainable energy', creditHours: 3, level: 4, department: 'ENG', courseType: 'elective', instructor: 'Dr. Hassan Ali', semester: 'Spring', maxEnrollment: 25, difficulty: 'Medium', workload: 10, passRate: 82, avgGrade: 3.1 },

  // =============== BUSINESS (BUS) ===============
  // Level 1
  { code: 'BUS102', name: 'Business Statistics', description: 'Statistical methods for business', creditHours: 3, level: 1, department: 'BUS', courseType: 'required', instructor: 'Dr. Amina Salem', semester: 'Both', maxEnrollment: 50, difficulty: 'Medium', workload: 9, passRate: 80, avgGrade: 3.0 },
  { code: 'BUS103', name: 'Business Communication', description: 'Professional writing and presentation', creditHours: 3, level: 1, department: 'BUS', courseType: 'required', instructor: 'Prof. Sara Nasser', semester: 'Both', maxEnrollment: 45, difficulty: 'Easy', workload: 7, passRate: 90, avgGrade: 3.5 },

  // Level 2
  { code: 'BUS202', name: 'Accounting Principles', description: 'Financial and managerial accounting', creditHours: 3, level: 2, department: 'BUS', courseType: 'required', instructor: 'Dr. Khaled Yousef', semester: 'Both', maxEnrollment: 42, difficulty: 'Medium', workload: 10, passRate: 76, avgGrade: 2.9 },
  { code: 'BUS203', name: 'Business Law', description: 'Legal environment of business', creditHours: 3, level: 2, department: 'BUS', courseType: 'required', instructor: 'Prof. Rashid Hamdan', semester: 'Fall', maxEnrollment: 40, difficulty: 'Medium', workload: 9, passRate: 82, avgGrade: 3.1 },
  { code: 'BUS204', name: 'Organizational Behavior', description: 'Human behavior in organizations', creditHours: 3, level: 2, department: 'BUS', courseType: 'required', instructor: 'Dr. Layla Omar', semester: 'Spring', maxEnrollment: 38, difficulty: 'Easy', workload: 8, passRate: 86, avgGrade: 3.3 },

  // Level 3
  { code: 'BUS302', name: 'Operations Management', description: 'Production and service operations', creditHours: 3, level: 3, department: 'BUS', courseType: 'required', instructor: 'Dr. Hassan Mahmoud', semester: 'Both', maxEnrollment: 35, difficulty: 'Medium', workload: 10, passRate: 78, avgGrade: 3.0 },
  { code: 'BUS303', name: 'International Business', description: 'Global business strategies', creditHours: 3, level: 3, department: 'BUS', courseType: 'elective', instructor: 'Dr. Omar Rashid', semester: 'Fall', maxEnrollment: 32, difficulty: 'Medium', workload: 9, passRate: 84, avgGrade: 3.2 },
  { code: 'BUS304', name: 'Business Ethics', description: 'Ethical decision making in business', creditHours: 3, level: 3, department: 'BUS', courseType: 'required', instructor: 'Prof. Fatima Khalil', semester: 'Both', maxEnrollment: 35, difficulty: 'Easy', workload: 7, passRate: 88, avgGrade: 3.4 },

  // Level 4
  { code: 'BUS401', name: 'Strategic Management', description: 'Corporate strategy and planning', creditHours: 3, level: 4, department: 'BUS', courseType: 'required', instructor: 'Dr. Amina Salem', semester: 'Fall', maxEnrollment: 28, difficulty: 'Hard', workload: 11, passRate: 72, avgGrade: 2.7 },
  { code: 'BUS402', name: 'Entrepreneurship', description: 'Starting and managing new ventures', creditHours: 3, level: 4, department: 'BUS', courseType: 'elective', instructor: 'Prof. Khaled Omar', semester: 'Spring', maxEnrollment: 25, difficulty: 'Medium', workload: 9, passRate: 85, avgGrade: 3.3 },

  // =============== GENERAL EDUCATION ===============
  { code: 'ENG201', name: 'Academic Writing', description: 'Advanced composition and research', creditHours: 3, level: 2, department: 'ENGL', courseType: 'general_education', instructor: 'Prof. Layla Faisal', semester: 'Both', maxEnrollment: 55, difficulty: 'Medium', workload: 9, passRate: 82, avgGrade: 3.1 },
  { code: 'HIST201', name: 'Middle Eastern History', description: 'History of the Middle East', creditHours: 3, level: 2, department: 'HIST', courseType: 'general_education', instructor: 'Dr. Jamila Faisal', semester: 'Both', maxEnrollment: 60, difficulty: 'Easy', workload: 7, passRate: 88, avgGrade: 3.4 },
  { code: 'PSYCH101', name: 'Introduction to Psychology', description: 'Basic psychological concepts', creditHours: 3, level: 1, department: 'PSYCH', courseType: 'general_education', instructor: 'Dr. Sara Ahmed', semester: 'Both', maxEnrollment: 65, difficulty: 'Easy', workload: 7, passRate: 90, avgGrade: 3.5 },
  { code: 'ECON101', name: 'Principles of Economics', description: 'Micro and macroeconomics basics', creditHours: 3, level: 1, department: 'ECON', courseType: 'general_education', instructor: 'Dr. Youssef Ibrahim', semester: 'Both', maxEnrollment: 70, difficulty: 'Medium', workload: 9, passRate: 78, avgGrade: 2.9 },
  { code: 'BIO101', name: 'General Biology', description: 'Introduction to life sciences', creditHours: 4, level: 1, department: 'SCI', courseType: 'general_education', instructor: 'Dr. Nour Al-Nahyan', semester: 'Both', maxEnrollment: 50, difficulty: 'Medium', workload: 10, passRate: 76, avgGrade: 2.8 },
  { code: 'CHEM101', name: 'General Chemistry', description: 'Fundamental chemistry principles', creditHours: 4, level: 1, department: 'SCI', courseType: 'general_education', instructor: 'Dr. Hassan Ali', semester: 'Both', maxEnrollment: 48, difficulty: 'Hard', workload: 12, passRate: 70, avgGrade: 2.6 },
  { code: 'PHIL201', name: 'Ethics and Society', description: 'Ethical theories and applications', creditHours: 3, level: 2, department: 'PHIL', courseType: 'general_education', instructor: 'Dr. Rashid Hamdan', semester: 'Fall', maxEnrollment: 50, difficulty: 'Medium', workload: 8, passRate: 84, avgGrade: 3.2 },
  { code: 'SOC101', name: 'Introduction to Sociology', description: 'Society, culture, and social structures', creditHours: 3, level: 1, department: 'SOC', courseType: 'general_education', instructor: 'Prof. Maha Karim', semester: 'Both', maxEnrollment: 60, difficulty: 'Easy', workload: 7, passRate: 87, avgGrade: 3.3 },
  { code: 'ART201', name: 'Art History', description: 'Survey of world art history', creditHours: 3, level: 2, department: 'ART', courseType: 'elective', instructor: 'Prof. Layla Omar', semester: 'Spring', maxEnrollment: 40, difficulty: 'Easy', workload: 6, passRate: 92, avgGrade: 3.6 },
  { code: 'MUS101', name: 'Music Appreciation', description: 'Introduction to music theory and history', creditHours: 3, level: 1, department: 'MUS', courseType: 'elective', instructor: 'Prof. Amina Faisal', semester: 'Both', maxEnrollment: 45, difficulty: 'Easy', workload: 6, passRate: 94, avgGrade: 3.7 },
];

try {
  console.log(`📚 Preparing to insert ${courses.length} courses...\n`);

  // Prepare insert statement
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO course_catalog (
      course_code, course_name, description, credit_hours, level,
      department, course_type, instructor_name, semester_offered,
      max_enrollment, difficulty_level, estimated_workload_hours,
      historical_pass_rate, average_grade
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Use transaction for performance
  const insertMany = db.transaction((coursesToInsert: Course[]) => {
    let insertedCount = 0;
    for (const course of coursesToInsert) {
      const result = insertStmt.run(
        course.code,
        course.name,
        course.description,
        course.creditHours,
        course.level,
        course.department,
        course.courseType,
        course.instructor,
        course.semester,
        course.maxEnrollment,
        course.difficulty,
        course.workload,
        course.passRate,
        course.avgGrade
      );
      if (result.changes > 0) insertedCount++;
    }
    return insertedCount;
  });

  const inserted = insertMany(courses);

  console.log(`✅ Inserted ${inserted} new courses\n`);

  // Verify and show statistics
  const stats = db.prepare(`
    SELECT
      department,
      COUNT(*) as count,
      AVG(historical_pass_rate) as avg_pass_rate,
      AVG(average_grade) as avg_grade
    FROM course_catalog
    GROUP BY department
    ORDER BY count DESC
  `).all() as any[];

  console.log('📊 Course Catalog Statistics:\n');
  stats.forEach(stat => {
    console.log(`   ${stat.department}: ${stat.count} courses | Avg Pass Rate: ${stat.avg_pass_rate.toFixed(1)}% | Avg Grade: ${stat.avg_grade.toFixed(2)}`);
  });

  const totalCourses = db.prepare('SELECT COUNT(*) as count FROM course_catalog').get() as any;
  console.log(`\n✅ Total courses in catalog: ${totalCourses.count}\n`);

  console.log('🎉 Course catalog seeding completed successfully!\n');

} catch (error: any) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
