import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 3 Course Intelligence Function: Get Course Difficulty Prediction
 * Predicts student's likelihood of success in a specific course based on historical performance
 */
export async function getCourseDifficultyPrediction(args: any, context: any): Promise<any> {
  const { studentName, courseCode } = args;
  const { advisorId, userType, studentId: contextStudentId } = context;

  console.log(`[getCourseDifficultyPrediction] Predicting difficulty for student "${studentName}" in course "${courseCode}"`);

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
          s.attendance_percentage
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
          s.attendance_percentage
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
        difficulty_level,
        estimated_workload_hours,
        historical_pass_rate,
        average_grade,
        instructor_name
      FROM course_catalog
      WHERE UPPER(course_code) = UPPER(?)
    `).get(courseCode) as any;

    if (!course) {
      return {
        success: false,
        message: `Course "${courseCode}" not found in the catalog. Please check the course code and try again.`
      };
    }

    // Get student's completed courses
    const completedCourses = db.prepare(`
      SELECT course_code, course_name, current_grade, semester, department, credit_hours
      FROM student_courses
      WHERE student_id = ?
    `).all(student.student_id) as any[];

    // Helper: Convert grade to GPA
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

    // Analyze performance in same department
    const sameDeptCourses = completedCourses.filter(c => c.department === course.department);
    const sameDeptGrades = sameDeptCourses.map(c => gradeToGPA(c.current_grade || 'C'));
    const avgDeptGPA = sameDeptGrades.length > 0
      ? sameDeptGrades.reduce((sum, g) => sum + g, 0) / sameDeptGrades.length
      : parseFloat(student.current_gpa);

    // Analyze performance in prerequisite courses
    const prerequisites = db.prepare(`
      SELECT prerequisite_code
      FROM course_prerequisites
      WHERE course_code = ?
    `).all(course.course_code) as any[];

    const prereqCourses = completedCourses.filter(c =>
      prerequisites.some(p => p.prerequisite_code === c.course_code)
    );

    const prereqGrades = prereqCourses.map(c => gradeToGPA(c.current_grade || 'C'));
    const avgPrereqGPA = prereqGrades.length > 0
      ? prereqGrades.reduce((sum, g) => sum + g, 0) / prereqGrades.length
      : avgDeptGPA;

    // Calculate success probability
    const studentGPA = parseFloat(student.current_gpa);
    const courseAvgGrade = course.average_grade || 2.5;
    const coursePassRate = course.historical_pass_rate || 75.0;

    // Factors for prediction
    let successProbability = coursePassRate; // Start with course baseline

    // Factor 1: Overall GPA advantage (±20%)
    const gpaAdvantage = studentGPA - courseAvgGrade;
    if (gpaAdvantage > 0.8) {
      successProbability += 20;
    } else if (gpaAdvantage > 0.4) {
      successProbability += 15;
    } else if (gpaAdvantage > 0) {
      successProbability += 10;
    } else if (gpaAdvantage > -0.4) {
      successProbability -= 5;
    } else if (gpaAdvantage > -0.8) {
      successProbability -= 15;
    } else {
      successProbability -= 25;
    }

    // Factor 2: Department performance (±15%)
    const deptAdvantage = avgDeptGPA - courseAvgGrade;
    if (sameDeptCourses.length >= 3) {
      if (deptAdvantage > 0.5) {
        successProbability += 15;
      } else if (deptAdvantage > 0) {
        successProbability += 10;
      } else if (deptAdvantage < -0.5) {
        successProbability -= 15;
      } else {
        successProbability -= 5;
      }
    }

    // Factor 3: Prerequisite performance (±10%)
    if (prereqCourses.length > 0) {
      if (avgPrereqGPA >= 3.5) {
        successProbability += 10;
      } else if (avgPrereqGPA >= 3.0) {
        successProbability += 5;
      } else if (avgPrereqGPA < 2.5) {
        successProbability -= 10;
      }
    }

    // Factor 4: Attendance (±10%)
    const attendance = student.attendance_percentage || 85;
    if (attendance >= 95) {
      successProbability += 10;
    } else if (attendance >= 85) {
      successProbability += 5;
    } else if (attendance < 70) {
      successProbability -= 10;
    } else if (attendance < 80) {
      successProbability -= 5;
    }

    // Clamp to 0-100%
    successProbability = Math.max(0, Math.min(100, successProbability));

    // Predict expected grade
    let expectedGrade: string;
    let expectedGPA: number;

    if (successProbability >= 90) {
      expectedGrade = 'A';
      expectedGPA = 4.0;
    } else if (successProbability >= 80) {
      expectedGrade = 'A- to B+';
      expectedGPA = 3.5;
    } else if (successProbability >= 70) {
      expectedGrade = 'B to B-';
      expectedGPA = 3.0;
    } else if (successProbability >= 60) {
      expectedGrade = 'C+ to C';
      expectedGPA = 2.2;
    } else if (successProbability >= 50) {
      expectedGrade = 'C to C-';
      expectedGPA = 1.8;
    } else {
      expectedGrade = 'D or F';
      expectedGPA = 1.0;
    }

    // Generate difficulty assessment
    let difficultyAssessment: string;
    if (gpaAdvantage > 0.5) {
      difficultyAssessment = 'Easy';
    } else if (gpaAdvantage > 0) {
      difficultyAssessment = 'Manageable';
    } else if (gpaAdvantage > -0.5) {
      difficultyAssessment = 'Challenging';
    } else {
      difficultyAssessment = 'Very Difficult';
    }

    // Generate confidence level
    const dataPoints = completedCourses.length + sameDeptCourses.length + prereqCourses.length;
    let confidence: string;
    if (dataPoints >= 10 && sameDeptCourses.length >= 3) {
      confidence = 'High';
    } else if (dataPoints >= 5 && sameDeptCourses.length >= 1) {
      confidence = 'Medium';
    } else {
      confidence = 'Low';
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (successProbability >= 80) {
      recommendations.push('✅ You are well-prepared for this course - proceed with confidence');
      recommendations.push('Consider taking this course alongside other challenging courses');
    } else if (successProbability >= 65) {
      recommendations.push('✅ You have a good chance of success with consistent effort');
      recommendations.push('Attend all classes and start assignments early');
    } else if (successProbability >= 50) {
      recommendations.push('⚠️ This course will be challenging - consider taking it alone or with easier courses');
      recommendations.push('Plan to dedicate extra study time and seek tutoring if needed');
      recommendations.push(`Estimated workload: ${course.estimated_workload_hours} hours/week`);
    } else {
      recommendations.push('❌ High risk of difficulty - strongly consider prerequisites or preparation');
      recommendations.push('Meet with your advisor before registering');
      recommendations.push('Consider taking preparatory courses first');
    }

    if (sameDeptCourses.length < 2) {
      recommendations.push(`ℹ️ Limited ${course.department} course history - prediction may be less accurate`);
    }

    if (attendance < 85) {
      recommendations.push('⚠️ Improve attendance to boost success probability');
    }

    // Calculate study hours needed
    const baseStudyHours = course.estimated_workload_hours || 9;
    const adjustedStudyHours = difficultyAssessment === 'Easy' ? baseStudyHours * 0.8 :
                                difficultyAssessment === 'Manageable' ? baseStudyHours :
                                difficultyAssessment === 'Challenging' ? baseStudyHours * 1.3 :
                                baseStudyHours * 1.6;

    return {
      success: true,
      student: {
        name: student.full_name,
        studentId: student.student_number,
        level: student.level_name,
        gpa: parseFloat(student.current_gpa).toFixed(2),
        attendance: attendance
      },
      course: {
        code: course.course_code,
        name: course.course_name,
        description: course.description,
        level: course.level,
        department: course.department,
        difficulty: course.difficulty_level,
        instructor: course.instructor_name,
        historicalPassRate: course.historical_pass_rate,
        averageGrade: course.average_grade
      },
      prediction: {
        successProbability: Math.round(successProbability),
        expectedGrade: expectedGrade,
        expectedGPA: expectedGPA,
        difficultyAssessment: difficultyAssessment,
        confidence: confidence,
        confidenceNote: `Based on ${completedCourses.length} completed courses, ${sameDeptCourses.length} in ${course.department} department`
      },
      analysis: {
        overallGPA: parseFloat(student.current_gpa).toFixed(2),
        departmentGPA: avgDeptGPA.toFixed(2),
        departmentCoursesTaken: sameDeptCourses.length,
        prerequisiteGPA: prereqCourses.length > 0 ? avgPrereqGPA.toFixed(2) : 'N/A',
        prerequisitesTaken: prereqCourses.length,
        gpaAdvantage: gpaAdvantage.toFixed(2),
        attendanceRate: attendance
      },
      studyPlan: {
        estimatedWeeklyHours: Math.round(adjustedStudyHours),
        recommendedStartWeeks: difficultyAssessment === 'Very Difficult' ? 2 : 1,
        tutoringSuggested: successProbability < 70,
        studyGroupRecommended: successProbability < 80
      },
      recommendations: recommendations,
      relatedCourses: {
        sameDepartment: sameDeptCourses.map(c => ({
          code: c.course_code,
          name: c.course_name,
          grade: c.current_grade
        })),
        prerequisites: prereqCourses.map(c => ({
          code: c.course_code,
          name: c.course_name,
          grade: c.current_grade
        }))
      },
      message: `Success probability for ${student.full_name} in ${course.course_name}: ${Math.round(successProbability)}%. Expected grade: ${expectedGrade}. Difficulty: ${difficultyAssessment}.`
    };
  } catch (error: any) {
    console.error('[getCourseDifficultyPrediction] Error:', error);
    return {
      success: false,
      message: 'An error occurred while predicting course difficulty. Please try again.',
      error: error.message
    };
  }
}

// Function declaration for GLM API
export const getCourseDifficultyPredictionDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getCourseDifficultyPrediction',
    description: 'Predict a student\'s likelihood of success in a specific course based on their GPA, performance in related courses, prerequisites, and attendance. Returns success probability, expected grade, difficulty assessment, and personalized recommendations.',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description: 'The full or partial name of the student (e.g., "John Smith" or "Smith"). For students asking for themselves, use their own name. Fuzzy matching supported.'
        },
        courseCode: {
          type: 'string',
          description: 'The course code to predict difficulty for (e.g., "CS201", "MATH301"). Case-insensitive.'
        }
      },
      required: ['studentName', 'courseCode']
    }
  }
};
