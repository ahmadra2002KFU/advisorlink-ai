import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Resolve database path relative to backend folder
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../mentorlink.db');

// Create database connection
export const db = new Database(dbPath, {
  verbose: (msg) => {
    // Uncomment for query logging during development
    // console.log('[SQLite]:', msg);
  }
});

// Enable foreign key constraints (critical for data integrity)
db.pragma('foreign_keys = ON');

// Optimize for better performance
db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
db.pragma('synchronous = NORMAL'); // Balance between safety and speed

// Test connection
export function testConnection(): boolean {
  try {
    // Simple query to test database is accessible
    const result = db.prepare('SELECT 1 as test').get();
    if (result && (result as any).test === 1) {
      console.log('✅ Database connection successful');
      console.log(`📁 Database file: ${dbPath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('\n🔒 Database connection closed');
  process.exit(0);
});

// Export database instance as default
export default db;
