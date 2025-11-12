import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Get the complete list of students assigned to the current advisor
 */
export async function getAdvisorStudentList(args: any, context: any): Promise<any> {
  const { advisorId } = context;

  console.log(`[getAdvisorStudentList] Getting student list for advisor ID: ${advisorId}`);

  try {
    const students = db.prepare(`
      SELECT
        s.id as student_id,
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
      WHERE aa.advisor_id = ?
      ORDER BY l.level_number, sec.section_name, u.full_name
    `).all(advisorId) as any[];

    if (students.length === 0) {
      return {
        success: false,
        message: 'No students are currently assigned to you. Please contact the administration if this seems incorrect.'
      };
    }

    return {
      success: true,
      message: `You have ${students.length} student${students.length !== 1 ? 's' : ''} assigned`,
      totalStudents: students.length,
      students: students.map(s => ({
        studentId: s.student_number,
        name: s.full_name,
        email: s.email,
        level: `${s.level_name} (Level ${s.level_number})`,
        section: s.section_name,
        gpa: s.gpa ? parseFloat(s.gpa).toFixed(2) : 'N/A',
        attendance: s.attendance_percentage ? `${parseFloat(s.attendance_percentage).toFixed(1)}%` : 'N/A'
      }))
    };
  } catch (error: any) {
    console.error('[getAdvisorStudentList] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving your student list. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getAdvisorStudentListDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getAdvisorStudentList',
    description: 'Get the complete list of students assigned to the current advisor. Returns student names, emails, levels, sections, GPAs, and attendance information. Ordered by level, section, and name.',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
};
