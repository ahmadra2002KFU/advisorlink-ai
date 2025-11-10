import { db } from '../src/config/database';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Demo script showing academic_thresholds table usage
 * Phase 2.1: Academic Thresholds System
 */

console.log('\n========================================');
console.log('  Academic Thresholds Demo');
console.log('========================================\n');

// Function to determine academic status based on GPA
function getAcademicStatus(gpa: number): { status: string; range: string; description: string } | null {
  const result = db.prepare(`
    SELECT honor_type, min_gpa, max_gpa, description
    FROM academic_thresholds
    WHERE ? BETWEEN min_gpa AND max_gpa
    ORDER BY min_gpa DESC
    LIMIT 1
  `).get(gpa) as any;

  if (result) {
    const statusLabels: Record<string, string> = {
      'highest_honors': 'Highest Honors (Summa Cum Laude)',
      'high_honors': 'High Honors (Magna Cum Laude)',
      'honors': 'Honors (Cum Laude)',
      'dean_list': 'Dean\'s List',
      'academic_probation': 'Academic Probation'
    };

    return {
      status: statusLabels[result.honor_type] || result.honor_type,
      range: `${result.min_gpa.toFixed(2)} - ${result.max_gpa.toFixed(2)}`,
      description: result.description
    };
  }

  return null;
}

// Test with various GPAs
console.log('📊 Student GPA Evaluation Examples:\n');
console.log('─'.repeat(80));

const testCases = [
  { name: 'Sarah Johnson', gpa: 3.95 },
  { name: 'Michael Chen', gpa: 3.80 },
  { name: 'Emily Rodriguez', gpa: 3.65 },
  { name: 'David Kim', gpa: 3.40 },
  { name: 'Jessica Brown', gpa: 2.75 },
  { name: 'Alex Martinez', gpa: 1.85 }
];

testCases.forEach(student => {
  console.log(`\nStudent: ${student.name}`);
  console.log(`GPA: ${student.gpa.toFixed(2)}`);

  const status = getAcademicStatus(student.gpa);

  if (status) {
    console.log(`Status: ${status.status}`);
    console.log(`Range: ${status.range}`);
  } else {
    console.log('Status: Regular Academic Standing');
    console.log('Range: 2.00 - 3.24');
  }

  console.log('─'.repeat(80));
});

// Show all thresholds
console.log('\n📋 All Academic Thresholds:\n');

const allThresholds = db.prepare(`
  SELECT honor_type, min_gpa, max_gpa, description
  FROM academic_thresholds
  ORDER BY min_gpa DESC
`).all() as any[];

const statusLabels: Record<string, string> = {
  'highest_honors': 'Highest Honors (Summa Cum Laude)',
  'high_honors': 'High Honors (Magna Cum Laude)',
  'honors': 'Honors (Cum Laude)',
  'dean_list': 'Dean\'s List',
  'academic_probation': 'Academic Probation'
};

allThresholds.forEach(threshold => {
  const label = statusLabels[threshold.honor_type] || threshold.honor_type;
  console.log(`${label}`);
  console.log(`  GPA Range: ${threshold.min_gpa.toFixed(2)} - ${threshold.max_gpa.toFixed(2)}`);
  console.log(`  ${threshold.description.substring(0, 100)}...`);
  console.log('');
});

// Statistics
console.log('📈 System Statistics:\n');

const stats = db.prepare(`
  SELECT
    COUNT(*) as total_thresholds,
    MIN(min_gpa) as lowest_gpa,
    MAX(max_gpa) as highest_gpa
  FROM academic_thresholds
`).get() as any;

console.log(`  Total Thresholds: ${stats.total_thresholds}`);
console.log(`  GPA Range Covered: ${stats.lowest_gpa.toFixed(2)} - ${stats.highest_gpa.toFixed(2)}`);

console.log('\n========================================');
console.log('  Demo Complete');
console.log('========================================\n');
