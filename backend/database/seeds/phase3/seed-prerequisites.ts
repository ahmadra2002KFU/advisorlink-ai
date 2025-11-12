import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../../mentorlink.db');

console.log('🚀 Seeding Course Prerequisites...\n');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Prerequisite data structure
interface Prerequisite {
  courseCode: string;
  prerequisiteCode: string;
  minGrade: string;
  isStrict: boolean;
  group: number;
}

// Comprehensive prerequisite relationships
const prerequisites: Prerequisite[] = [
  // =============== COMPUTER SCIENCE CHAIN ===============
  // CS Level 1 → 2
  { courseCode: 'CS102', prerequisiteCode: 'CS101', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS202', prerequisiteCode: 'CS101', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS203', prerequisiteCode: 'MATH101', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS204', prerequisiteCode: 'CS103', minGrade: 'C', isStrict: true, group: 1 },

  // CS Level 2 → 3
  { courseCode: 'CS301', prerequisiteCode: 'CS201', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS301', prerequisiteCode: 'MATH201', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'CS302', prerequisiteCode: 'CS201', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS302', prerequisiteCode: 'CS203', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'CS303', prerequisiteCode: 'CS102', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS303', prerequisiteCode: 'CS201', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'CS304', prerequisiteCode: 'CS102', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS304', prerequisiteCode: 'CS201', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'CS305', prerequisiteCode: 'CS202', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS305', prerequisiteCode: 'CS204', minGrade: 'C', isStrict: true, group: 1 },  // CS202 OR CS204

  // CS Level 3 → 4
  { courseCode: 'CS401', prerequisiteCode: 'CS301', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS401', prerequisiteCode: 'CS302', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'CS402', prerequisiteCode: 'CS302', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS402', prerequisiteCode: 'MATH301', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'CS403', prerequisiteCode: 'CS303', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS404', prerequisiteCode: 'CS303', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS404', prerequisiteCode: 'CS301', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'CS405', prerequisiteCode: 'CS302', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'CS405', prerequisiteCode: 'MATH301', minGrade: 'C', isStrict: false, group: 2 }, // Recommended, not strict

  // =============== MATHEMATICS CHAIN ===============
  // Math Level 1 → 2
  { courseCode: 'MATH202', prerequisiteCode: 'MATH201', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'MATH203', prerequisiteCode: 'MATH102', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'MATH204', prerequisiteCode: 'MATH101', minGrade: 'C', isStrict: true, group: 1 },

  // Math Level 2 → 3
  { courseCode: 'MATH302', prerequisiteCode: 'MATH201', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'MATH302', prerequisiteCode: 'MATH202', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'MATH303', prerequisiteCode: 'MATH301', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'MATH304', prerequisiteCode: 'MATH203', minGrade: 'C', isStrict: true, group: 1 },

  // Math Level 3 → 4
  { courseCode: 'MATH401', prerequisiteCode: 'MATH301', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'MATH401', prerequisiteCode: 'CS102', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'MATH402', prerequisiteCode: 'MATH302', minGrade: 'C', isStrict: true, group: 1 },

  // =============== ENGINEERING CHAIN ===============
  // Eng Level 1 → 2
  { courseCode: 'ENG201', prerequisiteCode: 'ENG101', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'ENG201', prerequisiteCode: 'MATH101', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'ENG202', prerequisiteCode: 'ENG102', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'ENG202', prerequisiteCode: 'MATH101', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'ENG203', prerequisiteCode: 'ENG103', minGrade: 'C', isStrict: true, group: 1 },

  // Eng Level 2 → 3
  { courseCode: 'ENG302', prerequisiteCode: 'ENG202', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'ENG302', prerequisiteCode: 'MATH201', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'ENG303', prerequisiteCode: 'ENG201', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'ENG303', prerequisiteCode: 'ENG301', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'ENG304', prerequisiteCode: 'ENG203', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'ENG304', prerequisiteCode: 'ENG104', minGrade: 'C', isStrict: true, group: 2 },

  // Eng Level 3 → 4
  { courseCode: 'ENG401', prerequisiteCode: 'ENG302', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'ENG401', prerequisiteCode: 'CS201', minGrade: 'C', isStrict: false, group: 2 }, // Recommended for robotics
  { courseCode: 'ENG402', prerequisiteCode: 'ENG301', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'ENG402', prerequisiteCode: 'ENG303', minGrade: 'C', isStrict: true, group: 2 },

  // =============== BUSINESS CHAIN ===============
  // Bus Level 1 → 2
  { courseCode: 'BUS202', prerequisiteCode: 'BUS101', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'BUS202', prerequisiteCode: 'BUS102', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'BUS203', prerequisiteCode: 'BUS101', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'BUS204', prerequisiteCode: 'PSYCH101', minGrade: 'C', isStrict: false, group: 1 }, // Recommended

  // Bus Level 2 → 3
  { courseCode: 'BUS301', prerequisiteCode: 'BUS201', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'BUS302', prerequisiteCode: 'BUS202', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'BUS302', prerequisiteCode: 'MATH102', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'BUS303', prerequisiteCode: 'BUS201', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'BUS303', prerequisiteCode: 'ECON101', minGrade: 'C', isStrict: false, group: 2 }, // Recommended
  { courseCode: 'BUS304', prerequisiteCode: 'BUS101', minGrade: 'D', isStrict: true, group: 1 },

  // Bus Level 3 → 4
  { courseCode: 'BUS401', prerequisiteCode: 'BUS301', minGrade: 'C', isStrict: true, group: 1 },
  { courseCode: 'BUS401', prerequisiteCode: 'BUS302', minGrade: 'C', isStrict: true, group: 2 },
  { courseCode: 'BUS401', prerequisiteCode: 'BUS304', minGrade: 'C', isStrict: true, group: 3 },
  { courseCode: 'BUS402', prerequisiteCode: 'BUS201', minGrade: 'C', isStrict: true, group: 1 },

  // =============== GENERAL EDUCATION DEPENDENCIES ===============
  { courseCode: 'ENG201', prerequisiteCode: 'ENG101', minGrade: 'C', isStrict: true, group: 1 }, // Assuming ENG101 is English Composition
  { courseCode: 'HIST201', prerequisiteCode: 'HIST101', minGrade: 'D', isStrict: false, group: 1 }, // Recommended
  { courseCode: 'CHEM101', prerequisiteCode: 'MATH101', minGrade: 'C', isStrict: false, group: 1 }, // Recommended
  { courseCode: 'BIO101', prerequisiteCode: 'CHEM101', minGrade: 'D', isStrict: false, group: 1 }, // Recommended
  { courseCode: 'PHIL201', prerequisiteCode: 'PHIL101', minGrade: 'D', isStrict: false, group: 1 }, // Recommended
  { courseCode: 'ART201', prerequisiteCode: 'ART101', minGrade: 'D', isStrict: false, group: 1 }, // Recommended
];

try {
  console.log(`📚 Preparing to insert ${prerequisites.length} prerequisite relationships...\n`);

  // Prepare insert statement
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO course_prerequisites (
      course_code, prerequisite_code, minimum_grade, is_strict, prerequisite_group
    ) VALUES (?, ?, ?, ?, ?)
  `);

  // Use transaction for performance
  const insertMany = db.transaction((prereqsToInsert: Prerequisite[]) => {
    let insertedCount = 0;
    for (const prereq of prereqsToInsert) {
      const result = insertStmt.run(
        prereq.courseCode,
        prereq.prerequisiteCode,
        prereq.minGrade,
        prereq.isStrict ? 1 : 0,
        prereq.group
      );
      if (result.changes > 0) insertedCount++;
    }
    return insertedCount;
  });

  const inserted = insertMany(prerequisites);

  console.log(`✅ Inserted ${inserted} new prerequisite relationships\n`);

  // Verify and show statistics
  const stats = db.prepare(`
    SELECT
      SUBSTR(course_code, 1, INSTR(course_code, '1') - 1) as department,
      COUNT(*) as prerequisite_count,
      SUM(CASE WHEN is_strict = 1 THEN 1 ELSE 0 END) as strict_count,
      SUM(CASE WHEN is_strict = 0 THEN 1 ELSE 0 END) as recommended_count
    FROM course_prerequisites
    WHERE LENGTH(SUBSTR(course_code, 1, INSTR(course_code, '1') - 1)) > 0
    GROUP BY department
    ORDER BY prerequisite_count DESC
  `).all() as any[];

  console.log('📊 Prerequisite Statistics by Department:\n');
  stats.forEach(stat => {
    console.log(`   ${stat.department}: ${stat.prerequisite_count} prerequisites | Strict: ${stat.strict_count} | Recommended: ${stat.recommended_count}`);
  });

  // Show courses with most prerequisites
  const complexCourses = db.prepare(`
    SELECT
      course_code,
      COUNT(DISTINCT prerequisite_group) as group_count,
      COUNT(*) as prereq_count
    FROM course_prerequisites
    GROUP BY course_code
    HAVING prereq_count > 2
    ORDER BY prereq_count DESC
    LIMIT 10
  `).all() as any[];

  console.log('\n📚 Most Complex Courses (by prerequisites):\n');
  complexCourses.forEach(course => {
    const prereqs = db.prepare(`
      SELECT prerequisite_code, minimum_grade, is_strict, prerequisite_group
      FROM course_prerequisites
      WHERE course_code = ?
      ORDER BY prerequisite_group, prerequisite_code
    `).all(course.course_code) as any[];

    console.log(`   ${course.course_code}: ${course.prereq_count} prerequisites in ${course.group_count} group(s)`);

    // Group prerequisites
    const groups: any = {};
    prereqs.forEach(p => {
      if (!groups[p.prerequisite_group]) groups[p.prerequisite_group] = [];
      groups[p.prerequisite_group].push(`${p.prerequisite_code} (${p.minimum_grade}+${p.is_strict ? '*' : ''})`);
    });

    Object.keys(groups).forEach((groupNum, idx) => {
      const connector = idx === 0 ? '' : 'AND ';
      console.log(`      ${connector}(${groups[groupNum].join(' OR ')})`);
    });
  });

  const totalPrereqs = db.prepare('SELECT COUNT(*) as count FROM course_prerequisites').get() as any;
  console.log(`\n✅ Total prerequisites in database: ${totalPrereqs.count}\n`);

  console.log('🎉 Prerequisites seeding completed successfully!\n');
  console.log('Legend: * = Strict prerequisite (required), no * = Recommended\n');

} catch (error: any) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
