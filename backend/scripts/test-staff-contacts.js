"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/config/database");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Simulate the getStaffContact function
function searchStaffContacts(query) {
    console.log(`\n🔍 Searching for: "${query}"`);
    console.log('-------------------------------------------');
    try {
        const staff = database_1.db.prepare(`
      SELECT
        name,
        role,
        department,
        email,
        phone,
        office_location,
        office_hours,
        responsibilities,
        category
      FROM staff_contacts
      WHERE
        LOWER(role) LIKE LOWER(?)
        OR LOWER(department) LIKE LOWER(?)
        OR LOWER(category) LIKE LOWER(?)
        OR LOWER(responsibilities) LIKE LOWER(?)
      ORDER BY
        CASE
          WHEN LOWER(role) LIKE LOWER(?) THEN 1
          WHEN LOWER(department) LIKE LOWER(?) THEN 2
          WHEN LOWER(category) LIKE LOWER(?) THEN 3
          ELSE 4
        END,
        name
      LIMIT 5
    `).all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
        if (staff.length === 0) {
            console.log('❌ No results found');
            return {
                success: false,
                message: `No staff members found matching "${query}"`
            };
        }
        console.log(`✅ Found ${staff.length} result(s):\n`);
        staff.forEach((person, index) => {
            console.log(`${index + 1}. ${person.name}`);
            console.log(`   Role: ${person.role}`);
            console.log(`   Department: ${person.department}`);
            console.log(`   Email: ${person.email}`);
            console.log(`   Phone: ${person.phone}`);
            console.log(`   Office: ${person.office_location}`);
            console.log(`   Hours: ${person.office_hours}`);
            console.log(`   Category: ${person.category}`);
            console.log(`   Can help with: ${person.responsibilities.substring(0, 150)}...`);
            console.log('');
        });
        return {
            success: true,
            count: staff.length,
            contacts: staff
        };
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}
// Test scenarios
console.log('========================================');
console.log('  Staff Contacts Search Test');
console.log('========================================');
const testQueries = [
    'registration',
    'IT support',
    'financial aid',
    'academic probation',
    'visa',
    'career',
    'library',
    'parking',
    'password reset',
    'scholarship'
];
console.log('\nTesting common student queries...\n');
testQueries.forEach(query => {
    searchStaffContacts(query);
});
console.log('\n========================================');
console.log('  Test Complete!');
console.log('========================================\n');
// Summary statistics
const totalStaff = database_1.db.prepare('SELECT COUNT(*) as count FROM staff_contacts').get();
const categories = database_1.db.prepare('SELECT DISTINCT category FROM staff_contacts ORDER BY category').all();
console.log('📊 Database Summary:');
console.log(`   Total Staff: ${totalStaff.count}`);
console.log(`   Categories: ${categories.map((c) => c.category).join(', ')}`);
console.log('');
// Test edge cases
console.log('\n🧪 Testing edge cases...');
console.log('-------------------------------------------');
// Test empty query
console.log('\n1. Empty string query:');
const emptyResult = searchStaffContacts('');
console.log(`   Result: ${emptyResult.success ? 'Found ' + emptyResult.count + ' results' : 'No results'}`);
// Test non-existent query
console.log('\n2. Non-existent query:');
const nonExistentResult = searchStaffContacts('xyz123abc');
console.log(`   Result: ${nonExistentResult.success ? 'Found results' : 'No results (expected)'}`);
console.log('\n✅ All tests completed!\n');
