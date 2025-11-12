import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Get honor students with GPA categorization
 * Categories: Highest Honors (>= 3.90), High Honors (>= 3.75), Honors (>= 3.50)
 */
export async function getHonorStudents(args: any, context: any): Promise<any> {
  const { minGPA = 3.5 } = args;
  const { advisorId } = context;

  console.log(`[getHonorStudents] Finding honor students for advisor ID: ${advisorId} with minGPA: ${minGPA}`);

  try {
    // Validate minGPA parameter
    if (minGPA < 0 || minGPA > 4.0) {
      return {
        success: false,
        message: 'Invalid minimum GPA. Please provide a value between 0.0 and 4.0.'
      };
    }

    const students = db.prepare(`
      SELECT
        s.student_id as student_number,
        u.full_name,
        u.email,
        l.level_number,
        l.level_name,
        sec.section_name,
        s.gpa,
        s.attendance_percentage,
        CASE
          WHEN s.gpa >= 3.90 THEN 'Highest Honors (Summa Cum Laude)'
          WHEN s.gpa >= 3.75 THEN 'High Honors (Magna Cum Laude)'
          WHEN s.gpa >= 3.50 THEN 'Honors (Cum Laude)'
          ELSE 'Not Categorized'
        END as honor_category
      FROM advisor_assignments aa
      JOIN students s ON aa.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE aa.advisor_id = ? AND s.gpa >= ?
      ORDER BY s.gpa DESC, u.full_name
    `).all(advisorId, minGPA) as any[];

    if (students.length === 0) {
      return {
        success: false,
        message: `No honor students found with GPA >= ${minGPA.toFixed(2)} among your assigned students.`
      };
    }

    // Group students by honor category
    const highestHonors = students.filter(s => parseFloat(s.gpa) >= 3.90);
    const highHonors = students.filter(s => parseFloat(s.gpa) >= 3.75 && parseFloat(s.gpa) < 3.90);
    const honors = students.filter(s => parseFloat(s.gpa) >= 3.50 && parseFloat(s.gpa) < 3.75);

    const formatStudent = (s: any) => ({
      studentId: s.student_number,
      name: s.full_name,
      email: s.email,
      level: `${s.level_name} (Level ${s.level_number})`,
      section: s.section_name,
      gpa: parseFloat(s.gpa).toFixed(2),
      attendance: s.attendance_percentage ? `${parseFloat(s.attendance_percentage).toFixed(1)}%` : 'N/A',
      honorCategory: s.honor_category
    });

    return {
      success: true,
      message: `Found ${students.length} honor student${students.length !== 1 ? 's' : ''} with GPA >= ${minGPA.toFixed(2)}`,
      totalHonorStudents: students.length,
      summary: {
        highestHonorsCount: highestHonors.length,
        highHonorsCount: highHonors.length,
        honorsCount: honors.length
      },
      studentsByCategory: {
        highestHonors: highestHonors.length > 0 ? {
          category: 'Highest Honors (Summa Cum Laude)',
          description: 'GPA >= 3.90',
          count: highestHonors.length,
          students: highestHonors.map(formatStudent)
        } : null,
        highHonors: highHonors.length > 0 ? {
          category: 'High Honors (Magna Cum Laude)',
          description: 'GPA 3.75 - 3.89',
          count: highHonors.length,
          students: highHonors.map(formatStudent)
        } : null,
        honors: honors.length > 0 ? {
          category: 'Honors (Cum Laude)',
          description: 'GPA 3.50 - 3.74',
          count: honors.length,
          students: honors.map(formatStudent)
        } : null
      }
    };
  } catch (error: any) {
    console.error('[getHonorStudents] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving honor students. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getHonorStudentsDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getHonorStudents',
    description: 'Get all honor students (students with high GPAs) assigned to the current advisor. Returns students categorized by honor level: Highest Honors (Summa Cum Laude, GPA >= 3.90), High Honors (Magna Cum Laude, GPA >= 3.75), and Honors (Cum Laude, GPA >= 3.50). Optional minimum GPA parameter to filter results.',
    parameters: {
      type: 'object',
      properties: {
        minGPA: {
          type: 'number',
          description: 'Minimum GPA threshold for honor students. Defaults to 3.5 if not specified. Must be between 0.0 and 4.0.'
        }
      }
    }
  }
};
