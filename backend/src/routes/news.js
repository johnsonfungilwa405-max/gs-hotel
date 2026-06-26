const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/news
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM news_posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// POST /api/news - admin posts an update
router.post('/', async (req, res) => {
  const { title, body, photo_url } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title and body are required' });

  try {
    const result = await pool.query(
      `INSERT INTO news_posts (title, body, photo_url) VALUES ($1, $2, $3) RETURNING *`,
      [title, body, photo_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post news' });
  }
});

module.exports = router;
