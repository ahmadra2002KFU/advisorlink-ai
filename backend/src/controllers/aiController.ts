import { Request, Response } from 'express';
import { db } from '../config/database';
import { callGeminiAPI } from '../utils/gemini';

export async function chatWithAI(req: Request, res: Response) {
  try {
    const { message, chatHistory = [] } = req.body;
    const userId = req.user?.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get student data
    const studentData = db.prepare(
      `SELECT
        s.*,
        u.full_name,
        l.level_name,
        sec.section_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE s.user_id = ?`
    ).get(userId) as any;

    if (!studentData) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get enrolled courses
    const courses = db.prepare(
      'SELECT course_name FROM student_courses WHERE student_id = ?'
    ).all(studentData.id) as any[];

    const courseNames = courses.map((c: any) => c.course_name);

    // Get advisor
    const assignment = db.prepare(
      `SELECT
        a.id,
        u.full_name as advisor_name
      FROM advisor_assignments aa
      JOIN advisors a ON aa.advisor_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE aa.student_id = ?`
    ).get(studentData.id) as any;

    const advisorName =
      assignment ? assignment.advisor_name : 'your academic advisor';

    // Get all FAQs
    const faqs = db.prepare(
      'SELECT question, answer, category FROM faqs ORDER BY category'
    ).all() as any[];

    // Call Gemini API
    const aiResponse = await callGeminiAPI(
      message,
      {
        studentId: studentData.student_id,
        fullName: studentData.full_name,
        levelName: studentData.level_name,
        sectionName: studentData.section_name,
        gpa: studentData.gpa?.toString() || 'N/A',
        attendance: studentData.attendance_percentage?.toString() || 'N/A',
        courses: courseNames
      },
      faqs,
      advisorName,
      chatHistory
    );

    // Save to AI chat history
    db.prepare(
      'INSERT INTO ai_chat_history (student_id, user_message, ai_response) VALUES (?, ?, ?)'
    ).run(studentData.id, message, aiResponse);

    return res.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return res.status(500).json({
      error: 'Failed to get AI response',
      message: error.message || 'Please try again or contact your advisor'
    });
  }
}

export async function getAIChatHistory(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    const student = db.prepare(
      'SELECT id FROM students WHERE user_id = ?'
    ).get(userId) as any;

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const history = db.prepare(
      'SELECT * FROM ai_chat_history WHERE student_id = ? ORDER BY created_at DESC LIMIT 50'
    ).all(student.id) as any[];

    return res.json(history);
  } catch (error) {
    console.error('Get AI chat history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
