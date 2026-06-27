const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/controller/approvals?status=pending
router.get('/approvals', async (req, res) => {
  const status = req.query.status || 'pending';
  try {
    const result = await pool.query(
      'SELECT * FROM approval_requests WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch approval requests' });
  }
});

// PATCH /api/controller/approvals/:id/approve
router.patch('/approvals/:id/approve', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const reqResult = await client.query('SELECT * FROM approval_requests WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (reqResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Approval request not found' });
    }
    const request = reqResult.rows[0];
    const payload = request.payload;

    if (request.request_type === 'new_room') {
      const photos = (payload.photo_urls || []).slice(0, 7);
      await client.query(
        `INSERT INTO rooms (room_number, price, description, photo_urls, is_approved)
         VALUES ($1, $2, $3, $4, TRUE)`,
        [payload.room_number, payload.price, payload.description || null, photos]
      );
    } else if (request.request_type === 'price_change') {
      await client.query(
        `UPDATE rooms SET price = $1, pending_price = NULL, updated_at = now() WHERE id = $2`,
        [payload.price, request.target_id]
      );
    } else if (request.request_type === 'remove_room') {
      await client.query('DELETE FROM rooms WHERE id = $1', [request.target_id]);
    }

    await client.query(
      `UPDATE approval_requests SET status = 'approved', reviewed_at = now() WHERE id = $1`,
      [req.params.id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Approved' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to approve request' });
  } finally {
    client.release();
  }
});

// PATCH /api/controller/approvals/:id/reject
router.patch('/approvals/:id/reject', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE approval_requests SET status = 'rejected', reviewed_at = now() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Approval request not found' });

    // Clear any pending_price set on the room when a price change is rejected
    if (result.rows[0].request_type === 'price_change' && result.rows[0].target_id) {
      await pool.query('UPDATE rooms SET pending_price = NULL WHERE id = $1', [result.rows[0].target_id]);
    }

    res.json({ message: 'Rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// GET /api/controller/rooms-overview - free vs occupied counts
router.get('/rooms-overview', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT status, COUNT(*) AS count FROM rooms GROUP BY status
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rooms overview' });
  }
});

// GET /api/controller/profit - total revenue from room orders + service orders
router.get('/profit', async (req, res) => {
  try {
    const roomRevenue = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) AS total FROM orders WHERE status = 'paid'`
    );
    const serviceRevenue = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) AS total FROM service_orders WHERE status = 'paid'`
    );
    res.json({
      room_revenue: Number(roomRevenue.rows[0].total),
      service_revenue: Number(serviceRevenue.rows[0].total),
      total_revenue: Number(roomRevenue.rows[0].total) + Number(serviceRevenue.rows[0].total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profit data' });
  }
});

// GET /api/controller/traffic - visit counts (workers & customers entering/exiting)
router.get('/traffic', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT visitor_type, event_type, COUNT(*) AS count
      FROM site_visits
      GROUP BY visitor_type, event_type
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch traffic data' });
  }
});

// GET /api/controller/feedback - controller can also see feedback
router.get('/feedback', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, c.customer_code FROM feedback f
      LEFT JOIN customers c ON f.customer_id = c.id
      ORDER BY f.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

module.exports = router;
