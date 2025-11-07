import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mentorlink_dev_secret_key_2024';

export interface TokenPayload {
  userId: number;
  email: string;
  userType: 'student' | 'advisor' | 'admin';
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
