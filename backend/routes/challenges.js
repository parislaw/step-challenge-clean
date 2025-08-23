const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all challenges with user enrollment status
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.id, c.title, c.start_date, c.end_date, c.status,
             (SELECT COUNT(*) FROM enrollments WHERE challenge_id = c.id) as participant_count,
             CASE WHEN e.user_id IS NOT NULL THEN true ELSE false END as user_enrolled
      FROM challenges c
      LEFT JOIN enrollments e ON c.id = e.challenge_id AND e.user_id = $1
      ORDER BY c.start_date DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create challenge (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, startDate, endDate } = req.body;
    
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, start date, and end date are required' });
    }

    const result = await db.query(`
      INSERT INTO challenges (title, start_date, end_date, created_by_admin_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, startDate, endDate, req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Join challenge
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const challengeId = req.params.id;
    
    // Check if challenge exists and is joinable
    const challengeResult = await db.query(
      'SELECT * FROM challenges WHERE id = $1 AND status = $2',
      [challengeId, 'upcoming']
    );
    
    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Challenge not found or not available for enrollment' });
    }

    // Check if already enrolled
    const existingEnrollment = await db.query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND challenge_id = $2',
      [req.user.id, challengeId]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this challenge' });
    }

    // Enroll user
    await db.query(
      'INSERT INTO enrollments (user_id, challenge_id) VALUES ($1, $2)',
      [req.user.id, challengeId]
    );

    res.json({ message: 'Successfully enrolled in challenge' });
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;