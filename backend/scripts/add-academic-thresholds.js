"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/config/database");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Migration script to create and populate academic_thresholds table
 * Phase 2.1: Academic Thresholds System
 */
function addAcademicThresholdsTable() {
    try {
        console.log('========================================');
        console.log('  Academic Thresholds Table Migration');
        console.log('========================================\n');
        // Read migration files
        const migrationPath = path_1.default.join(__dirname, '../../database/migrations/add_academic_thresholds_table.sql');
        const seedPath = path_1.default.join(__dirname, '../../database/migrations/seed_academic_thresholds.sql');
        console.log(`📄 Reading migration file: ${migrationPath}`);
        if (!fs_1.default.existsSync(migrationPath)) {
            throw new Error(`Migration file not found at: ${migrationPath}`);
        }
        if (!fs_1.default.existsSync(seedPath)) {
            throw new Error(`Seed file not found at: ${seedPath}`);
        }
        const migrationSQL = fs_1.default.readFileSync(migrationPath, 'utf8');
        const seedSQL = fs_1.default.readFileSync(seedPath, 'utf8');
        console.log('🔄 Executing migration...\n');
        // Execute the entire migration as a single transaction for data integrity
        database_1.db.exec('BEGIN TRANSACTION');
        try {
            // Execute the table creation
            console.log('  📋 Creating academic_thresholds table...');
            database_1.db.exec(migrationSQL);
            console.log('  ✅ Table created successfully');
            // Execute the seed data
            console.log('  📋 Inserting threshold records...');
            database_1.db.exec(seedSQL);
            console.log('  ✅ Seed data inserted successfully');
            database_1.db.exec('COMMIT');
            console.log('\n✅ Migration executed successfully!\n');
            // Verify table creation
            console.log('🔍 Verifying table structure...');
            const tableInfo = database_1.db.prepare("PRAGMA table_info(academic_thresholds)").all();
            if (tableInfo.length === 0) {
                throw new Error('Table was not created successfully');
            }
            console.log('\n📊 academic_thresholds table structure:');
            console.log('-------------------------------------------');
            tableInfo.forEach((col) => {
                console.log(`  ${col.name.padEnd(25)} ${col.type.padEnd(15)} ${col.notnull ? 'NOT NULL' : ''}`);
            });
            // Verify indexes
            console.log('\n🔍 Verifying indexes...');
            const indexes = database_1.db.prepare("PRAGMA index_list(academic_thresholds)").all();
            console.log('\n📑 Table Indexes:');
            console.log('-------------------------------------------');
            indexes.forEach((idx) => {
                console.log(`  ${idx.name.padEnd(40)} ${idx.unique ? 'UNIQUE' : 'INDEX'}`);
            });
            // Verify triggers
            console.log('\n🔍 Verifying triggers...');
            const triggers = database_1.db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type = 'trigger' AND tbl_name = 'academic_thresholds'
      `).all();
            console.log('\n⚡ Table Triggers:');
            console.log('-------------------------------------------');
            triggers.forEach((trigger) => {
                console.log(`  ${trigger.name}`);
            });
            // Verify data insertion
            console.log('\n🔍 Verifying data insertion...');
            const count = database_1.db.prepare('SELECT COUNT(*) as count FROM academic_thresholds').get();
            console.log('\n📈 Academic Thresholds Summary:');
            console.log('-------------------------------------------');
            console.log(`  Total threshold records: ${count.count}`);
            // Display all thresholds
            console.log('\n📋 Academic Threshold Details:');
            console.log('===========================================\n');
            const thresholds = database_1.db.prepare(`
        SELECT
          honor_type,
          min_gpa,
          max_gpa,
          description
        FROM academic_thresholds
        ORDER BY min_gpa DESC
      `).all();
            const honorTypeLabels = {
                'highest_honors': 'Highest Honors (Summa Cum Laude)',
                'high_honors': 'High Honors (Magna Cum Laude)',
                'honors': 'Honors (Cum Laude)',
                'dean_list': 'Dean\'s List',
                'academic_probation': 'Academic Probation'
            };
            thresholds.forEach((threshold) => {
                const label = honorTypeLabels[threshold.honor_type] || threshold.honor_type;
                console.log(`  ${label}`);
                console.log(`  ${'─'.repeat(45)}`);
                console.log(`  GPA Range: ${threshold.min_gpa.toFixed(2)} - ${threshold.max_gpa.toFixed(2)}`);
                console.log(`  ${threshold.description}`);
                console.log('');
            });
            // Test query: Find thresholds for sample GPAs
            console.log('\n🧪 Testing Threshold Queries:');
            console.log('-------------------------------------------\n');
            const testGPAs = [4.0, 3.8, 3.6, 3.3, 1.5];
            testGPAs.forEach(gpa => {
                const result = database_1.db.prepare(`
          SELECT honor_type, min_gpa, max_gpa
          FROM academic_thresholds
          WHERE ? BETWEEN min_gpa AND max_gpa
          ORDER BY min_gpa DESC
          LIMIT 1
        `).get(gpa);
                if (result) {
                    const label = honorTypeLabels[result.honor_type] || result.honor_type;
                    console.log(`  GPA ${gpa.toFixed(2)} → ${label}`);
                }
                else {
                    console.log(`  GPA ${gpa.toFixed(2)} → No threshold match (Regular Standing)`);
                }
            });
            console.log('\n========================================');
            console.log('  Migration Complete!');
            console.log('========================================\n');
            console.log('✅ academic_thresholds table created successfully');
            console.log(`✅ ${count.count} threshold records inserted`);
            console.log('✅ Indexes and triggers created');
            console.log('✅ Ready for AI integration\n');
            return true;
        }
        catch (error) {
            database_1.db.exec('ROLLBACK');
            throw error;
        }
    }
    catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\nStack trace:', error.stack);
        return false;
    }
}
// Run the migration
console.log('Starting academic thresholds migration...\n');
const success = addAcademicThresholdsTable();
if (success) {
    console.log('🎉 Academic thresholds table is ready!');
    console.log('Next step: Implement GPA evaluation functions\n');
    process.exit(0);
}
else {
    console.error('⚠️  Migration failed. Please check errors above.\n');
    process.exit(1);
}
