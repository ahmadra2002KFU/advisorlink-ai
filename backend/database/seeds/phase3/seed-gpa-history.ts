import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../../mentorlink.db');
const db = new Database(dbPath);

console.log('🌱 Seeding GPA History Data...\n');

// Get all students
const students = db.prepare('SELECT id, gpa FROM students WHERE gpa IS NOT NULL').all() as any[];
console.log(`Found ${students.length} students with GPA data\n`);

// Define semesters (6 semesters going back 3 years)
const semesters = [
  'Fall 2022',
  'Spring 2023',
  'Fall 2023',
  'Spring 2024',
  'Fall 2024',
  'Spring 2025' // Current semester
];

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO student_gpa_history (student_id, semester, gpa, recorded_at)
  VALUES (?, ?, ?, ?)
`);

let totalInserted = 0;
let improvingCount = 0;
let stableCount = 0;
let decliningCount = 0;

// Transaction for better performance
const insertMany = db.transaction((studentRecords: any[]) => {
  for (const record of studentRecords) {
    const result = insertStmt.run(
      record.student_id,
      record.semester,
      record.gpa,
      record.recorded_at
    );
    if (result.changes > 0) totalInserted++;
  }
});

students.forEach((student, index) => {
  const currentGPA = parseFloat(student.gpa);
  const records: any[] = [];

  // Determine trend type based on distribution
  const rand = Math.random();
  let trendType: 'improving' | 'stable' | 'declining';

  if (rand < 0.60) {
    trendType = 'improving';
    improvingCount++;
  } else if (rand < 0.85) {
    trendType = 'stable';
    stableCount++;
  } else {
    trendType = 'declining';
    decliningCount++;
  }

  // Generate historical GPAs working backwards from current
  let gpa = currentGPA;

  for (let i = semesters.length - 1; i >= 0; i--) {
    const semester = semesters[i];

    // Ensure GPA stays within valid range
    gpa = Math.max(0.0, Math.min(4.0, gpa));

    // Record this semester
    const recordedDate = getSemesterDate(semester);
    records.push({
      student_id: student.id,
      semester: semester,
      gpa: parseFloat(gpa.toFixed(2)),
      recorded_at: recordedDate
    });

    // Calculate previous semester's GPA
    if (i > 0) {
      if (trendType === 'improving') {
        // Improving trend: previous GPA was lower
        const change = 0.05 + Math.random() * 0.10; // +0.05 to +0.15
        gpa = gpa - change;
      } else if (trendType === 'stable') {
        // Stable trend: slight variation
        const change = (Math.random() - 0.5) * 0.10; // ±0.05
        gpa = gpa + change;
      } else {
        // Declining trend: previous GPA was higher
        const change = 0.05 + Math.random() * 0.15; // +0.05 to +0.20
        gpa = gpa + change;
      }
    }
  }

  // Insert all records for this student
  insertMany(records);

  // Progress indicator
  if ((index + 1) % 10 === 0) {
    console.log(`✓ Processed ${index + 1}/${students.length} students`);
  }
});

console.log(`\n✅ GPA history seeding complete!\n`);
console.log(`📊 Statistics:`);
console.log(`   Total records inserted: ${totalInserted}`);
console.log(`   Improving trend: ${improvingCount} students (${(improvingCount / students.length * 100).toFixed(1)}%)`);
console.log(`   Stable trend: ${stableCount} students (${(stableCount / students.length * 100).toFixed(1)}%)`);
console.log(`   Declining trend: ${decliningCount} students (${(decliningCount / students.length * 100).toFixed(1)}%)`);

// Validation checks
console.log(`\n🔍 Validation:`);

const nullCount = db.prepare('SELECT COUNT(*) as count FROM student_gpa_history WHERE gpa IS NULL').get() as any;
console.log(`   NULL GPAs: ${nullCount.count}`);

const outOfRange = db.prepare('SELECT COUNT(*) as count FROM student_gpa_history WHERE gpa < 0 OR gpa > 4.0').get() as any;
console.log(`   Out of range GPAs: ${outOfRange.count}`);

const totalRecords = db.prepare('SELECT COUNT(*) as count FROM student_gpa_history').get() as any;
console.log(`   Total records in table: ${totalRecords.count}`);

// Sample data
console.log(`\n📋 Sample records (first student):`);
const sampleRecords = db.prepare(`
  SELECT semester, gpa, recorded_at
  FROM student_gpa_history
  WHERE student_id = ?
  ORDER BY recorded_at
  LIMIT 6
`).all(students[0].id) as any[];

sampleRecords.forEach(record => {
  console.log(`   ${record.semester}: ${record.gpa} (${record.recorded_at})`);
});

db.close();

// Helper function to get realistic dates for semesters
function getSemesterDate(semester: string): string {
  const semesterDates: Record<string, string> = {
    'Fall 2022': '2022-12-15',
    'Spring 2023': '2023-05-15',
    'Fall 2023': '2023-12-15',
    'Spring 2024': '2024-05-15',
    'Fall 2024': '2024-12-15',
    'Spring 2025': '2025-05-15'
  };

  return semesterDates[semester] || new Date().toISOString().split('T')[0];
}
