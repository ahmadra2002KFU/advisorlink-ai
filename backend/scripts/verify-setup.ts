import { db } from '../src/config/database';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

function verifySetup() {
  console.log('🔍 MentorLink Setup Verification\n');
  console.log('================================\n');

  let allChecks = true;

  try {
    // Check 1: Database file exists
    console.log('1️⃣  Checking if database file exists...');
    const dbPath = process.env.DB_PATH || path.join(__dirname, '../../mentorlink.db');

    if (!fs.existsSync(dbPath)) {
      console.log('   ❌ Database file not found');
      console.log(`   Expected location: ${dbPath}`);
      console.log('   👉 Run: npm run seed\n');
      allChecks = false;

      // Create empty database file for following checks
      console.log('   Creating empty database file...\n');
    } else {
      console.log(`   ✅ Database file exists at: ${dbPath}\n`);
    }

    // Check 2: Tables exist
    console.log('2️⃣  Checking tables...');
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all();

    const tableNames = tables.map((t: any) => t.name);

    const requiredTables = [
      'users', 'students', 'advisors', 'levels', 'sections',
      'conversations', 'messages', 'faqs', 'advisor_assignments',
      'student_courses', 'ai_chat_history'
    ];

    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      console.log(`   ❌ Missing tables: ${missingTables.join(', ')}`);
      console.log('   👉 Run: npm run seed\n');
      allChecks = false;
    } else {
      console.log(`   ✅ All ${requiredTables.length} tables exist\n`);

      // Check 3: Data seeded
      console.log('3️⃣  Checking if data is seeded...');

      const userCount: any = db.prepare('SELECT COUNT(*) as count FROM users').get();
      const advisorCount: any = db.prepare('SELECT COUNT(*) as count FROM advisors').get();
      const studentCount: any = db.prepare('SELECT COUNT(*) as count FROM students').get();
      const faqCount: any = db.prepare('SELECT COUNT(*) as count FROM faqs').get();

      console.log(`   Users: ${userCount.count}`);
      console.log(`   Advisors: ${advisorCount.count}`);
      console.log(`   Students: ${studentCount.count}`);
      console.log(`   FAQs: ${faqCount.count}`);

      if (userCount.count === 0) {
        console.log('\n   ❌ No data found - database is empty');
        console.log('   👉 Run: npm run seed\n');
        allChecks = false;
      } else if (studentCount.count < 300) {
        console.log('\n   ⚠️  Expected 300 students, found ' + studentCount.count);
        console.log('   👉 Consider running: npm run seed\n');
      } else {
        console.log('\n   ✅ Database is fully seeded\n');
      }
    }

    // Check 4: Gemini API Key
    console.log('4️⃣  Checking Gemini API key...');
    if (!process.env.GEMINI_API_KEY) {
      console.log('   ❌ GEMINI_API_KEY not set in .env');
      allChecks = false;
    } else {
      console.log(`   ✅ Gemini API key configured\n`);
    }

    // Summary
    console.log('================================\n');
    if (allChecks) {
      console.log('✅ ALL CHECKS PASSED!');
      console.log('\n🚀 You can now start the server:');
      console.log('   npm run dev\n');
    } else {
      console.log('❌ SOME CHECKS FAILED');
      console.log('\n📖 Please follow the instructions above to fix issues.\n');
    }

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n💡 Make sure the database file exists.');
    console.log('   Run: npm run seed\n');
  }
}

verifySetup();
