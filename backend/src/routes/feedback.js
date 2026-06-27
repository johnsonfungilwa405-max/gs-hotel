const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// POST /api/feedback - customer submits feedback (Contact tab)
router.post('/', async (req, res) => {
  const { customer_id, message } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });

  try {
    const result = await pool.query(
      `INSERT INTO feedback (customer_id, message) VALUES ($1, $2) RETURNING *`,
      [customer_id || null, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// GET /api/feedback - admin reads all feedback (requires login)
router.get('/', requireAuth(['admin', 'controller']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, c.customer_code, c.full_name, c.phone_number
      FROM feedback f
      LEFT JOIN customers c ON f.customer_id = c.id
      ORDER BY f.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// PATCH /api/feedback/:id/respond - admin responds to feedback (requires login)
router.patch('/:id/respond', requireAuth(['admin', 'controller']), async (req, res) => {
  const { admin_response } = req.body;
  if (!admin_response) return res.status(400).json({ error: 'admin_response is required' });

  try {
    const result = await pool.query(
      `UPDATE feedback SET admin_response = $1 WHERE id = $2 RETURNING *`,
      [admin_response, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Feedback not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to respond to feedback' });
  }
});

module.exports = router;
