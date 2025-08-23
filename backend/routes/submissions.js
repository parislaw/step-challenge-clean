const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const visionService = require('../services/visionService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `step-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit to match frontend
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

// Submit daily steps
router.post('/', authenticateToken, upload.single('stepImage'), async (req, res) => {
  try {
    const { challengeId, stepCount, date } = req.body;
    
    if (!challengeId || !stepCount || !date) {
      return res.status(400).json({ message: 'Challenge ID, step count, and date are required' });
    }

    const steps = parseInt(stepCount);
    if (isNaN(steps) || steps < 0 || steps > 100000) {
      return res.status(400).json({ message: 'Step count must be between 0 and 100,000' });
    }

    // Verify user is enrolled in challenge
    const enrollmentCheck = await db.query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND challenge_id = $2',
      [req.user.id, challengeId]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not enrolled in this challenge' });
    }

    // Check if submission already exists for this date
    const existingSubmission = await db.query(
      'SELECT id FROM submissions WHERE user_id = $1 AND challenge_id = $2 AND date = $3',
      [req.user.id, challengeId, date]
    );

    if (existingSubmission.rows.length > 0) {
      return res.status(400).json({ message: 'Submission already exists for this date' });
    }

    // Create submission
    const result = await db.query(`
      INSERT INTO submissions (user_id, challenge_id, date, image_filename, step_count)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.user.id, challengeId, date, req.file ? req.file.filename : null, steps]);

    res.status(201).json({
      message: 'Submission created successfully',
      submission: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's submissions for a challenge
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { challengeId } = req.query;
    
    if (!challengeId) {
      return res.status(400).json({ message: 'Challenge ID is required' });
    }

    const result = await db.query(`
      SELECT date, step_count, image_filename, submitted_at
      FROM submissions 
      WHERE user_id = $1 AND challenge_id = $2
      ORDER BY date ASC
    `, [req.user.id, challengeId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// OCR endpoint to extract step count from image
router.post('/extract-steps', authenticateToken, upload.single('stepImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    if (!visionService.isAvailable()) {
      return res.status(503).json({ 
        message: 'OCR service is not available. Please enter step count manually.' 
      });
    }

    const imagePath = req.file.path;
    const result = await visionService.extractTextFromImage(imagePath);

    if (result.success && result.stepCount) {
      res.json({
        success: true,
        stepCount: result.stepCount,
        confidence: result.confidence,
        message: 'Step count extracted successfully. Please verify the number is correct.'
      });
    } else {
      res.json({
        success: false,
        message: result.error || 'Could not extract step count from image. Please enter manually.',
        fullText: result.fullText
      });
    }

  } catch (error) {
    console.error('OCR extraction error:', error);
    res.status(500).json({ 
      message: 'OCR extraction failed. Please enter step count manually.' 
    });
  }
});

module.exports = router;