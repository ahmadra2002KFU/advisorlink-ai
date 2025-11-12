import { db } from '../../config/database';
import OpenAI from 'openai';

/**
 * Helper function to calculate human-readable time since a given timestamp
 */
function calculateTimeSince(timestamp: string): string {
  const now = new Date().getTime();
  const past = new Date(timestamp).getTime();
  const diffMs = now - past;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''}`;
  if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  if (diffHours > 0) return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''}`;
}

/**
 * Get the most recent contact with a student
 * Checks both conversations table and ai_chat_history table
 */
export async function getLastStudentContact(args: any, context: any): Promise<any> {
  const { studentName } = args;
  const { advisorId } = context;

  console.log(`[getLastStudentContact] Finding last contact for student "${studentName}" and advisor ID: ${advisorId}`);

  try {
    // Step 1: Find student by fuzzy name match
    const student = db.prepare(`
      SELECT
        s.id as student_id,
        s.student_id as student_number,
        u.full_name,
        u.email,
        l.level_name,
        sec.section_name
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

    if (!student) {
      return {
        success: false,
        message: `No student found matching "${studentName}" among your assigned students. Please check the name and try again.`
      };
    }

    // Step 2: Check conversations table for last conversation
    const lastConversation = db.prepare(`
      SELECT
        MAX(updated_at) as last_contact_time,
        'conversation' as contact_type
      FROM conversations
      WHERE student_id = ? AND advisor_id = ?
    `).get(student.student_id, advisorId) as any;

    // Step 3: Check ai_chat_history table for last AI chat
    const lastAIChat = db.prepare(`
      SELECT
        MAX(created_at) as last_contact_time,
        'ai_chat' as contact_type
      FROM ai_chat_history
      WHERE student_id = ?
    `).get(student.student_id) as any;

    // Step 4: Determine which contact is most recent
    let mostRecentContact = null;
    let contactType = 'none';
    let contactTime = null;

    if (lastConversation?.last_contact_time && lastAIChat?.last_contact_time) {
      // Both exist, compare timestamps
      const convTime = new Date(lastConversation.last_contact_time).getTime();
      const aiTime = new Date(lastAIChat.last_contact_time).getTime();

      if (convTime >= aiTime) {
        mostRecentContact = lastConversation;
        contactType = 'Advisor-Student Conversation';
        contactTime = lastConversation.last_contact_time;
      } else {
        mostRecentContact = lastAIChat;
        contactType = 'AI Chat Session';
        contactTime = lastAIChat.last_contact_time;
      }
    } else if (lastConversation?.last_contact_time) {
      // Only conversation exists
      mostRecentContact = lastConversation;
      contactType = 'Advisor-Student Conversation';
      contactTime = lastConversation.last_contact_time;
    } else if (lastAIChat?.last_contact_time) {
      // Only AI chat exists
      mostRecentContact = lastAIChat;
      contactType = 'AI Chat Session';
      contactTime = lastAIChat.last_contact_time;
    }

    if (!mostRecentContact || !contactTime) {
      return {
        success: true,
        student: {
          name: student.full_name,
          studentId: student.student_number,
          email: student.email,
          level: student.level_name,
          section: student.section_name
        },
        message: `No contact history found for ${student.full_name}. This student has not initiated any conversations or AI chats yet.`,
        hasContact: false
      };
    }

    // Calculate time since last contact
    const timeSince = calculateTimeSince(contactTime);

    return {
      success: true,
      student: {
        name: student.full_name,
        studentId: student.student_number,
        email: student.email,
        level: student.level_name,
        section: student.section_name
      },
      lastContact: {
        type: contactType,
        timestamp: contactTime,
        timeSince: timeSince,
        formattedDate: new Date(contactTime).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      hasContact: true,
      message: `Last contact with ${student.full_name} was ${timeSince} ago via ${contactType}.`
    };
  } catch (error: any) {
    console.error('[getLastStudentContact] Error:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving student contact information. Please try again.'
    };
  }
}

// Function declaration for GLM API
export const getLastStudentContactDeclaration: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getLastStudentContact',
    description: 'Get the most recent contact information for a specific student by name. Searches both advisor-student chat conversations and AI chat history to find the last interaction. Returns the most recent contact timestamp and type (conversation or AI chat).',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description: 'The full or partial name of the student to search for (e.g., "John Smith" or "Smith"). Fuzzy matching is supported.'
        }
      },
      required: ['studentName']
    }
  }
};
