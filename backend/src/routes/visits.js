const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/visits - log an enter/exit event
// body: { visitor_type: 'customer'|'worker', event_type: 'enter'|'exit', customer_id? }
router.post('/', async (req, res) => {
  const { visitor_type, event_type, customer_id } = req.body;
  if (!visitor_type || !event_type) {
    return res.status(400).json({ error: 'visitor_type and event_type are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO site_visits (visitor_type, event_type, customer_id) VALUES ($1, $2, $3) RETURNING *`,
      [visitor_type, event_type, customer_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log visit' });
  }
});

module.exports = router;
