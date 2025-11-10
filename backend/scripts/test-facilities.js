"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/config/database");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Import the searchFacilities logic (we'll test it directly)
async function searchFacilities(searchTerm) {
    console.log(`\n[searchFacilities] Searching for: "${searchTerm}"`);
    try {
        const facilities = database_1.db.prepare(`
      SELECT
        name,
        type,
        building,
        room_number,
        floor,
        capacity,
        services,
        hours,
        contact_email,
        phone,
        description
      FROM facilities
      WHERE LOWER(name) LIKE LOWER(?)
         OR LOWER(type) LIKE LOWER(?)
         OR LOWER(building) LIKE LOWER(?)
         OR LOWER(description) LIKE LOWER(?)
      ORDER BY
        CASE
          WHEN LOWER(name) LIKE LOWER(?) THEN 1
          WHEN LOWER(type) LIKE LOWER(?) THEN 2
          WHEN LOWER(building) LIKE LOWER(?) THEN 3
          ELSE 4
        END,
        name
      LIMIT 10
    `).all(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        if (facilities.length === 0) {
            return {
                success: false,
                message: `No facilities found matching "${searchTerm}".`
            };
        }
        const formattedFacilities = facilities.map((f) => {
            const services = f.services ? JSON.parse(f.services) : [];
            return {
                name: f.name,
                type: f.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                location: f.room_number
                    ? `Room ${f.room_number}, ${f.building}${f.floor ? ` (Floor ${f.floor})` : ''}`
                    : f.building,
                capacity: f.capacity ? `Capacity: ${f.capacity}` : null,
                hours: f.hours,
                contact: f.contact_email,
                phone: f.phone,
                services: services.length > 0 ? services.slice(0, 5).join(', ') + (services.length > 5 ? '...' : '') : null,
                description: f.description ? f.description.substring(0, 200) + (f.description.length > 200 ? '...' : '') : null
            };
        });
        if (facilities.length === 1) {
            return {
                success: true,
                facility: formattedFacilities[0],
                message: `Found: ${formattedFacilities[0].name}`
            };
        }
        return {
            success: true,
            message: `Found ${facilities.length} facilities matching "${searchTerm}"`,
            facilities: formattedFacilities
        };
    }
    catch (error) {
        console.error('[searchFacilities] Error:', error);
        return {
            success: false,
            message: 'An error occurred while searching for facilities.'
        };
    }
}
// Test cases
async function runTests() {
    console.log('========================================');
    console.log('  Testing Facilities Search Function');
    console.log('========================================');
    const testCases = [
        { query: 'computer lab', description: 'Search for computer labs' },
        { query: 'library', description: 'Search for libraries' },
        { query: 'registrar', description: 'Search for registrar office' },
        { query: 'engineering', description: 'Search for engineering facilities' },
        { query: 'science building', description: 'Search by building name' },
        { query: 'cafeteria', description: 'Search for dining facilities' },
        { query: 'career', description: 'Search for career services' },
        { query: 'prayer', description: 'Search for prayer rooms' },
        { query: 'xyz123', description: 'Search for non-existent facility' }
    ];
    for (const testCase of testCases) {
        console.log('\n----------------------------------------');
        console.log(`Test: ${testCase.description}`);
        console.log(`Query: "${testCase.query}"`);
        console.log('----------------------------------------');
        const result = await searchFacilities(testCase.query);
        if (result.success) {
            console.log('✅ Status: Success');
            console.log(`📊 Result: ${result.message}`);
            if (result.facility) {
                // Single result
                const f = result.facility;
                console.log('\nFacility Details:');
                console.log(`  Name:        ${f.name}`);
                console.log(`  Type:        ${f.type}`);
                console.log(`  Location:    ${f.location}`);
                if (f.capacity)
                    console.log(`  ${f.capacity}`);
                console.log(`  Hours:       ${f.hours}`);
                console.log(`  Contact:     ${f.contact}`);
                console.log(`  Phone:       ${f.phone}`);
                if (f.services)
                    console.log(`  Services:    ${f.services}`);
                if (f.description)
                    console.log(`  Description: ${f.description}`);
            }
            else if (result.facilities) {
                // Multiple results
                console.log(`\nFound ${result.facilities.length} facilities:`);
                result.facilities.forEach((f, index) => {
                    console.log(`\n  ${index + 1}. ${f.name}`);
                    console.log(`     Type: ${f.type}`);
                    console.log(`     Location: ${f.location}`);
                    console.log(`     Contact: ${f.contact}`);
                });
            }
        }
        else {
            console.log('❌ Status: Not Found');
            console.log(`📊 Message: ${result.message}`);
        }
    }
    console.log('\n========================================');
    console.log('  Testing Complete!');
    console.log('========================================\n');
    // Summary statistics
    console.log('📈 Database Statistics:');
    console.log('----------------------------------------');
    const typeCounts = database_1.db.prepare(`
    SELECT type, COUNT(*) as count
    FROM facilities
    GROUP BY type
    ORDER BY count DESC
  `).all();
    typeCounts.forEach((row) => {
        console.log(`  ${row.type.padEnd(20)} ${row.count} facilities`);
    });
    const totalCount = database_1.db.prepare(`SELECT COUNT(*) as total FROM facilities`).get();
    console.log('----------------------------------------');
    console.log(`  Total:               ${totalCount.total} facilities\n`);
}
// Run the tests
runTests().catch(console.error);
