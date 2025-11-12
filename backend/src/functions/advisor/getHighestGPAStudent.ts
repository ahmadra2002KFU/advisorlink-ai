import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Get the student with the highest GPA among advisor's assigned students
 */
export async function getHighestGPAStudent(args: any, context: any): Promise<any> {
  const { advisorId } = context;

  console.log(`[getHighestGPAStudent] Finding highest GPA student for advisor ID: ${advisorId}`);

  try {
    const student = db.prepare(`
      SELECT
        s.student_id as student_number,
        u.full_name,
        u.email,
        l.level_number,
        l.level_name,
        sec.section_name,
        s.gpa,
        s.attendance_percentage
      FROM advisor_assignments aa
      JOIN students s ON aa.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE aa.advisor_id = ? AND s.gpa IS NOT NULL
      ORDER BY s.gpa DESC
      LIMIT 1
    `).get(advisorId) as any;

    if (!student) {
      return {
        success: false,
        message: 'No students with recorded GPAs found in your assigned students.'
      };
    }

    return {
      success: true,
      message: `${student.full_name} has the highest GPA among your students`,
      student: {
        studentId: student.student_number,
        name: student.full_name,
        email: student.email,
        level: `${student.level_name} (Level ${student.level_number})`,
        section: student.section_name,
        gpa: parseFloat(student.gpa).toFixed(2),
        attendance: student.attendance_percentage ? `${parseFloat(student.attendance_percentage).toFixed(1)}%` : 'N/A'
      }
    };
  } catch (error: any) {
    console.error('[getHighestGPAStudent] Error:', error);
    return {
      success: false,
      message: 'An error occurred while finding the highest GPA student. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getHighestGPAStudentDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getHighestGPAStudent',
    description: 'Get the student with the highest GPA among those assigned to the current advisor. Returns the top student\'s name, email, level, section, GPA, and attendance.',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
};
