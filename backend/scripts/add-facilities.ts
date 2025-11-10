import { db } from '../src/config/database';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function runFacilitiesMigration() {
  try {
    console.log('========================================');
    console.log('  Running Facilities Migration');
    console.log('========================================\n');

    // Step 1: Create facilities table
    console.log('📋 Step 1: Creating facilities table...');
    const schemaPath = path.join(__dirname, '../../database/migrations/add_facilities_table.sql');

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Migration file not found: ${schemaPath}`);
    }

    console.log(`📄 Reading migration file: ${schemaPath}`);
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema creation
    db.exec(schemaSQL);
    console.log('✅ Facilities table created successfully!\n');

    // Step 2: Seed facilities data
    console.log('📋 Step 2: Seeding facilities data...');
    const seedPath = path.join(__dirname, '../../database/migrations/seed_facilities_data.sql');

    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found: ${seedPath}`);
    }

    console.log(`📄 Reading seed file: ${seedPath}`);
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    // Execute the seed data
    db.exec(seedSQL);
    console.log('✅ Facilities data seeded successfully!\n');

    // Step 3: Verify the data
    console.log('🔍 Step 3: Verifying facilities table...\n');

    // Get table structure
    const tableInfo: any = db.prepare("PRAGMA table_info(facilities)").all();
    console.log('📊 Facilities table structure:');
    console.log('-------------------------------------------');
    tableInfo.forEach((col: any) => {
      console.log(`  ${col.name.padEnd(20)} ${col.type.padEnd(10)} ${col.notnull ? 'NOT NULL' : ''}`);
    });

    // Get count by type
    console.log('\n📈 Facilities count by type:');
    console.log('-------------------------------------------');
    const typeCounts = db.prepare(`
      SELECT type, COUNT(*) as count
      FROM facilities
      GROUP BY type
      ORDER BY type
    `).all() as any[];

    let totalFacilities = 0;
    typeCounts.forEach((row: any) => {
      console.log(`  ${row.type.padEnd(20)} ${row.count} facilities`);
      totalFacilities += row.count;
    });

    console.log('-------------------------------------------');
    console.log(`  Total:               ${totalFacilities} facilities\n`);

    // Sample facility details
    console.log('📝 Sample facility (first computer lab):');
    console.log('-------------------------------------------');
    const sampleFacility = db.prepare(`
      SELECT * FROM facilities
      WHERE type = 'lab'
      LIMIT 1
    `).get() as any;

    if (sampleFacility) {
      console.log(`  Name:        ${sampleFacility.name}`);
      console.log(`  Type:        ${sampleFacility.type}`);
      console.log(`  Building:    ${sampleFacility.building}`);
      console.log(`  Room:        ${sampleFacility.room_number || 'N/A'}`);
      console.log(`  Floor:       ${sampleFacility.floor || 'N/A'}`);
      console.log(`  Capacity:    ${sampleFacility.capacity || 'N/A'}`);
      console.log(`  Hours:       ${sampleFacility.hours}`);
      console.log(`  Contact:     ${sampleFacility.contact_email}`);
      console.log(`  Phone:       ${sampleFacility.phone}`);
      const services = JSON.parse(sampleFacility.services || '[]');
      console.log(`  Services:    ${services.slice(0, 3).join(', ')}${services.length > 3 ? '...' : ''}`);
    }

    console.log('\n========================================');
    console.log('  Migration Complete!');
    console.log('========================================');
    console.log(`\n✅ Successfully created and populated facilities table`);
    console.log(`✅ ${totalFacilities} facilities added to the database`);
    console.log(`✅ Ready to use searchFacilities function\n`);

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    throw error;
  }
}

// Run the migration
console.log('\n🚀 Starting facilities migration...\n');
runFacilitiesMigration();
