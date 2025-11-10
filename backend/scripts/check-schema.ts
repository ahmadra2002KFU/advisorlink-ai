import { db } from '../src/config/database';
import dotenv from 'dotenv';

dotenv.config();

const tableInfo: any = db.prepare("PRAGMA table_info(student_courses)").all();

console.log('\n📊 Complete student_courses table structure:');
console.log('============================================');
console.log(`Total columns: ${tableInfo.length}\n`);

tableInfo.forEach((col: any, index: number) => {
  console.log(`${(index + 1).toString().padStart(2)}) ${col.name.padEnd(30)} ${col.type.padEnd(10)} ${col.notnull ? 'NOT NULL' : ''}`);
});

console.log('\n============================================\n');
