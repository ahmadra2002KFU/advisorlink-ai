import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Get advisor contact information by level number
 */
export async function getAdvisorContactInfo(args: any, context: any): Promise<any> {
  const { levelNumber } = args;

  console.log(`[getAdvisorContactInfo] Getting advisors for level: ${levelNumber}`);

  try {
    const advisors = db.prepare(`
      SELECT
        u.full_name,
        u.email,
        a.specialization,
        a.is_available,
        CASE WHEN a.is_available = 1 THEN 'Available' ELSE 'Unavailable' END as availability
      FROM advisors a
      JOIN users u ON a.user_id = u.id
      JOIN levels l ON a.level_id = l.id
      WHERE l.level_number = ?
    `).all(levelNumber) as any[];

    if (advisors.length === 0) {
      return {
        success: false,
        message: `No advisors found for level ${levelNumber}. Please contact the admissions office.`
      };
    }

    return {
      success: true,
      advisors: advisors.map(a => ({
        name: a.full_name,
        email: a.email,
        specialization: a.specialization,
        availability: a.availability
      }))
    };
  } catch (error: any) {
    console.error('[getAdvisorContactInfo] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving advisor information. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getAdvisorContactInfoDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getAdvisorContactInfo',
    description: 'Get contact information for an advisor by their assigned level number. Returns advisor name, email, specialization, and availability status.',
    parameters: {
      type: 'object',
      properties: {
        levelNumber: {
          type: 'number',
          description: 'The level number (1-5) for which to find the advisor'
        }
      },
      required: ['levelNumber']
    }
  }
};
