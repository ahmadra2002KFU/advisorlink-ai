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

// Student CRUD operations
export async function getAllStudents(req: Request, res: Response) {
  try {
    const students = db.prepare(`
      SELECT
        s.id,
        s.student_id,
        s.birthdate,
        s.gpa,
        s.attendance_percentage,
        u.id as user_id,
        u.email,
        u.full_name,
        u.created_at,
        l.level_name,
        l.level_number,
        sec.section_name,
        CASE
          WHEN aa.advisor_id IS NOT NULL THEN 1
          ELSE 0
        END as has_advisor
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      LEFT JOIN advisor_assignments aa ON s.id = aa.student_id
      ORDER BY s.student_id ASC
    `).all() as any[];

    return res.json(students);
  } catch (error) {
    console.error('Get all students error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getStudent(req: Request, res: Response) {
  try {
    const { studentId } = req.params;

    const student = db.prepare(`
      SELECT
        s.id,
        s.student_id,
        s.birthdate,
        s.gpa,
        s.attendance_percentage,
        s.level_id,
        s.section_id,
        u.id as user_id,
        u.email,
        u.full_name,
        u.created_at,
        l.level_name,
        l.level_number,
        sec.section_name,
        aa.advisor_id
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      LEFT JOIN advisor_assignments aa ON s.id = aa.student_id
      WHERE s.id = ?
    `).get(studentId) as any;

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createStudent(req: Request, res: Response) {
  try {
    const {
      email,
      password,
      fullName,
      studentId,
      birthdate,
      levelId,
      sectionId,
      gpa,
      attendancePercentage
    } = req.body;

    // Validate required fields
    if (!email || !password || !fullName || !studentId || !birthdate || !levelId || !sectionId) {
      return res.status(400).json({
        error: 'Email, password, full name, student ID, birthdate, level, and section are required'
      });
    }

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Check if student ID already exists
    const existingStudent = db.prepare('SELECT id FROM students WHERE student_id = ?').get(studentId) as any;
    if (existingStudent) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userResult = db.prepare(
      'INSERT INTO users (email, password_hash, full_name, user_type) VALUES (?, ?, ?, ?)'
    ).run(email, passwordHash, fullName, 'student');

    // Create student
    const studentResult = db.prepare(
      `INSERT INTO students (user_id, student_id, birthdate, level_id, section_id, gpa, attendance_percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      userResult.lastInsertRowid,
      studentId,
      birthdate,
      levelId,
      sectionId,
      gpa || 0.0,
      attendancePercentage || 100.0
    );

    // Get created student with all details
    const newStudent = db.prepare(`
      SELECT
        s.id,
        s.student_id,
        s.birthdate,
        s.gpa,
        s.attendance_percentage,
        u.id as user_id,
        u.email,
        u.full_name,
        u.created_at,
        l.level_name,
        sec.section_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE s.id = ?
    `).get(studentResult.lastInsertRowid) as any;

    return res.status(201).json(newStudent);
  } catch (error) {
    console.error('Create student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateStudent(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const {
      email,
      fullName,
      studentIdNumber,
      birthdate,
      levelId,
      sectionId,
      gpa,
      attendancePercentage
    } = req.body;

    // Get student
    const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(studentId) as any;
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update user info if provided
    if (email || fullName) {
      const updates: string[] = [];
      const values: any[] = [];

      if (email) {
        // Check if email is already taken by another user
        const existingUser = db.prepare(
          'SELECT id FROM users WHERE email = ? AND id != ?'
        ).get(email, student.user_id) as any;

        if (existingUser) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        updates.push('email = ?');
        values.push(email);
      }

      if (fullName) {
        updates.push('full_name = ?');
        values.push(fullName);
      }

      if (updates.length > 0) {
        values.push(student.user_id);
        db.prepare(
          `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
        ).run(...values);
      }
    }

    // Update student info if provided
    const studentUpdates: string[] = [];
    const studentValues: any[] = [];

    if (studentIdNumber) {
      // Check if student ID is already taken
      const existingStudent = db.prepare(
        'SELECT id FROM students WHERE student_id = ? AND id != ?'
      ).get(studentIdNumber, studentId) as any;

      if (existingStudent) {
        return res.status(400).json({ error: 'Student ID already exists' });
      }
      studentUpdates.push('student_id = ?');
      studentValues.push(studentIdNumber);
    }

    if (birthdate) {
      studentUpdates.push('birthdate = ?');
      studentValues.push(birthdate);
    }

    if (levelId) {
      studentUpdates.push('level_id = ?');
      studentValues.push(levelId);
    }

    if (sectionId) {
      studentUpdates.push('section_id = ?');
      studentValues.push(sectionId);
    }

    if (gpa !== undefined) {
      studentUpdates.push('gpa = ?');
      studentValues.push(gpa);
    }

    if (attendancePercentage !== undefined) {
      studentUpdates.push('attendance_percentage = ?');
      studentValues.push(attendancePercentage);
    }

    if (studentUpdates.length > 0) {
      studentValues.push(studentId);
      db.prepare(
        `UPDATE students SET ${studentUpdates.join(', ')} WHERE id = ?`
      ).run(...studentValues);
    }

    // Get updated student
    const updatedStudent = db.prepare(`
      SELECT
        s.id,
        s.student_id,
        s.birthdate,
        s.gpa,
        s.attendance_percentage,
        u.id as user_id,
        u.email,
        u.full_name,
        u.created_at,
        l.level_name,
        sec.section_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE s.id = ?
    `).get(studentId) as any;

    return res.json(updatedStudent);
  } catch (error) {
    console.error('Update student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteStudent(req: Request, res: Response) {
  try {
    const { studentId } = req.params;

    // Get student to find user_id
    const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(studentId) as any;

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete user (CASCADE will delete student and related records)
    db.prepare('DELETE FROM users WHERE id = ?').run(student.user_id);

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
