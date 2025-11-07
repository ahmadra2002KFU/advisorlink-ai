import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { generateToken } from '../utils/jwt';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      userType: user.user_type
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        userType: user.user_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName, userType = 'student' } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, full_name, user_type) VALUES (?, ?, ?, ?)'
    ).run(email, passwordHash, fullName, userType);

    const userId = result.lastInsertRowid as number;

    // Generate JWT
    const token = generateToken({
      userId,
      email,
      userType
    });

    return res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        fullName,
        userType
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    const user = db.prepare(
      'SELECT id, email, full_name, user_type, created_at FROM users WHERE id = ?'
    ).get(userId) as any;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      userType: user.user_type,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
