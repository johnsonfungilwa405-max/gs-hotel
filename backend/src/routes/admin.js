const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// --- Rooms management (read + non-price edits are direct; price/new-room go to approval queue) ---

// GET /api/admin/rooms - all rooms including unapproved ones, for the admin's own view
router.get('/rooms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY room_number');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// POST /api/admin/rooms - propose a NEW room. Goes to approval_requests;
// it only appears live once the controller approves it.
router.post('/rooms', async (req, res) => {
  const { room_number, price, description, photo_urls } = req.body;
  if (!room_number || !price) return res.status(400).json({ error: 'room_number and price are required' });

  try {
    const request = await pool.query(
      `INSERT INTO approval_requests (request_type, target_table, payload)
       VALUES ('new_room', 'rooms', $1) RETURNING *`,
      [JSON.stringify({ room_number, price, description, photo_urls: photo_urls || [] })]
    );
    res.status(201).json({ message: 'Room submitted for controller approval', request: request.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit new room' });
  }
});

// PATCH /api/admin/rooms/:id/price - propose a price change, requires controller approval
router.patch('/rooms/:id/price', async (req, res) => {
  const { price } = req.body;
  if (!price) return res.status(400).json({ error: 'price is required' });

  try {
    await pool.query('UPDATE rooms SET pending_price = $1 WHERE id = $2', [price, req.params.id]);
    const request = await pool.query(
      `INSERT INTO approval_requests (request_type, target_table, target_id, payload)
       VALUES ('price_change', 'rooms', $1, $2) RETURNING *`,
      [req.params.id, JSON.stringify({ price })]
    );
    res.status(201).json({ message: 'Price change submitted for controller approval', request: request.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit price change' });
  }
});

// PATCH /api/admin/rooms/:id - non-price edits (photos, description) - direct, no approval needed
router.patch('/rooms/:id', async (req, res) => {
  const { description, photo_urls } = req.body;
  try {
    const result = await pool.query(
      `UPDATE rooms SET description = COALESCE($1, description), photo_urls = COALESCE($2, photo_urls), updated_at = now()
       WHERE id = $3 RETURNING *`,
      [description, photo_urls, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// DELETE /api/admin/rooms/:id - removing a room (direct per brief: "adding and removing rooms" is listed as admin+controller regulated; we route deletion through approval too for safety)
router.delete('/rooms/:id', async (req, res) => {
  try {
    const room = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
    if (room.rows.length === 0) return res.status(404).json({ error: 'Room not found' });

    const request = await pool.query(
      `INSERT INTO approval_requests (request_type, target_table, target_id, payload)
       VALUES ('remove_room', 'rooms', $1, $2) RETURNING *`,
      [req.params.id, JSON.stringify({ room_number: room.rows[0].room_number })]
    );
    res.status(201).json({ message: 'Room removal submitted for controller approval', request: request.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit room removal' });
  }
});

// --- Customers currently in the hotel ---
router.get('/customers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.customer_code, c.full_name, c.phone_number, o.room_id, r.room_number, o.status AS order_status
      FROM customers c
      JOIN orders o ON o.customer_id = c.id
      LEFT JOIN rooms r ON o.room_id = r.id
      WHERE o.status IN ('ordered', 'paid')
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch in-house customers' });
  }
});

module.exports = router;
