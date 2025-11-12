import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Phase 1 Student Function: Get Course Schedule
 * Get the schedule details for a specific course by course name or course code
 */
export async function getCourseSchedule(args: any, context: any): Promise<any> {
  const { courseName } = args;
  const { studentId } = context;

  console.log(`[getCourseSchedule] Searching for course: "${courseName}" for student ID: ${studentId}`);

  try {
    // Search in student's enrolled courses with fuzzy matching
    const courses = db.prepare(`
      SELECT
        course_name,
        course_code,
        instructor_name,
        instructor_email,
        class_time,
        class_days,
        room_number,
        building,
        credit_hours,
        current_grade,
        semester,
        department,
        course_description,
        prerequisites
      FROM student_courses
      WHERE student_id = ?
      AND (
        LOWER(course_name) LIKE LOWER(?)
        OR LOWER(course_code) LIKE LOWER(?)
      )
    `).all(studentId, `%${courseName}%`, `%${courseName}%`) as any[];

    if (courses.length === 0) {
      return {
        success: false,
        message: `No course found matching "${courseName}" in your enrolled courses. Please check the course name and try again.`
      };
    }

    if (courses.length === 1) {
      const course = courses[0];
      return {
        success: true,
        course: {
          name: course.course_name,
          code: course.course_code,
          instructor: course.instructor_name,
          instructorEmail: course.instructor_email,
          schedule: `${course.class_days} at ${course.class_time}`,
          location: `Room ${course.room_number}, ${course.building}`,
          credits: course.credit_hours,
          grade: course.current_grade,
          semester: course.semester,
          department: course.department,
          description: course.course_description,
          prerequisites: course.prerequisites
        }
      };
    }

    // Multiple matches found
    return {
      success: true,
      message: `Found ${courses.length} courses matching "${courseName}"`,
      courses: courses.map(c => ({
        name: c.course_name,
        code: c.course_code,
        instructor: c.instructor_name,
        instructorEmail: c.instructor_email,
        schedule: `${c.class_days} at ${c.class_time}`,
        location: `Room ${c.room_number}, ${c.building}`,
        credits: c.credit_hours,
        grade: c.current_grade,
        semester: c.semester
      }))
    };
  } catch (error: any) {
    console.error('[getCourseSchedule] Error:', error);
    return {
      success: false,
      message: 'An error occurred while searching for the course. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getCourseScheduleDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getCourseSchedule',
    description: 'Get the schedule details for a specific course by course name or course code. Returns instructor name, class time, days, room number, building location, and credit hours.',
    parameters: {
      type: 'object',
      properties: {
        courseName: {
          type: 'string',
          description: 'The name or code of the course to search for (e.g., "Introduction to Computer Science" or "CS101")'
        }
      },
      required: ['courseName']
    }
  }
};
