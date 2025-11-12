import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 3 Course Intelligence Function: Get Graduation Pathway
 * Generates a semester-by-semester plan to graduation with prerequisite ordering
 */
export async function getGraduationPathway(args: any, context: any): Promise<any> {
  const { studentName, creditsPerSemester = 15 } = args;
  const { advisorId, userType, studentId: contextStudentId } = context;

  console.log(`[getGraduationPathway] Generating graduation pathway for: "${studentName}"`);

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

    // Get completed courses
    const completedCourses = db.prepare(`
      SELECT course_code, course_name, current_grade, semester, credit_hours
      FROM student_courses
      WHERE student_id = ?
    `).all(student.student_id) as any[];

    // Calculate completed credits
    const completedCredits = completedCourses.reduce((sum, course) => {
      return sum + (course.credit_hours || 3);
    }, 0);

    // Get all required courses from catalog
    const requiredCourses = db.prepare(`
      SELECT
        course_code,
        course_name,
        credit_hours,
        level,
        department,
        semester_offered,
        difficulty_level,
        historical_pass_rate,
        average_grade
      FROM course_catalog
      WHERE (course_type = 'required' OR course_type = 'general_education')
        AND is_active = 1
      ORDER BY level, department, course_code
    `).all() as any[];

    // Get all prerequisites
    const allPrerequisites = db.prepare(`
      SELECT
        course_code,
        prerequisite_code,
        minimum_grade,
        prerequisite_group
      FROM course_prerequisites
    `).all() as any[];

    // Filter out completed courses
    const completedCodesSet = new Set(completedCourses.map(c => c.course_code));
    const remainingCourses = requiredCourses.filter(c => !completedCodesSet.has(c.course_code));

    // Calculate remaining credits
    const remainingCredits = remainingCourses.reduce((sum, course) => {
      return sum + (course.credit_hours || 3);
    }, 0);

    // Typical degree requirement: 120 credits
    const totalCreditsRequired = 120;
    const percentComplete = (completedCredits / totalCreditsRequired) * 100;

    // Helper: Check if prerequisites are met for a course
    const arePrerequisitesMet = (courseCode: string, alreadyPlannedCodes: Set<string>): boolean => {
      const prerequisites = allPrerequisites.filter(p => p.course_code === courseCode);

      if (prerequisites.length === 0) return true;

      // Group by prerequisite_group
      const groups: { [key: number]: any[] } = {};
      prerequisites.forEach(p => {
        if (!groups[p.prerequisite_group]) {
          groups[p.prerequisite_group] = [];
        }
        groups[p.prerequisite_group].push(p);
      });

      // All groups must be satisfied (AND logic)
      for (const groupId in groups) {
        const group = groups[groupId];
        let groupSatisfied = false;

        // At least one in the group must be satisfied (OR logic within group)
        for (const prereq of group) {
          if (completedCodesSet.has(prereq.prerequisite_code) ||
              alreadyPlannedCodes.has(prereq.prerequisite_code)) {
            groupSatisfied = true;
            break;
          }
        }

        if (!groupSatisfied) return false;
      }

      return true;
    };

    // Generate semester plan
    const semesterPlan: any[] = [];
    const plannedCodes = new Set<string>();
    let currentSemester = 1;
    let coursesToPlan = [...remainingCourses];

    // Determine current semester season (for semester_offered logic)
    const currentMonth = new Date().getMonth() + 1;
    let nextSemesterType = currentMonth >= 1 && currentMonth <= 5 ? 'Spring' :
                          currentMonth >= 6 && currentMonth <= 8 ? 'Summer' : 'Fall';

    // Plan courses semester by semester
    while (coursesToPlan.length > 0 && currentSemester <= 12) {
      const semesterCourses: any[] = [];
      let semesterCredits = 0;
      const maxCredits = creditsPerSemester;

      // Try to add courses to this semester
      const availableThisSemester = coursesToPlan.filter(course => {
        // Check if prerequisites are met
        if (!arePrerequisitesMet(course.course_code, plannedCodes)) {
          return false;
        }

        // Check if offered this semester
        if (course.semester_offered !== 'Both' && course.semester_offered !== nextSemesterType) {
          return false;
        }

        return true;
      });

      // Sort by priority: level (ascending), then difficulty (easier first)
      availableThisSemester.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        const diffOrder: { [key: string]: number } = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        return (diffOrder[a.difficulty_level] || 2) - (diffOrder[b.difficulty_level] || 2);
      });

      // Add courses up to credit limit
      for (const course of availableThisSemester) {
        const courseCredits = course.credit_hours || 3;

        if (semesterCredits + courseCredits <= maxCredits) {
          semesterCourses.push({
            code: course.course_code,
            name: course.course_name,
            credits: courseCredits,
            level: course.level,
            department: course.department,
            difficulty: course.difficulty_level,
            passRate: course.historical_pass_rate,
            avgGrade: course.average_grade
          });

          plannedCodes.add(course.course_code);
          semesterCredits += courseCredits;

          // Remove from courses to plan
          coursesToPlan = coursesToPlan.filter(c => c.course_code !== course.course_code);
        }
      }

      // If we added courses this semester, add to plan
      if (semesterCourses.length > 0) {
        semesterPlan.push({
          semester: currentSemester,
          semesterType: nextSemesterType,
          courses: semesterCourses,
          totalCredits: semesterCredits,
          courseCount: semesterCourses.length
        });

        // Rotate semester type (Fall -> Spring -> Summer -> Fall)
        if (nextSemesterType === 'Fall') {
          nextSemesterType = 'Spring';
        } else if (nextSemesterType === 'Spring') {
          nextSemesterType = 'Summer';
        } else {
          nextSemesterType = 'Fall';
        }

        currentSemester++;
      } else {
        // No courses available - might be waiting for prerequisites
        // Skip to next semester
        if (nextSemesterType === 'Fall') {
          nextSemesterType = 'Spring';
        } else if (nextSemesterType === 'Spring') {
          nextSemesterType = 'Summer';
        } else {
          nextSemesterType = 'Fall';
        }
        currentSemester++;

        // Safety: if we've gone 3 semesters without adding courses, break
        if (currentSemester > 3 && semesterPlan.length === 0) {
          break;
        }
      }
    }

    // Calculate graduation estimate
    const semestersToGraduation = semesterPlan.length;
    const yearsToGraduation = Math.ceil(semestersToGraduation / 2); // Assuming 2 semesters per year

    const today = new Date();
    const estimatedGraduationDate = new Date(today);
    estimatedGraduationDate.setMonth(today.getMonth() + (semestersToGraduation * 4)); // ~4 months per semester

    // Generate insights
    const insights: string[] = [];

    if (percentComplete >= 75) {
      insights.push(`${student.full_name} is ${percentComplete.toFixed(0)}% complete - on track for graduation!`);
    } else if (percentComplete >= 50) {
      insights.push(`${student.full_name} is halfway through the program (${percentComplete.toFixed(0)}% complete).`);
    } else if (percentComplete >= 25) {
      insights.push(`${student.full_name} has completed ${percentComplete.toFixed(0)}% of required credits.`);
    } else {
      insights.push(`${student.full_name} is in the early stages (${percentComplete.toFixed(0)}% complete).`);
    }

    if (student.current_gpa >= 3.5) {
      insights.push(`Excellent GPA (${parseFloat(student.current_gpa).toFixed(2)}) - consider honors program or advanced courses.`);
    } else if (student.current_gpa < 2.5) {
      insights.push(`GPA below 2.5 - recommend academic support and lighter course load.`);
    }

    if (semesterPlan.length > 0) {
      const avgCoursesPerSemester = semesterPlan.reduce((sum, s) => sum + s.courseCount, 0) / semesterPlan.length;
      insights.push(`Recommended pace: ${avgCoursesPerSemester.toFixed(1)} courses per semester.`);
    }

    if (coursesToPlan.length > 0) {
      insights.push(`⚠️ ${coursesToPlan.length} courses could not be scheduled (may need prerequisite review).`);
    }

    return {
      success: true,
      student: {
        name: student.full_name,
        studentId: student.student_number,
        level: student.level_name,
        levelNumber: student.level_number,
        gpa: parseFloat(student.current_gpa).toFixed(2)
      },
      progress: {
        completedCredits: completedCredits,
        remainingCredits: remainingCredits,
        totalCreditsRequired: totalCreditsRequired,
        percentComplete: parseFloat(percentComplete.toFixed(1)),
        completedCourses: completedCourses.length,
        remainingCourses: remainingCourses.length
      },
      graduationEstimate: {
        semestersRemaining: semestersToGraduation,
        yearsRemaining: yearsToGraduation,
        estimatedDate: estimatedGraduationDate.toISOString().split('T')[0],
        coursesPerSemester: creditsPerSemester / 3 // Assuming 3 credits per course average
      },
      semesterPlan: semesterPlan,
      unscheduledCourses: coursesToPlan.map(c => ({
        code: c.course_code,
        name: c.course_name,
        reason: 'Prerequisites not met or semester offering conflict'
      })),
      insights: insights,
      message: `Generated ${semesterPlan.length}-semester graduation plan for ${student.full_name}. Estimated graduation: ${estimatedGraduationDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`
    };
  } catch (error: any) {
    console.error('[getGraduationPathway] Error:', error);
    return {
      success: false,
      message: 'An error occurred while generating graduation pathway. Please try again.',
      error: error.message
    };
  }
}

// Function declaration for GLM API
export const getGraduationPathwayDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getGraduationPathway',
    description: 'Generate a comprehensive semester-by-semester graduation plan for a student. Respects prerequisites, course offerings, and credit load. Returns detailed pathway with estimated graduation date and progress tracking.',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description: 'The full or partial name of the student (e.g., "John Smith" or "Smith"). For students asking for themselves, use their own name. Fuzzy matching supported.'
        },
        creditsPerSemester: {
          type: 'number',
          description: 'Target credits per semester (default: 15). Typical range: 12-18 credits. Lower for part-time students, higher for accelerated programs.'
        }
      },
      required: ['studentName']
    }
  }
};
