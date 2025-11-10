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
 * Migration script to create and populate staff_contacts table
 * Phase 1.3: Staff Contacts Integration
 */
function addStaffContactsTable() {
    try {
        console.log('========================================');
        console.log('  Staff Contacts Table Migration');
        console.log('========================================\n');
        // Read migration file
        const migrationPath = path_1.default.join(__dirname, '../../database/migrations/add_staff_contacts_table.sql');
        console.log(`📄 Reading migration file: ${migrationPath}`);
        if (!fs_1.default.existsSync(migrationPath)) {
            throw new Error(`Migration file not found at: ${migrationPath}`);
        }
        const migrationSQL = fs_1.default.readFileSync(migrationPath, 'utf8');
        console.log('🔄 Executing migration...\n');
        // Execute the entire migration as a single transaction for data integrity
        database_1.db.exec('BEGIN TRANSACTION');
        try {
            // Execute the migration SQL
            database_1.db.exec(migrationSQL);
            database_1.db.exec('COMMIT');
            console.log('✅ Migration executed successfully!\n');
            // Verify table creation
            console.log('🔍 Verifying table structure...');
            const tableInfo = database_1.db.prepare("PRAGMA table_info(staff_contacts)").all();
            if (tableInfo.length === 0) {
                throw new Error('Table was not created successfully');
            }
            console.log('\n📊 staff_contacts table structure:');
            console.log('-------------------------------------------');
            tableInfo.forEach((col) => {
                console.log(`  ${col.name.padEnd(25)} ${col.type.padEnd(15)} ${col.notnull ? 'NOT NULL' : ''}`);
            });
            // Verify data insertion
            console.log('\n🔍 Verifying data insertion...');
            const stats = database_1.db.prepare(`
        SELECT
          category,
          COUNT(*) as count
        FROM staff_contacts
        GROUP BY category
        ORDER BY category
      `).all();
            console.log('\n📈 Staff Contacts by Category:');
            console.log('-------------------------------------------');
            let totalCount = 0;
            const categoryMap = {
                'registration': 'Registration Office',
                'technical_support': 'IT Support',
                'financial': 'Financial Aid',
                'academic': 'Academic Affairs',
                'student_services': 'Student Services',
                'career_services': 'Career Services',
                'library': 'Library Services',
                'international': 'International Office',
                'facilities': 'Facilities Management'
            };
            stats.forEach((stat) => {
                const displayName = categoryMap[stat.category] || stat.category;
                console.log(`  ${displayName.padEnd(30)} ${stat.count} staff`);
                totalCount += stat.count;
            });
            console.log('-------------------------------------------');
            console.log(`  ${'TOTAL STAFF CONTACTS'.padEnd(30)} ${totalCount}`);
            // Sample staff members for quick reference
            console.log('\n👥 Sample Staff Contacts:');
            console.log('-------------------------------------------');
            const samples = database_1.db.prepare(`
        SELECT name, role, department, email, category
        FROM staff_contacts
        ORDER BY category, id
        LIMIT 5
      `).all();
            samples.forEach((staff) => {
                console.log(`\n  ${staff.name}`);
                console.log(`    Role: ${staff.role}`);
                console.log(`    Department: ${staff.department}`);
                console.log(`    Email: ${staff.email}`);
                console.log(`    Category: ${staff.category}`);
            });
            console.log('\n========================================');
            console.log('  Migration Complete!');
            console.log('========================================\n');
            console.log('✅ staff_contacts table created successfully');
            console.log(`✅ ${totalCount} staff contacts inserted`);
            console.log('✅ Ready for AI function integration\n');
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
console.log('Starting staff contacts migration...\n');
const success = addStaffContactsTable();
if (success) {
    console.log('🎉 Staff contacts table is ready!');
    console.log('Next step: Add getStaffContact function to aiController.ts\n');
    process.exit(0);
}
else {
    console.error('⚠️  Migration failed. Please check errors above.\n');
    process.exit(1);
}
