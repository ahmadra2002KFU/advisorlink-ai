import { Request, Response } from 'express';
import { db } from '../config/database';

export async function getSystemStats(req: Request, res: Response) {
  try {
    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE user_type = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE user_type = 'advisor') as total_advisors,
        (SELECT COUNT(*) FROM conversations) as total_conversations,
        (SELECT COUNT(*) FROM conversations WHERE status = 'active') as active_conversations,
        (SELECT COUNT(*) FROM messages) as total_messages,
        (SELECT COUNT(*) FROM ai_chat_history) as total_ai_chats
    `).get() as any;

    return res.json(stats);
  } catch (error) {
    console.error('Get system stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = db.prepare(`
      SELECT
        u.id,
        u.email,
        u.full_name,
        u.user_type,
        u.created_at
      FROM users u
      ORDER BY u.created_at DESC
    `).all() as any[];

    return res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllConversations(req: Request, res: Response) {
  try {
    const conversations = db.prepare(`
      SELECT
        c.*,
        s.student_id,
        student_user.full_name as student_name,
        advisor_user.full_name as advisor_name
      FROM conversations c
      JOIN students s ON c.student_id = s.id
      JOIN users student_user ON s.user_id = student_user.id
      JOIN advisors a ON c.advisor_id = a.id
      JOIN users advisor_user ON a.user_id = advisor_user.id
      ORDER BY c.updated_at DESC
    `).all() as any[];

    return res.json(conversations);
  } catch (error) {
    console.error('Get all conversations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getFAQs(req: Request, res: Response) {
  try {
    const faqs = db.prepare(
      'SELECT * FROM faqs ORDER BY category, id'
    ).all() as any[];

    return res.json(faqs);
  } catch (error) {
    console.error('Get FAQs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createFAQ(req: Request, res: Response) {
  try {
    const { question, answer, category } = req.body;

    if (!question || !answer || !category) {
      return res.status(400).json({ error: 'Question, answer, and category are required' });
    }

    const result = db.prepare(
      'INSERT INTO faqs (question, answer, category) VALUES (?, ?, ?)'
    ).run(question, answer, category);

    const faq = db.prepare(
      'SELECT * FROM faqs WHERE id = ?'
    ).get(result.lastInsertRowid) as any;

    return res.status(201).json(faq);
  } catch (error) {
    console.error('Create FAQ error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateFAQ(req: Request, res: Response) {
  try {
    const { faqId } = req.params;
    const { question, answer, category } = req.body;

    db.prepare(
      'UPDATE faqs SET question = ?, answer = ?, category = ? WHERE id = ?'
    ).run(question, answer, category, faqId);

    const faq = db.prepare(
      'SELECT * FROM faqs WHERE id = ?'
    ).get(faqId) as any;

    return res.json(faq);
  } catch (error) {
    console.error('Update FAQ error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteFAQ(req: Request, res: Response) {
  try {
    const { faqId } = req.params;

    db.prepare('DELETE FROM faqs WHERE id = ?').run(faqId);

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
