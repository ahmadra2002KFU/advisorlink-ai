import { Request, Response } from 'express';
import { db } from '../config/database';

export async function getAdvisorProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    const advisor = db.prepare(
      `SELECT
        a.*,
        u.email,
        u.full_name,
        l.level_number,
        l.level_name
      FROM advisors a
      JOIN users u ON a.user_id = u.id
      JOIN levels l ON a.level_id = l.id
      WHERE a.user_id = ?`
    ).get(userId) as any;

    if (!advisor) {
      return res.status(404).json({ error: 'Advisor profile not found' });
    }

    // Convert is_available from number to boolean
    const response = {
      ...advisor,
      isAvailable: advisor.is_available === 1,
      name: advisor.full_name,
      level: advisor.level_name,
      specialization: advisor.specialization
    };

    return res.json(response);
  } catch (error) {
    console.error('Get advisor profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAssignedStudents(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    // Get advisor ID
    const advisor = db.prepare(
      'SELECT id FROM advisors WHERE user_id = ?'
    ).get(userId) as any;

    if (!advisor) {
      return res.status(404).json({ error: 'Advisor not found' });
    }

    const students = db.prepare(
      `SELECT
        s.id,
        s.student_id,
        u.full_name,
        u.email,
        l.level_name,
        sec.section_name,
        s.gpa,
        s.attendance_percentage
      FROM advisor_assignments aa
      JOIN students s ON aa.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN levels l ON s.level_id = l.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE aa.advisor_id = ?
      ORDER BY l.level_number, sec.section_name, u.full_name`
    ).all(advisor.id) as any[];

    // Format response with cleaner field names
    const formattedStudents = students.map(student => ({
      id: student.id,
      studentId: student.student_id,
      name: student.full_name,
      email: student.email,
      level: student.level_name,
      section: student.section_name,
      department: student.level_name, // Using level as department for now
      gpa: student.gpa,
      attendance: student.attendance_percentage
    }));

    return res.json(formattedStudents);
  } catch (error) {
    console.error('Get assigned students error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateAvailability(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { isAvailable } = req.body;

    // Convert boolean to number for SQLite (1 = true, 0 = false)
    const availabilityValue = isAvailable ? 1 : 0;

    const result = db.prepare(
      'UPDATE advisors SET is_available = ? WHERE user_id = ?'
    ).run(availabilityValue, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Advisor not found' });
    }

    return res.json({ success: true, isAvailable });
  } catch (error) {
    console.error('Update availability error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAdvisorStats(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    const advisor = db.prepare(
      'SELECT id FROM advisors WHERE user_id = ?'
    ).get(userId) as any;

    if (!advisor) {
      return res.status(404).json({ error: 'Advisor not found' });
    }

    const advisorId = advisor.id;

    // Get stats
    const studentCount = db.prepare(
      'SELECT COUNT(*) as count FROM advisor_assignments WHERE advisor_id = ?'
    ).get(advisorId) as any;

    const activeChats = db.prepare(
      'SELECT COUNT(*) as count FROM conversations WHERE advisor_id = ? AND status = ?'
    ).get(advisorId, 'active') as any;

    return res.json({
      assignedStudents: studentCount.count,
      activeConversations: activeChats.count
    });
  } catch (error) {
    console.error('Get advisor stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
