import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../mentorlink.db');
const migrationsDir = path.join(__dirname, '../database/migrations/phase3');

console.log('🚀 Starting Phase 3 Migrations...\n');
console.log(`📁 Database: ${dbPath}`);
console.log(`📂 Migrations Directory: ${migrationsDir}\n`);

// Connect to database
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

try {
  // Get all migration files
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensure migrations run in order

  console.log(`Found ${migrationFiles.length} migration files:\n`);

  // Execute each migration
  for (const file of migrationFiles) {
    console.log(`⏳ Running migration: ${file}`);

    const migrationPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    try {
      // Execute all statements in the migration file
      db.exec(sql);
      console.log(`✅ Migration successful: ${file}\n`);
    } catch (error: any) {
      console.error(`❌ Migration failed: ${file}`);
      console.error(`Error: ${error.message}\n`);
      process.exit(1);
    }
  }

  // Verify tables were created
  console.log('🔍 Verifying tables...\n');

  const expectedTables = [
    'student_gpa_history',
    'student_attendance_history',
    'advisor_alerts',
    'course_prerequisites',
    'course_catalog',
    'student_course_recommendations'
  ];

  const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table'
    AND name IN (${expectedTables.map(() => '?').join(',')})
    ORDER BY name
  `).all(...expectedTables) as any[];

  console.log(`✅ Created ${tables.length}/${expectedTables.length} Phase 3 tables:`);
  tables.forEach(table => console.log(`   - ${table.name}`));

  if (tables.length < expectedTables.length) {
    const missing = expectedTables.filter(t => !tables.find(table => table.name === t));
    console.log(`\n⚠️  Missing tables: ${missing.join(', ')}`);
  }

  // Verify indexes
  console.log('\n🔍 Verifying indexes...\n');
  const indexes = db.prepare(`
    SELECT name, tbl_name FROM sqlite_master
    WHERE type='index'
    AND tbl_name IN (${expectedTables.map(() => '?').join(',')})
    ORDER BY tbl_name, name
  `).all(...expectedTables) as any[];

  console.log(`✅ Created ${indexes.length} indexes:`);

  let currentTable = '';
  indexes.forEach(idx => {
    if (idx.tbl_name !== currentTable) {
      console.log(`\n   ${idx.tbl_name}:`);
      currentTable = idx.tbl_name;
    }
    console.log(`     - ${idx.name}`);
  });

  // Show table schemas
  console.log('\n📋 Table Schemas:\n');

  tables.forEach(table => {
    const schema = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(table.name) as any;
    if (schema) {
      console.log(`${table.name}:`);
      console.log(schema.sql.split('\n').map((line: string) => '  ' + line).join('\n'));
      console.log('');
    }
  });

  console.log('\n🎉 Phase 3 migrations completed successfully!\n');

} catch (error: any) {
  console.error('❌ Migration process failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
