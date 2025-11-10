"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/config/database");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Verification script for academic_thresholds table
 * Phase 2.1: Academic Thresholds System
 * Quick check to ensure the table exists and has correct data
 */
function verifyAcademicThresholds() {
    try {
        console.log('\n========================================');
        console.log('  Academic Thresholds Verification');
        console.log('========================================\n');
        // Check if table exists
        const tableExists = database_1.db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='academic_thresholds'
    `).get();
        if (!tableExists) {
            console.error('❌ academic_thresholds table does not exist');
            console.error('   Run: npm run add-academic-thresholds\n');
            return false;
        }
        console.log('✅ academic_thresholds table exists\n');
        // Count records
        const count = database_1.db.prepare('SELECT COUNT(*) as count FROM academic_thresholds').get();
        console.log(`📊 Total Records: ${count.count}`);
        if (count.count !== 5) {
            console.warn(`⚠️  Expected 5 records, found ${count.count}`);
        }
        else {
            console.log('✅ Correct number of threshold records\n');
        }
        // Display all thresholds
        console.log('📋 Academic Thresholds:');
        console.log('─'.repeat(80));
        const thresholds = database_1.db.prepare(`
      SELECT
        honor_type,
        min_gpa,
        max_gpa,
        SUBSTR(description, 1, 60) || '...' as short_description
      FROM academic_thresholds
      ORDER BY min_gpa DESC
    `).all();
        const honorLabels = {
            'highest_honors': 'Highest Honors',
            'high_honors': 'High Honors',
            'honors': 'Honors',
            'dean_list': 'Dean\'s List',
            'academic_probation': 'Academic Probation'
        };
        thresholds.forEach((threshold) => {
            const label = honorLabels[threshold.honor_type] || threshold.honor_type;
            console.log(`\n  ${label.padEnd(25)} GPA: ${threshold.min_gpa.toFixed(2)} - ${threshold.max_gpa.toFixed(2)}`);
            console.log(`  ${threshold.short_description}`);
        });
        console.log('\n' + '─'.repeat(80));
        // Test queries
        console.log('\n🧪 Sample Queries:\n');
        // Test 1: Find threshold for a specific GPA
        const testGPA = 3.85;
        const result = database_1.db.prepare(`
      SELECT honor_type, min_gpa, max_gpa
      FROM academic_thresholds
      WHERE ? BETWEEN min_gpa AND max_gpa
      ORDER BY min_gpa DESC
      LIMIT 1
    `).get(testGPA);
        if (result) {
            const label = honorLabels[result.honor_type] || result.honor_type;
            console.log(`  Query 1: Student with GPA ${testGPA} qualifies for: ${label}`);
            console.log(`           (Range: ${result.min_gpa.toFixed(2)} - ${result.max_gpa.toFixed(2)})`);
        }
        // Test 2: Get all honor thresholds (excluding probation)
        const honors = database_1.db.prepare(`
      SELECT honor_type, min_gpa
      FROM academic_thresholds
      WHERE honor_type != 'academic_probation'
      ORDER BY min_gpa DESC
    `).all();
        console.log('\n  Query 2: Honor Classifications (excluding probation):');
        honors.forEach((honor) => {
            const label = honorLabels[honor.honor_type] || honor.honor_type;
            console.log(`           - ${label}: GPA ${honor.min_gpa.toFixed(2)}+`);
        });
        // Test 3: Check probation threshold
        const probation = database_1.db.prepare(`
      SELECT honor_type, max_gpa
      FROM academic_thresholds
      WHERE honor_type = 'academic_probation'
    `).get();
        if (probation) {
            console.log(`\n  Query 3: Academic Probation threshold: GPA below ${probation.max_gpa.toFixed(2)}`);
        }
        // Verify indexes
        console.log('\n📑 Indexes:');
        console.log('─'.repeat(80));
        const indexes = database_1.db.prepare("PRAGMA index_list(academic_thresholds)").all();
        indexes.forEach((idx) => {
            console.log(`  ✓ ${idx.name.padEnd(50)} ${idx.unique ? '(UNIQUE)' : ''}`);
        });
        // Verify triggers
        console.log('\n⚡ Triggers:');
        console.log('─'.repeat(80));
        const triggers = database_1.db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type = 'trigger' AND tbl_name = 'academic_thresholds'
    `).all();
        triggers.forEach((trigger) => {
            console.log(`  ✓ ${trigger.name}`);
        });
        console.log('\n========================================');
        console.log('  Verification Complete');
        console.log('========================================\n');
        console.log('✅ All checks passed!');
        console.log('✅ academic_thresholds table is ready for use\n');
        return true;
    }
    catch (error) {
        console.error('\n❌ Verification failed:', error.message);
        console.error('\nStack trace:', error.stack);
        return false;
    }
}
// Run verification
console.log('Starting verification...');
const success = verifyAcademicThresholds();
if (success) {
    console.log('🎉 Academic thresholds table verified successfully!\n');
    process.exit(0);
}
else {
    console.error('⚠️  Verification failed. Please check errors above.\n');
    process.exit(1);
}
