import { db } from '../src/config/database';

console.log('\n=== Facilities Table Verification ===\n');

// Get count by type
const results = db.prepare('SELECT type, COUNT(*) as count FROM facilities GROUP BY type ORDER BY type').all() as any[];

console.log('Facilities by type:');
results.forEach(r => console.log(`  ${r.type}: ${r.count}`));

const total = db.prepare('SELECT COUNT(*) as total FROM facilities').get() as any;
console.log(`\nTOTAL: ${total.total} facilities\n`);

// Show a few sample facilities
console.log('Sample facilities:');
const samples = db.prepare('SELECT name, type, building FROM facilities LIMIT 5').all() as any[];
samples.forEach(s => console.log(`  - ${s.name} (${s.type}) in ${s.building}`));
console.log('');
