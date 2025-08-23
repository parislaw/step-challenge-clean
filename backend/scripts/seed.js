require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@steptracker30.com';
    
    await db.query(`
      INSERT INTO users (first_name, last_name, email, password_hash, is_admin)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['Admin', 'User', adminEmail, adminPassword, true]);

    // Create a few test users
    const testUsers = [
      ['John', 'Doe', 'john@example.com'],
      ['Jane', 'Smith', 'jane@example.com'],
      ['Bob', 'Wilson', 'bob@example.com']
    ];

    for (const [firstName, lastName, email] of testUsers) {
      const password = await bcrypt.hash('password123', 12);
      await db.query(`
        INSERT INTO users (first_name, last_name, email, password_hash)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
      `, [firstName, lastName, email, password]);
    }

    // Clear existing challenges first
    await db.query('DELETE FROM challenges');

    // Create multiple sample challenges
    const challenges = [
      {
        title: 'August 2024 Step Challenge',
        startOffset: 1, // Tomorrow
        status: 'upcoming'
      },
      {
        title: 'Summer Fitness Challenge',
        startOffset: -5, // Started 5 days ago (active)
        status: 'active'
      },
      {
        title: 'Spring Step Challenge',
        startOffset: -35, // Completed challenge
        status: 'completed'
      },
      {
        title: 'September Stepping Strong',
        startOffset: 25, // Far future
        status: 'upcoming'
      }
    ];

    for (const challenge of challenges) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + challenge.startOffset);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 29); // 30 days total

      await db.query(`
        INSERT INTO challenges (title, start_date, end_date, created_by_admin_id, status)
        VALUES ($1, $2, $3, (SELECT id FROM users WHERE is_admin = true LIMIT 1), $4)
      `, [
        challenge.title,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        challenge.status
      ]);
    }

    // Enroll john in the active challenge for testing
    await db.query(`
      INSERT INTO enrollments (user_id, challenge_id) 
      SELECT u.id, c.id 
      FROM users u, challenges c 
      WHERE u.email = 'john@example.com' AND c.status = 'active' 
      ON CONFLICT DO NOTHING
    `);

    // Add test submissions with images to the completed challenge for storage demo
    await db.query(`
      INSERT INTO submissions (user_id, challenge_id, date, image_filename, step_count)
      SELECT 
        u.id, 
        c.id,
        c.start_date + INTERVAL '1 day',
        CASE WHEN u.email = 'jane@example.com' THEN 'test-image-1.jpg' ELSE 'test-image-2.jpg' END,
        CASE WHEN u.email = 'jane@example.com' THEN 12000 ELSE 9800 END
      FROM users u, challenges c
      WHERE u.email IN ('jane@example.com', 'bob@example.com') 
        AND c.status = 'completed'
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Database seeded successfully!');
    console.log(`👤 Admin login: ${adminEmail} / admin123`);
    console.log('👤 Test user login: john@example.com / password123');
    console.log('📝 John is enrolled in the active challenge for testing');
    console.log('🗄️ Storage demo: Test images added to completed challenge');
    
    process.exit(0);

  } catch (error) {
    console.error('💥 Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();