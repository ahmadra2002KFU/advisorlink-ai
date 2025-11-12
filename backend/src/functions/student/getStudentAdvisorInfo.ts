import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Get the student's assigned advisor information
 */
export async function getStudentAdvisorInfo(args: any, context: any): Promise<any> {
  const { studentId } = context;

  console.log(`[getStudentAdvisorInfo] Getting advisor for student ID: ${studentId}`);

  try {
    const advisor = db.prepare(`
      SELECT
        u.full_name,
        u.email,
        a.specialization,
        a.is_available,
        CASE WHEN a.is_available = 1 THEN 'Available' ELSE 'Unavailable' END as availability
      FROM advisor_assignments aa
      JOIN advisors a ON aa.advisor_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE aa.student_id = ?
    `).get(studentId) as any;

    if (!advisor) {
      return {
        success: false,
        message: 'No advisor has been assigned to you yet. Please contact the admissions office.'
      };
    }

    return {
      success: true,
      advisor: {
        name: advisor.full_name,
        email: advisor.email,
        specialization: advisor.specialization,
        availability: advisor.availability
      }
    };
  } catch (error: any) {
    console.error('[getStudentAdvisorInfo] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving your advisor information. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getStudentAdvisorInfoDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getStudentAdvisorInfo',
    description: 'Get the assigned advisor information for the current student. Returns advisor name, email, specialization, and availability status.',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
};
