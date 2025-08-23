require('dotenv').config();
const db = require('../config/database');

const createTables = async () => {
  try {
    console.log('🔧 Creating database tables...');

    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Challenges table
    await db.query(`
      CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        created_by_admin_id INTEGER REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Enrollments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, challenge_id)
      )
    `);

    // Submissions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        image_filename VARCHAR(255),
        step_count INTEGER NOT NULL CHECK (step_count >= 0 AND step_count <= 100000),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, challenge_id, date)
      )
    `);

    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_enrollments_user_challenge 
      ON enrollments(user_id, challenge_id)
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_submissions_user_challenge_date 
      ON submissions(user_id, challenge_id, date)
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_submissions_challenge_date 
      ON submissions(challenge_id, date)
    `);

    console.log('✅ Database tables created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('💥 Error creating tables:', error);
    process.exit(1);
  }
};

createTables();