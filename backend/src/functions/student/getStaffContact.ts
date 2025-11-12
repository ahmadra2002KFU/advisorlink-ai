import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Get staff contact information by query
 * Searches by role, department, category, or responsibilities
 */
export async function getStaffContact(args: any, context: any): Promise<any> {
  const { query } = args;

  console.log(`[getStaffContact] Searching for staff with query: "${query}"`);

  try {
    // Search staff contacts with comprehensive fuzzy matching
    const staff = db.prepare(`
      SELECT
        name,
        role,
        department,
        email,
        phone,
        office_location,
        office_hours,
        responsibilities,
        category
      FROM staff_contacts
      WHERE
        LOWER(role) LIKE LOWER(?)
        OR LOWER(department) LIKE LOWER(?)
        OR LOWER(category) LIKE LOWER(?)
        OR LOWER(responsibilities) LIKE LOWER(?)
      ORDER BY
        CASE
          WHEN LOWER(role) LIKE LOWER(?) THEN 1
          WHEN LOWER(department) LIKE LOWER(?) THEN 2
          WHEN LOWER(category) LIKE LOWER(?) THEN 3
          ELSE 4
        END,
        name
      LIMIT 5
    `).all(
      `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`,
      `%${query}%`, `%${query}%`, `%${query}%`
    ) as any[];

    if (staff.length === 0) {
      return {
        success: false,
        message: `No staff members found matching "${query}". Please try searching for: registration, IT support, financial aid, academic affairs, student services, career services, library, international office, or facilities.`
      };
    }

    if (staff.length === 1) {
      const person = staff[0];
      return {
        success: true,
        contact: {
          name: person.name,
          role: person.role,
          department: person.department,
          email: person.email,
          phone: person.phone,
          office: person.office_location,
          hours: person.office_hours,
          canHelpWith: person.responsibilities
        }
      };
    }

    // Multiple matches found
    return {
      success: true,
      message: `Found ${staff.length} staff members who can help with "${query}"`,
      contacts: staff.map(p => ({
        name: p.name,
        role: p.role,
        department: p.department,
        email: p.email,
        phone: p.phone,
        office: p.office_location,
        hours: p.office_hours,
        canHelpWith: p.responsibilities
      }))
    };
  } catch (error: any) {
    console.error('[getStaffContact] Error:', error);
    return {
      success: false,
      message: 'An error occurred while searching for staff contacts. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getStaffContactDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getStaffContact',
    description: 'Get contact information for university staff members who can help with specific student needs. Searches by issue type, department, or category. Use this when students need help with: registration problems, IT/technical support, financial aid, academic issues, student services, career guidance, library resources, international student matters, or facilities/campus issues.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'What the student needs help with (e.g., "registration problems", "IT support", "financial aid", "academic probation", "visa issues", "career counseling", "library help"). Can also search by staff role or department name.'
        }
      },
      required: ['query']
    }
  }
};
