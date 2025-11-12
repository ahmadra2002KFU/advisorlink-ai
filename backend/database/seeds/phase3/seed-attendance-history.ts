import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../../mentorlink.db');
const db = new Database(dbPath);

console.log('🌱 Seeding Attendance History Data...\n');

// Get all students
const students = db.prepare('SELECT id, attendance_percentage, gpa FROM students WHERE attendance_percentage IS NOT NULL').all() as any[];
console.log(`Found ${students.length} students with attendance data\n`);

// Define months (6 months of historical data)
const months = [
  '2024-06', // June
  '2024-07', // July
  '2024-08', // August
  '2024-09', // September
  '2024-10', // October
  '2024-11'  // November (current)
];

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO student_attendance_history
  (student_id, month, attendance_percentage, total_days, days_present, days_absent, recorded_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

let totalInserted = 0;

// Transaction for better performance
const insertMany = db.transaction((studentRecords: any[]) => {
  for (const record of studentRecords) {
    const result = insertStmt.run(
      record.student_id,
      record.month,
      record.attendance_percentage,
      record.total_days,
      record.days_present,
      record.days_absent,
      record.recorded_at
    );
    if (result.changes > 0) totalInserted++;
  }
});

students.forEach((student, index) => {
  const currentAttendance = parseFloat(student.attendance_percentage);
  const currentGPA = parseFloat(student.gpa || '3.0');
  const records: any[] = [];

  // Higher GPA correlates with higher attendance (but not perfectly)
  const baseAttendance = Math.min(95, currentAttendance + (Math.random() - 0.5) * 5);

  for (let i = 0; i < months.length; i++) {
    const month = months[i];

    // Add seasonal variation
    let seasonalFactor = 1.0;
    if (month === '2024-07' || month === '2024-08') {
      // Summer months: slightly lower (vacation season)
      seasonalFactor = 0.95;
    } else if (month === '2024-12') {
      // December: lower (holidays)
      seasonalFactor = 0.90;
    }

    // Add random variation
    const randomVariation = (Math.random() - 0.5) * 8; // ±4%

    // Calculate attendance for this month
    let monthlyAttendance = baseAttendance * seasonalFactor + randomVariation;

    // Add trend if last month (should approach current)
    if (i === months.length - 1) {
      monthlyAttendance = currentAttendance;
    }

    // Ensure within valid range
    monthlyAttendance = Math.max(45, Math.min(100, monthlyAttendance));

    // Calculate days (typically 20-22 school days per month)
    const totalDays = 20 + Math.floor(Math.random() * 3);
    const daysPresent = Math.round((monthlyAttendance / 100) * totalDays);
    const daysAbsent = totalDays - daysPresent;

    const recordedDate = getMonthEndDate(month);

    records.push({
      student_id: student.id,
      month: month,
      attendance_percentage: parseFloat(monthlyAttendance.toFixed(2)),
      total_days: totalDays,
      days_present: daysPresent,
      days_absent: daysAbsent,
      recorded_at: recordedDate
    });
  }

  // Insert all records for this student
  insertMany(records);

  // Progress indicator
  if ((index + 1) % 10 === 0) {
    console.log(`✓ Processed ${index + 1}/${students.length} students`);
  }
});

console.log(`\n✅ Attendance history seeding complete!\n`);
console.log(`📊 Statistics:`);
console.log(`   Total records inserted: ${totalInserted}`);

// Validation checks
console.log(`\n🔍 Validation:`);

const nullCount = db.prepare('SELECT COUNT(*) as count FROM student_attendance_history WHERE attendance_percentage IS NULL').get() as any;
console.log(`   NULL attendance values: ${nullCount.count}`);

const outOfRange = db.prepare('SELECT COUNT(*) as count FROM student_attendance_history WHERE attendance_percentage < 0 OR attendance_percentage > 100').get() as any;
console.log(`   Out of range attendance: ${outOfRange.count}`);

const invalidDays = db.prepare('SELECT COUNT(*) as count FROM student_attendance_history WHERE days_present + days_absent != total_days').get() as any;
console.log(`   Invalid day calculations: ${invalidDays.count}`);

const totalRecords = db.prepare('SELECT COUNT(*) as count FROM student_attendance_history').get() as any;
console.log(`   Total records in table: ${totalRecords.count}`);

// Sample data
console.log(`\n📋 Sample records (first student):`);
const sampleRecords = db.prepare(`
  SELECT month, attendance_percentage, total_days, days_present, days_absent
  FROM student_attendance_history
  WHERE student_id = ?
  ORDER BY month
`).all(students[0].id) as any[];

sampleRecords.forEach(record => {
  console.log(`   ${record.month}: ${record.attendance_percentage}% (${record.days_present}/${record.total_days} days)`);
});

// Calculate average attendance by month
console.log(`\n📈 Average attendance by month:`);
const monthlyAverages = db.prepare(`
  SELECT month, AVG(attendance_percentage) as avg_attendance
  FROM student_attendance_history
  GROUP BY month
  ORDER BY month
`).all() as any[];

monthlyAverages.forEach(record => {
  console.log(`   ${record.month}: ${parseFloat(record.avg_attendance).toFixed(2)}%`);
});

db.close();

// Helper function to get month-end dates
function getMonthEndDate(month: string): string {
  const monthEndDates: Record<string, string> = {
    '2024-06': '2024-06-30',
    '2024-07': '2024-07-31',
    '2024-08': '2024-08-31',
    '2024-09': '2024-09-30',
    '2024-10': '2024-10-31',
    '2024-11': '2024-11-30'
  };

  return monthEndDates[month] || new Date().toISOString().split('T')[0];
}
