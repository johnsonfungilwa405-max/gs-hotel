const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/rooms - list all approved rooms (used by User frontend)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, room_number, price, status, photo_urls, description, likes_count
       FROM rooms
       WHERE is_approved = TRUE
       ORDER BY room_number ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET /api/rooms/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// POST /api/rooms/:id/like - toggle-free like increment
router.post('/:id/like', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE rooms SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json({ likes_count: result.rows[0].likes_count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to like room' });
  }
});

module.exports = router;
