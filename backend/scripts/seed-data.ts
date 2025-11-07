import { db } from '../src/config/database';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Sample data arrays
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

const courses = [
  'Introduction to Computer Science', 'Calculus I', 'Calculus II', 'Physics I',
  'Physics II', 'English Composition', 'World History', 'Microeconomics',
  'Macroeconomics', 'General Chemistry', 'Organic Chemistry', 'Biology 101',
  'Statistics', 'Linear Algebra', 'Data Structures', 'Algorithms',
  'Database Systems', 'Web Development', 'Mobile Development', 'AI Fundamentals',
  'Business Ethics', 'Marketing Principles', 'Financial Accounting',
  'Managerial Accounting', 'Public Speaking', 'Technical Writing'
];

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

function seedDatabase() {
  try {
    console.log('Loading SQLite database...');

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
    console.log('\n--- Creating 300 Students (60 per level, 20 per section) ---');
    let totalStudents = 0;

    // Prepare statements for better performance
    const insertUserStmt = db.prepare('INSERT INTO users (email, password_hash, full_name, user_type) VALUES (?, ?, ?, ?)');
    const insertStudentStmt = db.prepare('INSERT INTO students (user_id, student_id, birthdate, level_id, section_id, gpa, attendance_percentage) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertCourseStmt = db.prepare('INSERT INTO student_courses (student_id, course_name, course_code) VALUES (?, ?, ?)');
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

          // Assign random courses (3-5 courses)
          const numCourses = randomInt(3, 5);
          const assignedCourses = new Set<string>();

          while (assignedCourses.size < numCourses) {
            assignedCourses.add(randomElement(courses));
          }

          for (const course of assignedCourses) {
            insertCourseStmt.run(studentDbId, course, `CS${randomInt(100, 499)}`);
          }

          // Auto-assign to advisor (load-balanced: least assigned)
          // Get advisors for this level
          const levelAdvisorIds = advisorIds.slice(
            (level.level_number - 1) * 6,
            level.level_number * 6
          );

          // Count assignments for each advisor
          const advisorLoads = levelAdvisorIds.map((advisorId) => {
            const result: any = countAssignmentsStmt.get(advisorId);
            return { advisorId, count: result.count };
          });

          // Find advisor with least students
          const leastLoadedAdvisor = advisorLoads.reduce((min, current) =>
            current.count < min.count ? current : min
          );

          // Assign student to advisor
          insertAssignmentStmt.run(studentDbId, leastLoadedAdvisor.advisorId);

          totalStudents++;

          if (i % 5 === 0) {
            console.log(`    Created ${i}/20 students...`);
          }
        }
      }
    }

    console.log(`\n✓ Total students created: ${totalStudents}`);

    // ====================
    // 4. CREATE SAMPLE CONVERSATIONS
    // ====================
    console.log('\n--- Creating Sample Conversations ---');

    // Get all students and advisors
    const allStudents = db.prepare('SELECT * FROM students ORDER BY RANDOM() LIMIT 50').all();

    let conversationCount = 0;

    const getAssignmentStmt = db.prepare('SELECT advisor_id FROM advisor_assignments WHERE student_id = ?');
    const getAdvisorStmt = db.prepare('SELECT user_id FROM advisors WHERE id = ?');
    const insertConversationStmt = db.prepare('INSERT INTO conversations (student_id, advisor_id, status) VALUES (?, ?, ?)');
    const insertMessageStmt = db.prepare('INSERT INTO messages (conversation_id, sender_id, message_text, is_read) VALUES (?, ?, ?, ?)');

    for (const student of allStudents as any[]) {
      // Get student's advisor
      const assignment: any = getAssignmentStmt.get(student.id);

      if (assignment) {
        const advisorId = assignment.advisor_id;

        // Get advisor's user_id
        const advisor: any = getAdvisorStmt.get(advisorId);

        // Create conversation
        const convResult = insertConversationStmt.run(
          student.id,
          advisorId,
          randomElement(['active', 'active', 'active', 'resolved'])
        );

        const conversationId = convResult.lastInsertRowid;

        // Add 2-5 messages
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
    console.log('         DATABASE SEED COMPLETE         ');
    console.log('========================================');

    const stats: any = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM advisors) as total_advisors,
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM conversations) as total_conversations,
        (SELECT COUNT(*) FROM messages) as total_messages,
        (SELECT COUNT(*) FROM ai_chat_history) as total_ai_chats,
        (SELECT COUNT(*) FROM faqs) as total_faqs
    `).get();

    console.log('\nDatabase Statistics:');
    console.log('-------------------');
    console.log(`Total Users:        ${stats.total_users}`);
    console.log(`  - Advisors:       ${stats.total_advisors}`);
    console.log(`  - Students:       ${stats.total_students}`);
    console.log(`  - Admins:         1`);
    console.log(`Conversations:      ${stats.total_conversations}`);
    console.log(`Messages:           ${stats.total_messages}`);
    console.log(`AI Chat History:    ${stats.total_ai_chats}`);
    console.log(`FAQs:               ${stats.total_faqs}`);

    console.log('\n📧 LOGIN CREDENTIALS:');
    console.log('====================');
    console.log('Admin:   admin@mentorlink.com / password123');
    console.log('Advisor: advisor.l1.1@mentorlink.com / password123');
    console.log('Student: s1a001@student.mentorlink.com / password123');
    console.log('\n✅ Seed complete! You can now start the backend server.');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seedDatabase();
