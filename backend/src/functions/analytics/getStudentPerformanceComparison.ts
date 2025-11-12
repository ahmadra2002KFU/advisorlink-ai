import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 3 Analytics Function: Get Student Performance Comparison
 * Compares student's performance with peers (level, section, department averages)
 */
export async function getStudentPerformanceComparison(args: any, context: any): Promise<any> {
  const { studentName } = args;
  const { advisorId } = context;

  console.log(`[getStudentPerformanceComparison] Comparing performance for student: "${studentName}"`);

  try {
    // Find student by fuzzy name match
    const student = db.prepare(`
      SELECT
        s.id as student_id,
        s.student_id as student_number,
        u.full_name,
        u.email,
        s.gpa as student_gpa,
        s.attendance as student_attendance,
        l.level_name,
        l.id as level_id,
        sec.section_name,
        sec.id as section_id,
        d.department_name,
        d.id as department_id
      FROM advisor_assignments aa
      JOIN students s ON aa.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      JOIN departments d ON s.department_id = d.id
      WHERE aa.advisor_id = ? AND LOWER(u.full_name) LIKE LOWER(?)
      ORDER BY
        CASE
          WHEN LOWER(u.full_name) = LOWER(?) THEN 1
          WHEN LOWER(u.full_name) LIKE LOWER(?) THEN 2
          ELSE 3
        END
      LIMIT 1
    `).get(advisorId, `%${studentName}%`, studentName, `${studentName}%`) as any;

    if (!student) {
      return {
        success: false,
        message: `No student found matching "${studentName}" among your assigned students. Please check the name and try again.`
      };
    }

    const studentGPA = parseFloat(student.student_gpa);
    const studentAttendance = parseFloat(student.student_attendance);

    // Calculate level average (same level across all departments)
    const levelStats = db.prepare(`
      SELECT
        COUNT(*) as total_students,
        AVG(gpa) as avg_gpa,
        AVG(attendance) as avg_attendance,
        MIN(gpa) as min_gpa,
        MAX(gpa) as max_gpa
      FROM students
      WHERE level_id = ? AND gpa IS NOT NULL AND attendance IS NOT NULL
    `).get(student.level_id) as any;

    // Calculate section average (same section)
    const sectionStats = db.prepare(`
      SELECT
        COUNT(*) as total_students,
        AVG(gpa) as avg_gpa,
        AVG(attendance) as avg_attendance,
        MIN(gpa) as min_gpa,
        MAX(gpa) as max_gpa
      FROM students
      WHERE section_id = ? AND gpa IS NOT NULL AND attendance IS NOT NULL
    `).get(student.section_id) as any;

    // Calculate department average (same department)
    const departmentStats = db.prepare(`
      SELECT
        COUNT(*) as total_students,
        AVG(gpa) as avg_gpa,
        AVG(attendance) as avg_attendance,
        MIN(gpa) as min_gpa,
        MAX(gpa) as max_gpa
      FROM students
      WHERE department_id = ? AND gpa IS NOT NULL AND attendance IS NOT NULL
    `).get(student.department_id) as any;

    // Calculate overall institution average
    const institutionStats = db.prepare(`
      SELECT
        COUNT(*) as total_students,
        AVG(gpa) as avg_gpa,
        AVG(attendance) as avg_attendance,
        MIN(gpa) as min_gpa,
        MAX(gpa) as max_gpa
      FROM students
      WHERE gpa IS NOT NULL AND attendance IS NOT NULL
    `).get() as any;

    // Calculate ranking within level
    const levelRanking = db.prepare(`
      SELECT COUNT(*) + 1 as rank
      FROM students
      WHERE level_id = ? AND gpa > ? AND gpa IS NOT NULL
    `).get(student.level_id, studentGPA) as any;

    // Calculate ranking within section
    const sectionRanking = db.prepare(`
      SELECT COUNT(*) + 1 as rank
      FROM students
      WHERE section_id = ? AND gpa > ? AND gpa IS NOT NULL
    `).get(student.section_id, studentGPA) as any;

    // Calculate ranking within department
    const departmentRanking = db.prepare(`
      SELECT COUNT(*) + 1 as rank
      FROM students
      WHERE department_id = ? AND gpa > ? AND gpa IS NOT NULL
    `).get(student.department_id, studentGPA) as any;

    // Calculate percentiles
    const levelPercentile = ((levelStats.total_students - levelRanking.rank + 1) / levelStats.total_students) * 100;
    const sectionPercentile = ((sectionStats.total_students - sectionRanking.rank + 1) / sectionStats.total_students) * 100;
    const departmentPercentile = ((departmentStats.total_students - departmentRanking.rank + 1) / departmentStats.total_students) * 100;

    // Generate comparisons
    const comparisons = {
      level: {
        name: student.level_name,
        totalStudents: levelStats.total_students,
        studentGPA: studentGPA.toFixed(2),
        averageGPA: parseFloat(levelStats.avg_gpa).toFixed(2),
        difference: (studentGPA - levelStats.avg_gpa).toFixed(2),
        ranking: levelRanking.rank,
        percentile: levelPercentile.toFixed(1),
        studentAttendance: studentAttendance.toFixed(1),
        averageAttendance: parseFloat(levelStats.avg_attendance).toFixed(1),
        attendanceDifference: (studentAttendance - levelStats.avg_attendance).toFixed(1)
      },
      section: {
        name: student.section_name,
        totalStudents: sectionStats.total_students,
        studentGPA: studentGPA.toFixed(2),
        averageGPA: parseFloat(sectionStats.avg_gpa).toFixed(2),
        difference: (studentGPA - sectionStats.avg_gpa).toFixed(2),
        ranking: sectionRanking.rank,
        percentile: sectionPercentile.toFixed(1),
        studentAttendance: studentAttendance.toFixed(1),
        averageAttendance: parseFloat(sectionStats.avg_attendance).toFixed(1),
        attendanceDifference: (studentAttendance - sectionStats.avg_attendance).toFixed(1)
      },
      department: {
        name: student.department_name,
        totalStudents: departmentStats.total_students,
        studentGPA: studentGPA.toFixed(2),
        averageGPA: parseFloat(departmentStats.avg_gpa).toFixed(2),
        difference: (studentGPA - departmentStats.avg_gpa).toFixed(2),
        ranking: departmentRanking.rank,
        percentile: departmentPercentile.toFixed(1),
        studentAttendance: studentAttendance.toFixed(1),
        averageAttendance: parseFloat(departmentStats.avg_attendance).toFixed(1),
        attendanceDifference: (studentAttendance - departmentStats.avg_attendance).toFixed(1)
      },
      institution: {
        totalStudents: institutionStats.total_students,
        studentGPA: studentGPA.toFixed(2),
        averageGPA: parseFloat(institutionStats.avg_gpa).toFixed(2),
        difference: (studentGPA - institutionStats.avg_gpa).toFixed(2),
        studentAttendance: studentAttendance.toFixed(1),
        averageAttendance: parseFloat(institutionStats.avg_attendance).toFixed(1),
        attendanceDifference: (studentAttendance - institutionStats.avg_attendance).toFixed(1)
      }
    };

    // Generate insights
    const insights: string[] = [];

    // GPA comparison insights
    const levelDiff = studentGPA - levelStats.avg_gpa;
    if (levelDiff > 0.5) {
      insights.push(`${student.full_name} is performing significantly ABOVE their level average (${levelDiff.toFixed(2)} points higher).`);
      insights.push(`Top ${levelPercentile.toFixed(0)}th percentile in ${student.level_name} - excellent academic performance.`);
    } else if (levelDiff < -0.5) {
      insights.push(`${student.full_name} is performing BELOW their level average (${Math.abs(levelDiff).toFixed(2)} points lower).`);
      insights.push(`Bottom ${(100 - levelPercentile).toFixed(0)}% in ${student.level_name} - may need additional support.`);
    } else {
      insights.push(`${student.full_name} is performing at their level average (within ±0.5 points).`);
    }

    // Section comparison insights
    const sectionDiff = studentGPA - sectionStats.avg_gpa;
    if (sectionDiff > 0.3) {
      insights.push(`Outperforming section peers in ${student.section_name} by ${sectionDiff.toFixed(2)} points.`);
    } else if (sectionDiff < -0.3) {
      insights.push(`Underperforming compared to ${student.section_name} peers by ${Math.abs(sectionDiff).toFixed(2)} points.`);
    }

    // Attendance comparison insights
    const attendanceDiff = studentAttendance - levelStats.avg_attendance;
    if (attendanceDiff > 10) {
      insights.push(`Excellent attendance: ${Math.abs(attendanceDiff).toFixed(1)}% higher than level average.`);
    } else if (attendanceDiff < -10) {
      insights.push(`⚠️ Attendance concern: ${Math.abs(attendanceDiff).toFixed(1)}% lower than level average.`);
      insights.push('Poor attendance may be impacting academic performance.');
    }

    // Performance tier insights
    if (studentGPA >= 3.5 && levelPercentile >= 80) {
      insights.push('🏆 HONORS TIER: Consistently high performer - consider advanced opportunities or leadership roles.');
    } else if (studentGPA < 2.5 && levelPercentile <= 30) {
      insights.push('⚠️ AT-RISK TIER: Below average performance - intervention and support plan recommended.');
    } else if (levelPercentile >= 50 && levelPercentile < 80) {
      insights.push('SOLID PERFORMER: Above average with room for growth.');
    }

    // Consistency check
    const gpaRange = levelStats.max_gpa - levelStats.min_gpa;
    const relativePosition = (studentGPA - levelStats.min_gpa) / gpaRange;
    if (relativePosition > 0.7) {
      insights.push(`Strong performer within ${student.level_name} cohort.`);
    } else if (relativePosition < 0.3) {
      insights.push(`Consider peer tutoring or study groups to improve relative standing.`);
    }

    return {
      success: true,
      student: {
        name: student.full_name,
        studentId: student.student_number,
        email: student.email,
        gpa: studentGPA.toFixed(2),
        attendance: studentAttendance.toFixed(1) + '%',
        level: student.level_name,
        section: student.section_name,
        department: student.department_name
      },
      comparisons: comparisons,
      insights: insights,
      message: `Performance comparison complete for ${student.full_name}. Ranking: ${levelRanking.rank}/${levelStats.total_students} in ${student.level_name} (${levelPercentile.toFixed(1)}th percentile).`
    };
  } catch (error: any) {
    console.error('[getStudentPerformanceComparison] Error:', error);
    return {
      success: false,
      message: 'An error occurred while comparing student performance. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getStudentPerformanceComparisonDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getStudentPerformanceComparison',
    description: 'Compare a student\'s academic performance (GPA and attendance) with their peers across different groups: level average, section average, department average, and institution-wide. Returns rankings, percentiles, and contextual insights to understand relative performance.',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description: 'The full or partial name of the student to analyze (e.g., "John Smith" or "Smith"). Fuzzy matching supported.'
        }
      },
      required: ['studentName']
    }
  }
};
