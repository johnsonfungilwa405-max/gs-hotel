const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/orders
// body: { customer_id, room_id, stay_duration_nights, check_in_date? }
// If the room is free -> immediate order, room becomes 'ordered'.
// If the room is already ordered/paid -> this becomes a pre-order
// (per the notes: "a person can make a pre-order at a room when someone
// else is still using that room").
router.post('/', async (req, res) => {
  const { customer_id, room_id, stay_duration_nights, check_in_date } = req.body;

  if (!customer_id || !room_id || !stay_duration_nights) {
    return res.status(400).json({ error: 'customer_id, room_id, and stay_duration_nights are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const roomResult = await client.query('SELECT * FROM rooms WHERE id = $1 FOR UPDATE', [room_id]);
    if (roomResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = roomResult.rows[0];
    const orderType = room.status === 'free' ? 'now' : 'pre_order';
    const totalPrice = Number(room.price) * Number(stay_duration_nights);

    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, room_id, order_type, stay_duration_nights, check_in_date, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'ordered')
       RETURNING *`,
      [customer_id, room_id, orderType, stay_duration_nights, check_in_date || null, totalPrice]
    );

    // Only flip the room to "ordered" if it was free; a pre-order doesn't
    // change the current occupant's room state.
    if (room.status === 'free') {
      await client.query(`UPDATE rooms SET status = 'ordered', updated_at = now() WHERE id = $1`, [room_id]);
    }

    await client.query('COMMIT');
    res.status(201).json(orderResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

// PATCH /api/orders/:id/pay - mark an order paid, room status -> paid
router.patch('/:id/pay', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderResult = await client.query(
      `UPDATE orders SET status = 'paid' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orderResult.rows[0];
    if (order.room_id) {
      await client.query(`UPDATE rooms SET status = 'paid', updated_at = now() WHERE id = $1`, [order.room_id]);
    }
    await client.query('COMMIT');
    res.json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update order' });
  } finally {
    client.release();
  }
});

// PATCH /api/orders/:id/complete - guest checks out, room becomes free again
router.patch('/:id/complete', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderResult = await client.query(
      `UPDATE orders SET status = 'completed' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orderResult.rows[0];
    if (order.room_id) {
      await client.query(`UPDATE rooms SET status = 'free', updated_at = now() WHERE id = $1`, [order.room_id]);
    }
    await client.query('COMMIT');
    res.json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to complete order' });
  } finally {
    client.release();
  }
});

// GET /api/orders - all orders, joined with room + customer (Admin/Controller use)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, r.room_number, c.customer_code, c.full_name, c.phone_number
      FROM orders o
      LEFT JOIN rooms r ON o.room_id = r.id
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
