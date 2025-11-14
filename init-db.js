// Database Initialization Script
const Database = require('better-sqlite3');
const fs = require('fs');

const dbPath = '/app/data/mentorlink.db';
const schemaPath = '/tmp/schema.sql';

console.log('========================================');
console.log('   Database Initialization');
console.log('========================================');
console.log('');

try {
  // Read the schema file
  console.log('📄 Reading schema file...');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Connect to database
  console.log('🔌 Connecting to database...');
  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Execute the schema
  console.log('🚀 Executing schema...');
  db.exec(schema);

  // Verify tables were created
  console.log('');
  console.log('✅ Verifying tables...');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();

  console.log(`📊 Found ${tables.length} tables:`);
  tables.forEach((table, index) => {
    console.log(`   ${index + 1}. ${table.name}`);
  });

  // Check row counts
  console.log('');
  console.log('📈 Data counts:');
  const levels = db.prepare('SELECT COUNT(*) as count FROM levels').get();
  const sections = db.prepare('SELECT COUNT(*) as count FROM sections').get();
  const faqs = db.prepare('SELECT COUNT(*) as count FROM faqs').get();

  console.log(`   Levels: ${levels.count}`);
  console.log(`   Sections: ${sections.count}`);
  console.log(`   FAQs: ${faqs.count}`);

  db.close();

  console.log('');
  console.log('========================================');
  console.log('   ✅ Database initialized successfully!');
  console.log('========================================');

  process.exit(0);
} catch (error) {
  console.error('');
  console.error('========================================');
  console.error('   ❌ Database initialization failed!');
  console.error('========================================');
  console.error('');
  console.error('Error:', error.message);
  console.error('');
  process.exit(1);
}
