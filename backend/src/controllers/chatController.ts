import { Request, Response } from 'express';
import { db } from '../config/database';

export async function getConversations(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const userType = req.user?.userType;

    let conversations;

    if (userType === 'student') {
      // Get student's conversations
      const student = db.prepare(
        'SELECT id FROM students WHERE user_id = ?'
      ).get(userId) as any;

      if (!student) {
        return res.json([]);
      }

      conversations = db.prepare(
        `SELECT
          c.*,
          a.id as advisor_db_id,
          u.full_name as advisor_name
        FROM conversations c
        JOIN advisors a ON c.advisor_id = a.id
        JOIN users u ON a.user_id = u.id
        WHERE c.student_id = ?
        ORDER BY c.updated_at DESC`
      ).all(student.id) as any[];
    } else if (userType === 'advisor') {
      // Get advisor's conversations
      const advisor = db.prepare(
        'SELECT id FROM advisors WHERE user_id = ?'
      ).get(userId) as any;

      if (!advisor) {
        return res.json([]);
      }

      conversations = db.prepare(
        `SELECT
          c.*,
          s.student_id,
          u.full_name as student_name
        FROM conversations c
        JOIN students s ON c.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE c.advisor_id = ?
        ORDER BY c.updated_at DESC`
      ).all(advisor.id) as any[];
    } else {
      return res.status(403).json({ error: 'Only students and advisors can view conversations' });
    }

    return res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;

    const messages = db.prepare(
      `SELECT
        m.*,
        u.full_name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC`
    ).all(conversationId) as any[];

    return res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user?.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Insert message
    const result = db.prepare(
      'INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)'
    ).run(conversationId, userId, message);

    // Update conversation updated_at
    db.prepare(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(conversationId);

    // Get the created message
    const newMessage = db.prepare(
      `SELECT
        m.*,
        u.full_name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?`
    ).get(result.lastInsertRowid) as any;

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createConversation(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const userType = req.user?.userType;

    if (userType !== 'student') {
      return res.status(403).json({ error: 'Only students can create conversations' });
    }

    // Get student
    const student = db.prepare(
      'SELECT id FROM students WHERE user_id = ?'
    ).get(userId) as any;

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get assigned advisor
    const assignment = db.prepare(
      'SELECT advisor_id FROM advisor_assignments WHERE student_id = ?'
    ).get(student.id) as any;

    if (!assignment) {
      return res.status(404).json({ error: 'No advisor assigned' });
    }

    // Check if conversation already exists
    const existing = db.prepare(
      'SELECT * FROM conversations WHERE student_id = ? AND advisor_id = ?'
    ).get(student.id, assignment.advisor_id) as any;

    if (existing) {
      return res.json(existing);
    }

    // Create new conversation
    const result = db.prepare(
      'INSERT INTO conversations (student_id, advisor_id) VALUES (?, ?)'
    ).run(student.id, assignment.advisor_id);

    const conversation = db.prepare(
      'SELECT * FROM conversations WHERE id = ?'
    ).get(result.lastInsertRowid) as any;

    return res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const { messageId } = req.params;

    db.prepare(
      'UPDATE messages SET is_read = TRUE WHERE id = ?'
    ).run(messageId);

    return res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const userType = req.user?.userType;

    let count = 0;

    if (userType === 'student') {
      // Get student's conversations
      const student = db.prepare(
        'SELECT id FROM students WHERE user_id = ?'
      ).get(userId) as any;

      if (!student) {
        return res.json({ count: 0 });
      }

      // Count unread messages from advisor in student's conversations
      const result = db.prepare(
        `SELECT COUNT(*) as count
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE c.student_id = ?
           AND m.sender_id != ?
           AND m.is_read = FALSE`
      ).get(student.id, userId) as any;

      count = result?.count || 0;
    } else if (userType === 'advisor') {
      // Get advisor's conversations
      const advisor = db.prepare(
        'SELECT id FROM advisors WHERE user_id = ?'
      ).get(userId) as any;

      if (!advisor) {
        return res.json({ count: 0 });
      }

      // Count unread messages from students in advisor's conversations
      const result = db.prepare(
        `SELECT COUNT(*) as count
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE c.advisor_id = ?
           AND m.sender_id != ?
           AND m.is_read = FALSE`
      ).get(advisor.id, userId) as any;

      count = result?.count || 0;
    }

    return res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUnreadMessages(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const userType = req.user?.userType;

    let messages = [];

    if (userType === 'student') {
      // Get student's conversations
      const student = db.prepare(
        'SELECT id FROM students WHERE user_id = ?'
      ).get(userId) as any;

      if (!student) {
        return res.json([]);
      }

      // Get unread messages from advisor in student's conversations
      messages = db.prepare(
        `SELECT
          m.id,
          m.message_text,
          m.sender_id,
          m.conversation_id,
          m.created_at,
          u.full_name as sender_name
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         JOIN users u ON m.sender_id = u.id
         WHERE c.student_id = ?
           AND m.sender_id != ?
           AND m.is_read = FALSE
         ORDER BY m.created_at DESC
         LIMIT 5`
      ).all(student.id, userId) as any[];
    } else if (userType === 'advisor') {
      // Get advisor's conversations
      const advisor = db.prepare(
        'SELECT id FROM advisors WHERE user_id = ?'
      ).get(userId) as any;

      if (!advisor) {
        return res.json([]);
      }

      // Get unread messages from students in advisor's conversations
      messages = db.prepare(
        `SELECT
          m.id,
          m.message_text,
          m.sender_id,
          m.conversation_id,
          m.created_at,
          u.full_name as sender_name,
          s.student_id as student_number
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         JOIN users u ON m.sender_id = u.id
         JOIN students s ON c.student_id = s.id
         WHERE c.advisor_id = ?
           AND m.sender_id != ?
           AND m.is_read = FALSE
         ORDER BY m.created_at DESC
         LIMIT 5`
      ).all(advisor.id, userId) as any[];
    }

    return res.json(messages);
  } catch (error) {
    console.error('Get unread messages error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
