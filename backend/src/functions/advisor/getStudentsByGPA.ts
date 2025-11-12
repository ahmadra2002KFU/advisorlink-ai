import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Get students based on GPA threshold comparison
 * Can find students above or below a specific GPA
 */
export async function getStudentsByGPA(args: any, context: any): Promise<any> {
  const { threshold, comparison = 'below' } = args;
  const { advisorId } = context;

  console.log(`[getStudentsByGPA] Finding students ${comparison} GPA ${threshold} for advisor ID: ${advisorId}`);

  try {
    // Validate threshold parameter
    if (threshold < 0 || threshold > 4.0) {
      return {
        success: false,
        message: 'Invalid GPA threshold. Please provide a value between 0.0 and 4.0.'
      };
    }

    // Validate comparison parameter
    if (comparison !== 'below' && comparison !== 'above') {
      return {
        success: false,
        message: 'Invalid comparison type. Please use "below" or "above".'
      };
    }

    // Build dynamic WHERE clause based on comparison
    const operator = comparison === 'below' ? '<' : '>';
    const orderDirection = comparison === 'below' ? 'ASC' : 'DESC';

    const students = db.prepare(`
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
      WHERE aa.advisor_id = ? AND s.gpa IS NOT NULL AND s.gpa ${operator} ?
      ORDER BY s.gpa ${orderDirection}, u.full_name
    `).all(advisorId, threshold) as any[];

    if (students.length === 0) {
      return {
        success: false,
        message: `No students found with GPA ${comparison} ${threshold.toFixed(2)} among your assigned students.`
      };
    }

    const comparisonLabel = comparison === 'below' ? 'At-risk students (below threshold)' : 'High performers (above threshold)';

    return {
      success: true,
      message: `Found ${students.length} student${students.length !== 1 ? 's' : ''} with GPA ${comparison} ${threshold.toFixed(2)}`,
      category: comparisonLabel,
      threshold: threshold.toFixed(2),
      comparison: comparison,
      totalStudents: students.length,
      students: students.map(s => ({
        studentId: s.student_number,
        name: s.full_name,
        email: s.email,
        level: `${s.level_name} (Level ${s.level_number})`,
        section: s.section_name,
        gpa: parseFloat(s.gpa).toFixed(2),
        attendance: s.attendance_percentage ? `${parseFloat(s.attendance_percentage).toFixed(1)}%` : 'N/A'
      }))
    };
  } catch (error: any) {
    console.error('[getStudentsByGPA] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving students by GPA. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getStudentsByGPADeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getStudentsByGPA',
    description: 'Get students based on a GPA threshold comparison. Can find students above or below a specific GPA value. Useful for identifying at-risk students (below threshold) or high-performing students (above threshold).',
    parameters: {
      type: 'object',
      properties: {
        threshold: {
          type: 'number',
          description: 'GPA threshold value for comparison (e.g., 2.0, 3.0, 3.5). Must be between 0.0 and 4.0.'
        },
        comparison: {
          type: 'string',
          description: 'Comparison type: "below" to find students with GPA below threshold (at-risk students), or "above" to find students with GPA above threshold (high performers). Defaults to "below".',
          enum: ['below', 'above']
        }
      },
      required: ['threshold']
    }
  }
};
