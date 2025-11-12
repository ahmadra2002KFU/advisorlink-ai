import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 3 Course Intelligence Function: Get Course Recommendations
 * AI-powered course recommendations based on student profile, prerequisites, and performance
 */
export async function getCourseRecommendations(args: any, context: any): Promise<any> {
  const { studentName, limit = 5, semesterFilter } = args;
  const { advisorId, userType, studentId: contextStudentId } = context;

  console.log(`[getCourseRecommendations] Getting recommendations for: "${studentName}" (limit: ${limit})`);

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
          s.gpa as current_gpa,
          s.level_id
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
          s.gpa as current_gpa,
          s.level_id
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

    // Get student's completed courses with grades
    const completedCourses = db.prepare(`
      SELECT course_code, course_name, current_grade, semester, department
      FROM student_courses
      WHERE student_id = ?
    `).all(student.student_id) as any[];

    // Get available courses from catalog
    let availableCoursesQuery = `
      SELECT
        cc.course_code,
        cc.course_name,
        cc.description,
        cc.credit_hours,
        cc.level,
        cc.department,
        cc.course_type,
        cc.semester_offered,
        cc.max_enrollment,
        cc.current_enrollment,
        cc.seats_available,
        cc.difficulty_level,
        cc.estimated_workload_hours,
        cc.historical_pass_rate,
        cc.average_grade,
        cc.instructor_name
      FROM course_catalog cc
      WHERE cc.is_active = 1
        AND cc.seats_available > 0
        AND cc.course_code NOT IN (
          SELECT course_code FROM student_courses WHERE student_id = ?
        )
    `;

    const queryParams: any[] = [student.student_id];

    // Apply semester filter if provided
    if (semesterFilter && semesterFilter !== 'All') {
      availableCoursesQuery += ` AND (cc.semester_offered = ? OR cc.semester_offered = 'Both')`;
      queryParams.push(semesterFilter);
    }

    availableCoursesQuery += ` ORDER BY cc.level, cc.course_type`;

    const availableCourses = db.prepare(availableCoursesQuery).all(...queryParams) as any[];

    if (availableCourses.length === 0) {
      return {
        success: false,
        message: `No available courses found that you haven't already taken. You may have completed most courses!`
      };
    }

    // Get all prerequisites
    const prerequisites = db.prepare(`
      SELECT
        course_code,
        prerequisite_code,
        minimum_grade,
        is_strict,
        prerequisite_group
      FROM course_prerequisites
    `).all() as any[];

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

    // Helper: Check if prerequisites are met for a course
    const checkPrerequisites = (courseCode: string): { met: boolean; missing: string[] } => {
      const coursePrereqs = prerequisites.filter(p => p.course_code === courseCode);

      if (coursePrereqs.length === 0) {
        return { met: true, missing: [] };
      }

      // Group prerequisites by prerequisite_group
      const prereqGroups: { [key: number]: any[] } = {};
      coursePrereqs.forEach(p => {
        if (!prereqGroups[p.prerequisite_group]) {
          prereqGroups[p.prerequisite_group] = [];
        }
        prereqGroups[p.prerequisite_group].push(p);
      });

      const missing: string[] = [];

      // Check each group (groups are AND, within group is OR)
      for (const groupId in prereqGroups) {
        const group = prereqGroups[groupId];
        let groupSatisfied = false;

        for (const prereq of group) {
          const completed = completedCourses.find(c => c.course_code === prereq.prerequisite_code);

          if (completed) {
            const studentGrade = gradeToGPA(completed.current_grade || 'F');
            const requiredGrade = gradeToGPA(prereq.minimum_grade);

            if (studentGrade >= requiredGrade) {
              groupSatisfied = true;
              break; // One satisfied prerequisite in OR group is enough
            }
          }
        }

        if (!groupSatisfied) {
          // Add all prerequisites from this unsatisfied group
          group.forEach(p => {
            if (!missing.includes(p.prerequisite_code)) {
              missing.push(p.prerequisite_code);
            }
          });
        }
      }

      return {
        met: missing.length === 0,
        missing
      };
    };

    // Calculate recommendation scores
    const recommendations = availableCourses.map(course => {
      const prereqStatus = checkPrerequisites(course.course_code);

      let score = 0;
      const reasons: string[] = [];

      // Factor 1: Graduation requirements (40 points)
      if (course.course_type === 'required') {
        score += 40;
        reasons.push('Required for your major');
      } else if (course.course_type === 'general_education') {
        score += 30;
        reasons.push('General education requirement');
      } else {
        score += 15;
        reasons.push('Elective course');
      }

      // Factor 2: Student GPA vs Course average (30 points)
      const studentGPA = parseFloat(student.current_gpa) || 0;
      const courseAvgGrade = course.average_grade || 2.5;
      const gpaMatch = studentGPA - courseAvgGrade;

      if (gpaMatch >= 0.5) {
        score += 30;
        reasons.push('Your GPA is well above course average - good fit');
      } else if (gpaMatch >= 0) {
        score += 25;
        reasons.push('Your GPA matches course average');
      } else if (gpaMatch >= -0.5) {
        score += 15;
        reasons.push('Challenging but achievable based on your GPA');
      } else {
        score += 5;
        reasons.push('This course may be very challenging for you');
      }

      // Factor 3: Course difficulty vs student capability (20 points)
      if (course.difficulty_level === 'Easy') {
        score += studentGPA >= 3.0 ? 15 : 20;
        if (studentGPA >= 3.5) {
          reasons.push('Easy course - consider more challenging options');
        }
      } else if (course.difficulty_level === 'Medium') {
        score += 20;
      } else if (course.difficulty_level === 'Hard') {
        if (studentGPA >= 3.5) {
          score += 20;
          reasons.push('Challenging course - you have strong GPA to handle it');
        } else if (studentGPA >= 3.0) {
          score += 15;
        } else {
          score += 5;
          reasons.push('Very challenging - consider taking prerequisites first');
        }
      }

      // Factor 4: Seat availability (10 points)
      const availabilityRatio = course.seats_available / course.max_enrollment;
      if (availabilityRatio > 0.5) {
        score += 10;
        reasons.push(`Plenty of seats available (${course.seats_available} left)`);
      } else if (availabilityRatio > 0.2) {
        score += 7;
        reasons.push(`Limited seats (${course.seats_available} left)`);
      } else {
        score += 3;
        reasons.push(`Very few seats (${course.seats_available} left - register soon!)`);
      }

      // Penalty: Prerequisites not met (reduce score significantly)
      if (!prereqStatus.met) {
        score = score * 0.5; // 50% penalty
        reasons.unshift(`⚠️ Missing prerequisites: ${prereqStatus.missing.join(', ')}`);
      }

      // Penalty: Course level too high
      if (course.level > student.level_number + 1) {
        score = score * 0.7; // 30% penalty
        reasons.push(`Course is for level ${course.level}, you are level ${student.level_number}`);
      }

      // Determine difficulty match
      let difficultyMatch = 'Good';
      if (studentGPA >= courseAvgGrade + 0.5) {
        difficultyMatch = 'Easy';
      } else if (studentGPA < courseAvgGrade - 0.3) {
        difficultyMatch = 'Challenging';
      }

      return {
        course_code: course.course_code,
        course_name: course.course_name,
        description: course.description,
        credit_hours: course.credit_hours,
        level: course.level,
        department: course.department,
        course_type: course.course_type,
        semester_offered: course.semester_offered,
        instructor_name: course.instructor_name,
        difficulty_level: course.difficulty_level,
        difficulty_match: difficultyMatch,
        estimated_workload_hours: course.estimated_workload_hours,
        historical_pass_rate: course.historical_pass_rate,
        average_grade: course.average_grade,
        seats_available: course.seats_available,
        max_enrollment: course.max_enrollment,
        prerequisites_met: prereqStatus.met,
        missing_prerequisites: prereqStatus.missing.join(', ') || null,
        recommendation_score: Math.round(score * 10) / 10, // Round to 1 decimal
        recommendation_reasons: reasons.join('. ')
      };
    });

    // Sort by score (highest first) and take top N
    recommendations.sort((a, b) => b.recommendation_score - a.recommendation_score);
    const topRecommendations = recommendations.slice(0, limit);

    return {
      success: true,
      student: {
        name: student.full_name,
        studentId: student.student_number,
        email: student.email,
        level: student.level_name,
        levelNumber: student.level_number,
        section: student.section_name,
        currentGPA: parseFloat(student.current_gpa).toFixed(2)
      },
      summary: {
        totalAvailableCourses: availableCourses.length,
        coursesWithPrerequisitesMet: recommendations.filter(r => r.prerequisites_met).length,
        recommendationsShown: topRecommendations.length,
        completedCourses: completedCourses.length
      },
      recommendations: topRecommendations,
      message: `Generated ${topRecommendations.length} course recommendations for ${student.full_name}. Top recommendation: ${topRecommendations[0]?.course_name || 'None'} (score: ${topRecommendations[0]?.recommendation_score || 0}).`
    };
  } catch (error: any) {
    console.error('[getCourseRecommendations] Error:', error);
    return {
      success: false,
      message: 'An error occurred while generating course recommendations. Please try again.',
      error: error.message
    };
  }
}

// Function declaration for GLM API
export const getCourseRecommendationsDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getCourseRecommendations',
    description: 'Generate AI-powered course recommendations for a student based on their GPA, completed courses, prerequisites, course difficulty, and seat availability. Returns top N recommendations with scores and detailed reasoning.',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description: 'The full or partial name of the student (e.g., "John Smith" or "Smith"). For students asking for themselves, use their own name. Fuzzy matching supported.'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of recommendations to return (default: 5). Range: 1-10.'
        },
        semesterFilter: {
          type: 'string',
          description: 'Filter by semester offered: "Fall", "Spring", "Summer", or "All" (default: All)',
          enum: ['Fall', 'Spring', 'Summer', 'All']
        }
      },
      required: ['studentName']
    }
  }
};
