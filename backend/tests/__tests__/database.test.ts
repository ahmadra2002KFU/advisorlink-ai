import Database from 'better-sqlite3';
import path from 'path';

describe('Database Connection', () => {
  let db: Database.Database;

  beforeAll(() => {
    const dbPath = path.join(__dirname, '../../mentorlink.db');
    db = new Database(dbPath);
  });

  afterAll(() => {
    db.close();
  });

  test('should connect to database successfully', () => {
    expect(db).toBeDefined();
    expect(db.open).toBe(true);
  });

  test('should have users table', () => {
    const result = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='users'
    `).get() as any;

    expect(result).toBeDefined();
    expect(result.name).toBe('users');
  });

  test('should have students table', () => {
    const result = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='students'
    `).get() as any;

    expect(result).toBeDefined();
    expect(result.name).toBe('students');
  });

  test('should count total users', () => {
    const result = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    expect(result.count).toBeGreaterThan(0);
  });
});
