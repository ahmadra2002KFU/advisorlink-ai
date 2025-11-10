import { db } from '../src/config/database';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function runMigration() {
  try {
    console.log('========================================');
    console.log('  Running Database Migration');
    console.log('========================================\n');

    const migrationPath = path.join(__dirname, '../../database/migrations/add_course_details.sql');

    console.log(`📄 Reading migration file: ${migrationPath}`);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Executing migration...\n');

    // Remove all comments (lines starting with -- and inline comments)
    const cleanSQL = migrationSQL
      .split('\n')
      .map(line => {
        // Remove inline comments (everything after -- on the same line)
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .join('\n');

    // Split by semicolon and execute each ALTER TABLE separately
    const statements = cleanSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    let executedCount = 0;

    for (const statement of statements) {
      if (statement.includes('ALTER TABLE') && statement.includes('ADD COLUMN')) {
        try {
          db.exec(statement + ';');
          executedCount++;

          // Extract column name from statement for logging
          const match = statement.match(/ADD COLUMN (\w+)/);
          if (match) {
            console.log(`  ✓ Added column: ${match[1]}`);
          }
        } catch (error: any) {
          if (error.message.includes('duplicate column name')) {
            const match = statement.match(/ADD COLUMN (\w+)/);
            console.log(`  ⚠️  Column already exists: ${match?.[1]}`);
          } else {
            console.error(`  ❌ Error adding column:`, error.message);
            throw error;
          }
        }
      }
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   ${executedCount} columns added/verified\n`);

    // Verify the schema
    console.log('🔍 Verifying new schema...');
    const tableInfo: any = db.prepare("PRAGMA table_info(student_courses)").all();

    console.log('\n📊 Current student_courses table structure:');
    console.log('-------------------------------------------');
    tableInfo.forEach((col: any) => {
      console.log(`  ${col.name.padEnd(25)} ${col.type.padEnd(10)} ${col.notnull ? 'NOT NULL' : ''}`);
    });

    console.log('\n========================================');
    console.log('  Migration Complete!');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
runMigration();
