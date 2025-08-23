const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get leaderboard for a specific challenge
router.get('/:challengeId', authenticateToken, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { sortBy = 'total_steps' } = req.query;

    // Validate challenge exists and user is enrolled
    const challengeResult = await db.query(
      'SELECT * FROM challenges WHERE id = $1',
      [challengeId]
    );

    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const challenge = challengeResult.rows[0];
    
    // Check if user is enrolled in this challenge
    const enrollmentResult = await db.query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND challenge_id = $2',
      [req.user.id, challengeId]
    );

    if (enrollmentResult.rows.length === 0) {
      return res.status(403).json({ message: 'You must be enrolled in this challenge to view the leaderboard' });
    }

    // Get leaderboard data with basic stats first
    const leaderboardQuery = `
      WITH user_stats AS (
        SELECT 
          u.id,
          u.first_name,
          LEFT(u.last_name, 1) as last_initial,
          COALESCE(SUM(s.step_count), 0) as total_steps,
          COUNT(s.id) as days_submitted,
          COALESCE(AVG(s.step_count), 0) as avg_daily_steps,
          COUNT(CASE WHEN s.step_count >= 10000 THEN 1 END) as goal_days,
          0 as current_streak
        FROM users u
        INNER JOIN enrollments e ON u.id = e.user_id
        LEFT JOIN submissions s ON u.id = s.user_id AND s.challenge_id = $1
        WHERE e.challenge_id = $1
        GROUP BY u.id, u.first_name, u.last_name
      )
      SELECT 
        us.*,
        ROUND(
          (us.days_submitted::DECIMAL / 30.0) * 100, 1
        ) as completion_percentage
      FROM user_stats us
      ORDER BY 
        CASE 
          WHEN $2 = 'total_steps' THEN us.total_steps
          WHEN $2 = 'avg_daily_steps' THEN us.avg_daily_steps
          WHEN $2 = 'goal_days' THEN us.goal_days
          WHEN $2 = 'current_streak' THEN us.current_streak
          WHEN $2 = 'completion_percentage' THEN (us.days_submitted::DECIMAL / 30.0) * 100
          ELSE us.total_steps
        END DESC,
        us.total_steps DESC,
        us.first_name ASC
    `;

    const result = await db.query(leaderboardQuery, [
      challengeId,
      sortBy
    ]);

    // Add rank to each participant and get their daily submissions
    const leaderboard = [];
    
    for (let i = 0; i < result.rows.length; i++) {
      const participant = result.rows[i];
      
      // Get daily submissions for this participant
      const submissionsQuery = `
        SELECT date, step_count
        FROM submissions
        WHERE user_id = $1 AND challenge_id = $2
        ORDER BY date
      `;
      
      const submissionsResult = await db.query(submissionsQuery, [participant.id, challengeId]);
      
      leaderboard.push({
        ...participant,
        rank: i + 1,
        daily_submissions: submissionsResult.rows || []
      });
    }

    // Get challenge metadata
    const challengeInfo = {
      id: challenge.id,
      title: challenge.title,
      start_date: challenge.start_date,
      end_date: challenge.end_date,
      status: challenge.status,
      total_participants: leaderboard.length
    };

    res.json({
      challenge: challengeInfo,
      leaderboard,
      sort_by: sortBy
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get available challenges for leaderboard (only enrolled challenges)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.id, c.title, c.start_date, c.end_date, c.status,
             (SELECT COUNT(*) FROM enrollments WHERE challenge_id = c.id) as participant_count
      FROM challenges c
      INNER JOIN enrollments e ON c.id = e.challenge_id
      WHERE e.user_id = $1
      ORDER BY 
        CASE WHEN c.status = 'active' THEN 1
             WHEN c.status = 'completed' THEN 2
             ELSE 3 END,
        c.start_date DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user challenges for leaderboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;