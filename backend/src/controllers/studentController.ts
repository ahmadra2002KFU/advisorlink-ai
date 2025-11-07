import { Request, Response } from 'express';
import { db } from '../config/database';

export async function getStudentProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    const student = db.prepare(
      `SELECT
        s.*,
        u.email,
        u.full_name,
        l.level_number,
        l.level_name,
        sec.section_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE s.user_id = ?`
    ).get(userId) as any;

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    return res.json(student);
  } catch (error) {
    console.error('Get student profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getStudentCourses(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    const student = db.prepare(
      'SELECT id FROM students WHERE user_id = ?'
    ).get(userId) as any;

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const courses = db.prepare(
      'SELECT * FROM student_courses WHERE student_id = ?'
    ).all(student.id) as any[];

    return res.json(courses);
  } catch (error) {
    console.error('Get student courses error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getStudentAdvisor(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    const student = db.prepare(
      'SELECT id FROM students WHERE user_id = ?'
    ).get(userId) as any;

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const assignment = db.prepare(
      `SELECT
        aa.*,
        a.specialization,
        a.is_available,
        u.full_name as advisor_name,
        u.email as advisor_email
      FROM advisor_assignments aa
      JOIN advisors a ON aa.advisor_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE aa.student_id = ?`
    ).get(student.id) as any;

    if (!assignment) {
      return res.status(404).json({ error: 'No advisor assigned' });
    }

    return res.json(assignment);
  } catch (error) {
    console.error('Get student advisor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
