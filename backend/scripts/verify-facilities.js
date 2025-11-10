"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/config/database");
console.log('\n=== Facilities Table Verification ===\n');
// Get count by type
const results = database_1.db.prepare('SELECT type, COUNT(*) as count FROM facilities GROUP BY type ORDER BY type').all();
console.log('Facilities by type:');
results.forEach(r => console.log(`  ${r.type}: ${r.count}`));
const total = database_1.db.prepare('SELECT COUNT(*) as total FROM facilities').get();
console.log(`\nTOTAL: ${total.total} facilities\n`);
// Show a few sample facilities
console.log('Sample facilities:');
const samples = database_1.db.prepare('SELECT name, type, building FROM facilities LIMIT 5').all();
samples.forEach(s => console.log(`  - ${s.name} (${s.type}) in ${s.building}`));
console.log('');
