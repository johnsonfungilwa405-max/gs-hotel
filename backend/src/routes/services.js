const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/services?category=drink|food
router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    const result = category
      ? await pool.query('SELECT * FROM services WHERE category = $1 AND is_approved = TRUE ORDER BY name', [category])
      : await pool.query('SELECT * FROM services WHERE is_approved = TRUE ORDER BY category, name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// POST /api/services/:id/like
router.post('/:id/like', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE services SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    res.json({ likes_count: result.rows[0].likes_count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to like service' });
  }
});

// POST /api/services/:id/order
router.post('/:id/order', async (req, res) => {
  const { customer_id, quantity } = req.body;
  if (!customer_id) return res.status(400).json({ error: 'customer_id is required' });
  const qty = quantity || 1;

  try {
    const service = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
    if (service.rows.length === 0) return res.status(404).json({ error: 'Service not found' });

    const totalPrice = Number(service.rows[0].price) * qty;
    const order = await pool.query(
      `INSERT INTO service_orders (customer_id, service_id, quantity, total_price)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [customer_id, req.params.id, qty, totalPrice]
    );
    res.status(201).json(order.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to order service' });
  }
});

module.exports = router;
