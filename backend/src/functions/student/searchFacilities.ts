import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Search for campus facilities including labs, libraries, offices, and services
 */
export async function searchFacilities(args: any, context: any): Promise<any> {
  const { searchTerm } = args;

  console.log(`[searchFacilities] Searching for: "${searchTerm}"`);

  try {
    // Search in facilities table with fuzzy matching on name, type, building, and description
    const facilities = db.prepare(`
      SELECT
        name,
        type,
        building,
        room_number,
        floor,
        capacity,
        services,
        hours,
        contact_email,
        phone,
        description
      FROM facilities
      WHERE LOWER(name) LIKE LOWER(?)
         OR LOWER(type) LIKE LOWER(?)
         OR LOWER(building) LIKE LOWER(?)
         OR LOWER(description) LIKE LOWER(?)
      ORDER BY
        CASE
          WHEN LOWER(name) LIKE LOWER(?) THEN 1
          WHEN LOWER(type) LIKE LOWER(?) THEN 2
          WHEN LOWER(building) LIKE LOWER(?) THEN 3
          ELSE 4
        END,
        name
      LIMIT 10
    `).all(
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`
    ) as any[];

    if (facilities.length === 0) {
      return {
        success: false,
        message: `No facilities found matching "${searchTerm}". Try searching for: computer lab, library, registrar, career center, cafeteria, fitness center, or specific department names like Computer Science, Engineering, or Business.`
      };
    }

    // Format the results for better presentation
    const formattedFacilities = facilities.map((f: any) => {
      const services = f.services ? JSON.parse(f.services) : [];

      return {
        name: f.name,
        type: f.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        location: f.room_number
          ? `Room ${f.room_number}, ${f.building}${f.floor ? ` (Floor ${f.floor})` : ''}`
          : f.building,
        capacity: f.capacity ? `Capacity: ${f.capacity}` : null,
        hours: f.hours,
        contact: f.contact_email,
        phone: f.phone,
        services: services.length > 0 ? services.slice(0, 5).join(', ') + (services.length > 5 ? '...' : '') : null,
        description: f.description ? f.description.substring(0, 200) + (f.description.length > 200 ? '...' : '') : null
      };
    });

    if (facilities.length === 1) {
      const facility = formattedFacilities[0];
      return {
        success: true,
        facility: facility,
        message: `Found: ${facility.name}`
      };
    }

    return {
      success: true,
      message: `Found ${facilities.length} facilities matching "${searchTerm}"`,
      facilities: formattedFacilities
    };
  } catch (error: any) {
    console.error('[searchFacilities] Error:', error);
    return {
      success: false,
      message: 'An error occurred while searching for facilities. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const searchFacilitiesDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'searchFacilities',
    description: 'Search for campus facilities like computer labs, libraries, buildings, or departments. Returns facility name, building, room number, and related information.',
    parameters: {
      type: 'object',
      properties: {
        searchTerm: {
          type: 'string',
          description: 'The facility name or type to search for (e.g., "computer lab", "library", "engineering building")'
        }
      },
      required: ['searchTerm']
    }
  }
};
