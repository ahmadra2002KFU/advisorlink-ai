import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 3 Course Intelligence Function: Check Course Eligibility
 * Validates whether a student meets prerequisites and requirements for a specific course
 */
export async function checkCourseEligibility(args: any, context: any): Promise<any> {
  const { studentName, courseCode } = args;
  const { advisorId, userType, studentId: contextStudentId } = context;

  console.log(`[checkCourseEligibility] Checking eligibility for student "${studentName}" and course "${courseCode}"`);

  try {
    let student: any;

    // For advisors: find student by name
    if (userType === 'advisor' && advisorId) {
      student = db.prepare(`
        SELECT
          s.id as student_id,
          s.student_id as student_number,
          u.full_name,
          u.email,
          l.level_name,
          l.level_number,
          sec.section_name,
          s.gpa as current_gpa
        FROM advisor_assignments aa
        JOIN students s ON aa.student_id = s.id
        JOIN users u ON s.user_id = u.id
        JOIN levels l ON s.level_id = l.id
        JOIN sections sec ON s.section_id = sec.id
        WHERE aa.advisor_id = ? AND LOWER(u.full_name) LIKE LOWER(?)
        ORDER BY
          CASE
            WHEN LOWER(u.full_name) = LOWER(?) THEN 1
            WHEN LOWER(u.full_name) LIKE LOWER(?) THEN 2
            ELSE 3
          END
        LIMIT 1
      `).get(advisorId, `%${studentName}%`, studentName, `${studentName}%`) as any;
    }
    // For students: use their own context
    else if (userType === 'student' && contextStudentId) {
      student = db.prepare(`
        SELECT
          s.id as student_id,
          s.student_id as student_number,
          u.full_name,
          u.email,
          l.level_name,
          l.level_number,
          sec.section_name,
          s.gpa as current_gpa
        FROM students s
        JOIN users u ON s.user_id = u.id
        JOIN levels l ON s.level_id = l.id
        JOIN sections sec ON s.section_id = sec.id
        WHERE s.id = ?
      `).get(contextStudentId) as any;
    }

    if (!student) {
      return {
        success: false,
        message: `No student found matching "${studentName}". Please check the name and try again.`
      };
    }

    // Get course information
    const course = db.prepare(`
      SELECT
        course_code,
        course_name,
        description,
        credit_hours,
        level,
        department,
        course_type,
        instructor_name,
        semester_offered,
        max_enrollment,
        current_enrollment,
        seats_available,
        difficulty_level,
        estimated_workload_hours,
        historical_pass_rate,
        average_grade,
        is_active
      FROM course_catalog
      WHERE UPPER(course_code) = UPPER(?)
    `).get(courseCode) as any;

    if (!course) {
      return {
        success: false,
        message: `Course "${courseCode}" not found in the catalog. Please check the course code and try again.`
      };
    }

    // Check if course is active
    if (!course.is_active) {
      return {
        success: false,
        eligible: false,
        message: `${course.course_name} (${course.course_code}) is not currently being offered.`,
        course: {
          code: course.course_code,
          name: course.course_name,
          status: 'Inactive'
        }
      };
    }

    // Check if student already enrolled
    const alreadyEnrolled = db.prepare(`
      SELECT 1 FROM student_courses
      WHERE student_id = ? AND course_code = ?
    `).get(student.student_id, course.course_code);

    if (alreadyEnrolled) {
      return {
        success: true,
        eligible: false,
        message: `${student.full_name} is already enrolled in ${course.course_name}.`,
        reason: 'Already enrolled in this course',
        course: {
          code: course.course_code,
          name: course.course_name
        }
      };
    }

    // Get student's completed courses with grades
    const completedCourses = db.prepare(`
      SELECT course_code, course_name, current_grade, semester
      FROM student_courses
      WHERE student_id = ?
    `).all(student.student_id) as any[];

    // Get course prerequisites
    const prerequisites = db.prepare(`
      SELECT
        prerequisite_code,
        minimum_grade,
        is_strict,
        prerequisite_group
      FROM course_prerequisites
      WHERE course_code = ?
      ORDER BY prerequisite_group, prerequisite_code
    `).all(course.course_code) as any[];

    // Helper: Convert grade letter to GPA
    const gradeToGPA = (grade: string): number => {
      const gradeMap: { [key: string]: number } = {
        'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0,
        'F': 0.0
      };
      return gradeMap[grade] || 0.0;
    };

    let eligible = true;
    const missingPrerequisites: any[] = [];
    const satisfiedPrerequisites: any[] = [];
    const warnings: string[] = [];

    if (prerequisites.length === 0) {
      // No prerequisites - check seats and level only
      if (course.seats_available <= 0) {
        eligible = false;
        warnings.push('⚠️ No seats available - course is full');
      }

      if (course.level > student.level_number + 1) {
        warnings.push(`⚠️ This is a level ${course.level} course, you are currently level ${student.level_number}`);
      }

      return {
        success: true,
        eligible: eligible && course.seats_available > 0,
        message: eligible
          ? `${student.full_name} is eligible for ${course.course_name}. No prerequisites required.`
          : `${student.full_name} cannot register for ${course.course_name} - course is full.`,
        student: {
          name: student.full_name,
          studentId: student.student_number,
          level: student.level_name,
          gpa: parseFloat(student.current_gpa).toFixed(2)
        },
        course: {
          code: course.course_code,
          name: course.course_name,
          level: course.level,
          department: course.department,
          instructor: course.instructor_name,
          seatsAvailable: course.seats_available,
          difficulty: course.difficulty_level
        },
        prerequisites: {
          required: false,
          satisfied: [],
          missing: []
        },
        warnings: warnings.length > 0 ? warnings : undefined
      };
    }

    // Group prerequisites by prerequisite_group
    const prereqGroups: { [key: number]: any[] } = {};
    prerequisites.forEach(p => {
      if (!prereqGroups[p.prerequisite_group]) {
        prereqGroups[p.prerequisite_group] = [];
      }
      prereqGroups[p.prerequisite_group].push(p);
    });

    // Check each prerequisite group
    for (const groupId in prereqGroups) {
      const group = prereqGroups[groupId];
      let groupSatisfied = false;
      const groupDetails: any[] = [];

      for (const prereq of group) {
        const completed = completedCourses.find(c => c.course_code === prereq.prerequisite_code);

        if (completed) {
          const studentGrade = gradeToGPA(completed.current_grade || 'F');
          const requiredGrade = gradeToGPA(prereq.minimum_grade);

          const satisfied = studentGrade >= requiredGrade;
          groupDetails.push({
            code: prereq.prerequisite_code,
            name: completed.course_name,
            requiredGrade: prereq.minimum_grade,
            studentGrade: completed.current_grade,
            satisfied: satisfied,
            semester: completed.semester
          });

          if (satisfied) {
            groupSatisfied = true;
            satisfiedPrerequisites.push({
              code: prereq.prerequisite_code,
              name: completed.course_name,
              grade: completed.current_grade
            });
          }
        } else {
          groupDetails.push({
            code: prereq.prerequisite_code,
            name: null,
            requiredGrade: prereq.minimum_grade,
            studentGrade: null,
            satisfied: false,
            semester: null
          });
        }
      }

      // If group is not satisfied and is strict, mark as missing
      if (!groupSatisfied) {
        if (group[0].is_strict) {
          eligible = false;
        }

        const missingCodes = group.map(p => p.prerequisite_code);
        missingPrerequisites.push({
          group: parseInt(groupId),
          isStrict: group[0].is_strict,
          courses: missingCodes,
          logic: group.length > 1 ? 'OR' : 'Required',
          details: groupDetails
        });

        if (group[0].is_strict) {
          if (group.length > 1) {
            warnings.push(`⚠️ Missing prerequisite: You must complete one of: ${missingCodes.join(' OR ')}`);
          } else {
            warnings.push(`⚠️ Missing prerequisite: ${missingCodes[0]} (minimum grade: ${group[0].minimum_grade})`);
          }
        } else {
          warnings.push(`ℹ️ Recommended prerequisite not met: ${missingCodes.join(' OR ')}`);
        }
      }
    }

    // Additional checks
    if (course.seats_available <= 0) {
      eligible = false;
      warnings.push('⚠️ No seats available - course is full');
    }

    if (course.level > student.level_number + 1) {
      warnings.push(`ℹ️ This is a level ${course.level} course, you are currently level ${student.level_number}`);
    }

    // Calculate expected success rate based on student GPA vs course average
    const studentGPA = parseFloat(student.current_gpa);
    const courseAvg = course.average_grade;
    const gpaAdvantage = studentGPA - courseAvg;

    let expectedSuccess = course.historical_pass_rate;
    if (gpaAdvantage > 0.5) {
      expectedSuccess = Math.min(100, expectedSuccess + 10);
    } else if (gpaAdvantage < -0.5) {
      expectedSuccess = Math.max(0, expectedSuccess - 15);
    }

    const resultMessage = eligible
      ? `✅ ${student.full_name} is eligible for ${course.course_name}. All prerequisites satisfied.`
      : `❌ ${student.full_name} is NOT eligible for ${course.course_name}. Missing required prerequisites.`;

    return {
      success: true,
      eligible: eligible,
      message: resultMessage,
      student: {
        name: student.full_name,
        studentId: student.student_number,
        level: student.level_name,
        levelNumber: student.level_number,
        gpa: parseFloat(student.current_gpa).toFixed(2)
      },
      course: {
        code: course.course_code,
        name: course.course_name,
        description: course.description,
        level: course.level,
        creditHours: course.credit_hours,
        department: course.department,
        courseType: course.course_type,
        instructor: course.instructor_name,
        semesterOffered: course.semester_offered,
        seatsAvailable: course.seats_available,
        maxEnrollment: course.max_enrollment,
        difficulty: course.difficulty_level,
        estimatedWorkload: course.estimated_workload_hours,
        historicalPassRate: course.historical_pass_rate,
        averageGrade: course.average_grade
      },
      prerequisites: {
        required: prerequisites.length > 0,
        totalGroups: Object.keys(prereqGroups).length,
        satisfied: satisfiedPrerequisites,
        missing: missingPrerequisites
      },
      prediction: {
        expectedSuccessRate: Math.round(expectedSuccess),
        confidence: studentGPA >= 3.0 ? 'High' : studentGPA >= 2.5 ? 'Medium' : 'Low',
        recommendation: eligible
          ? gpaAdvantage > 0
            ? 'Recommended - you are well-prepared for this course'
            : 'Proceed with caution - this course may be challenging'
          : 'Complete missing prerequisites first'
      },
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error: any) {
    console.error('[checkCourseEligibility] Error:', error);
    return {
      success: false,
      message: 'An error occurred while checking course eligibility. Please try again.',
      error: error.message
    };
  }
}

// Function declaration for GLM API
export const checkCourseEligibilityDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'checkCourseEligibility',
    description: 'Check if a student is eligible to register for a specific course. Validates prerequisites, grade requirements, seat availability, and provides success predictions. Returns detailed eligibility status with reasons.',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description: 'The full or partial name of the student (e.g., "John Smith" or "Smith"). For students asking for themselves, use their own name. Fuzzy matching supported.'
        },
        courseCode: {
          type: 'string',
          description: 'The course code to check eligibility for (e.g., "CS201", "MATH301"). Case-insensitive.'
        }
      },
      required: ['studentName', 'courseCode']
    }
  }
};
