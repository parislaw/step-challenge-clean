const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get challenge participants
router.get('/challenges/:id/participants', async (req, res) => {
  try {
    const challengeId = req.params.id;
    
    const result = await db.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        e.enrolled_at,
        COUNT(s.id) as submission_count,
        COALESCE(SUM(s.step_count), 0) as total_steps
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN submissions s ON s.user_id = u.id AND s.challenge_id = e.challenge_id
      WHERE e.challenge_id = $1
      GROUP BY u.id, u.first_name, u.last_name, u.email, e.enrolled_at
      ORDER BY total_steps DESC
    `, [challengeId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export challenge data as CSV
router.get('/challenges/:id/export', async (req, res) => {
  try {
    const challengeId = req.params.id;
    
    const result = await db.query(`
      SELECT 
        u.first_name,
        u.last_name,
        u.email,
        s.date,
        s.step_count,
        s.submitted_at
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN submissions s ON s.user_id = u.id AND s.challenge_id = e.challenge_id
      WHERE e.challenge_id = $1
      ORDER BY u.last_name, u.first_name, s.date
    `, [challengeId]);

    // Generate CSV
    const headers = ['First Name', 'Last Name', 'Email', 'Date', 'Step Count', 'Submitted At'];
    const csvRows = [headers.join(',')];
    
    result.rows.forEach(row => {
      const csvRow = [
        row.first_name || '',
        row.last_name || '',
        row.email || '',
        row.date || '',
        row.step_count || '',
        row.submitted_at || ''
      ].map(field => `"${field}"`).join(',');
      csvRows.push(csvRow);
    });

    const csv = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="challenge-${challengeId}-export.csv"`);
    res.send(csv);

  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Promise.all([
      // Total users
      db.query('SELECT COUNT(*) as count FROM users WHERE is_admin = false'),
      // Total challenges
      db.query('SELECT COUNT(*) as count FROM challenges'),
      // Active challenges
      db.query('SELECT COUNT(*) as count FROM challenges WHERE status = $1', ['active']),
      // Total submissions today
      db.query('SELECT COUNT(*) as count FROM submissions WHERE date = CURRENT_DATE')
    ]);

    res.json({
      totalUsers: parseInt(stats[0].rows[0].count),
      totalChallenges: parseInt(stats[1].rows[0].count),
      activeChallenges: parseInt(stats[2].rows[0].count),
      todaySubmissions: parseInt(stats[3].rows[0].count)
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get storage statistics by challenge
router.get('/storage-stats', async (req, res) => {
  try {
    const challengesResult = await db.query(`
      SELECT 
        c.id, 
        c.title, 
        c.start_date, 
        c.end_date, 
        c.status,
        COUNT(s.image_filename) FILTER (WHERE s.image_filename IS NOT NULL) as image_submissions,
        ARRAY_AGG(s.image_filename) FILTER (WHERE s.image_filename IS NOT NULL) as image_files
      FROM challenges c
      LEFT JOIN submissions s ON c.id = s.challenge_id
      GROUP BY c.id, c.title, c.start_date, c.end_date, c.status
      ORDER BY c.end_date DESC
    `);

    const challenges = [];
    let totalSize = 0;
    let totalImages = 0;
    let cleanableSize = 0;

    for (const challenge of challengesResult.rows) {
      let storageSize = 0;
      const imageFiles = challenge.image_files || [];

      // Calculate storage size for this challenge
      for (const filename of imageFiles) {
        if (filename) {
          try {
            const filePath = path.join(__dirname, '../uploads', filename);
            const stats = await fs.stat(filePath);
            storageSize += stats.size;
          } catch (error) {
            // File doesn't exist, skip
            console.warn(`File not found: ${filename}`);
          }
        }
      }

      const challengeData = {
        id: challenge.id,
        title: challenge.title,
        start_date: challenge.start_date,
        end_date: challenge.end_date,
        status: challenge.status,
        imageSubmissions: parseInt(challenge.image_submissions) || 0,
        storageSize: storageSize
      };

      challenges.push(challengeData);
      totalSize += storageSize;
      totalImages += challengeData.imageSubmissions;

      // If challenge is completed and has images, it's cleanable
      if (challenge.status === 'completed' && challengeData.imageSubmissions > 0) {
        cleanableSize += storageSize;
      }
    }

    res.json({
      challenges: challenges,
      totalStats: {
        totalSize,
        totalImages,
        cleanableSize
      }
    });

  } catch (error) {
    console.error('Error fetching storage stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete images for a completed challenge (soft delete)
router.delete('/challenges/:id/images', async (req, res) => {
  try {
    const challengeId = req.params.id;

    // Verify challenge is completed
    const challengeResult = await db.query(
      'SELECT status FROM challenges WHERE id = $1',
      [challengeId]
    );

    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challengeResult.rows[0].status !== 'completed') {
      return res.status(400).json({ message: 'Can only delete images from completed challenges' });
    }

    // Get all image filenames for this challenge
    const submissionsResult = await db.query(
      'SELECT image_filename FROM submissions WHERE challenge_id = $1 AND image_filename IS NOT NULL',
      [challengeId]
    );

    const imageFiles = submissionsResult.rows.map(row => row.image_filename);
    let deletedCount = 0;
    let spaceFreed = 0;

    // Delete image files from filesystem
    for (const filename of imageFiles) {
      try {
        const filePath = path.join(__dirname, '../uploads', filename);
        const stats = await fs.stat(filePath);
        await fs.unlink(filePath);
        deletedCount++;
        spaceFreed += stats.size;
      } catch (error) {
        console.warn(`Failed to delete file ${filename}:`, error.message);
      }
    }

    // Update database to set image_filename to NULL (soft delete)
    await db.query(
      'UPDATE submissions SET image_filename = NULL WHERE challenge_id = $1 AND image_filename IS NOT NULL',
      [challengeId]
    );

    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    res.json({
      deletedCount,
      spaceFreed: formatBytes(spaceFreed),
      message: `Successfully deleted ${deletedCount} images and freed ${formatBytes(spaceFreed)} of storage`
    });

  } catch (error) {
    console.error('Error deleting images:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;