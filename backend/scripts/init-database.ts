import { db } from '../src/config/database';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function initDatabase() {
  try {
    console.log('========================================');
    console.log('  Database Initialization');
    console.log('========================================\n');

    const schemaPath = path.join(__dirname, '../../database/schema-sqlite.sql');

    console.log(`📄 Reading schema file: ${schemaPath}`);
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('🚀 Executing schema...\n');

    // Execute the entire schema
    db.exec(schemaSQL);

    console.log('✅ Schema executed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tables: any[] = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();

    console.log(`📊 Found ${tables.length} tables:`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.name}`);
    });

    // Check data counts
    console.log('\n📈 Checking initial data:');
    const levels: any = db.prepare('SELECT COUNT(*) as count FROM levels').get();
    const sections: any = db.prepare('SELECT COUNT(*) as count FROM sections').get();
    const faqs: any = db.prepare('SELECT COUNT(*) as count FROM faqs').get();

    console.log(`   Levels: ${levels.count}`);
    console.log(`   Sections: ${sections.count}`);
    console.log(`   FAQs: ${faqs.count}`);

    console.log('\n========================================');
    console.log('  ✅ Database initialized successfully!');
    console.log('========================================\n');

  } catch (error: any) {
    console.error('\n========================================');
    console.error('  ❌ Database initialization failed!');
    console.error('========================================\n');
    console.error('Error:', error.message);
    console.error('\n');
    process.exit(1);
  }
}

// Run the initialization
initDatabase();
