const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// Generates a simple human-friendly customer code like GS-0001
async function nextCustomerCode(client) {
  const result = await client.query('SELECT COUNT(*) FROM customers');
  const count = parseInt(result.rows[0].count, 10) + 1;
  return `GS-${String(count).padStart(4, '0')}`;
}

// POST /api/customers/identify
// Simple version of "every customer should have an ID when getting a
// service". Looks up an existing customer by phone, or creates a new
// guest ID on the spot. No password required at this step.
router.post('/identify', async (req, res) => {
  const { phone_number, full_name } = req.body;
  if (!phone_number) return res.status(400).json({ error: 'phone_number is required' });

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT * FROM customers WHERE phone_number = $1', [phone_number]);
    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }

    const code = await nextCustomerCode(client);
    const inserted = await client.query(
      `INSERT INTO customers (customer_code, phone_number, full_name)
       VALUES ($1, $2, $3) RETURNING *`,
      [code, phone_number, full_name || null]
    );
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to identify customer' });
  } finally {
    client.release();
  }
});

// POST /api/customers/register
// Optional account creation - email + password, or phone-only.
// "Continue with Google" is stubbed for now (see auth.js comment) and
// can be wired to real OAuth later without changing this shape.
router.post('/register', async (req, res) => {
  const { phone_number, full_name, email, password } = req.body;
  if (!phone_number) return res.status(400).json({ error: 'phone_number is required' });

  const client = await pool.connect();
  try {
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const existing = await client.query('SELECT * FROM customers WHERE phone_number = $1', [phone_number]);

    if (existing.rows.length > 0) {
      const updated = await client.query(
        `UPDATE customers SET full_name = COALESCE($1, full_name), email = COALESCE($2, email),
         password_hash = COALESCE($3, password_hash), has_account = TRUE
         WHERE phone_number = $4 RETURNING *`,
        [full_name, email, passwordHash, phone_number]
      );
      return res.json(updated.rows[0]);
    }

    const code = await nextCustomerCode(client);
    const inserted = await client.query(
      `INSERT INTO customers (customer_code, phone_number, full_name, email, password_hash, has_account)
       VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *`,
      [code, phone_number, full_name || null, email || null, passwordHash]
    );
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register customer' });
  } finally {
    client.release();
  }
});

// GET /api/customers - list (Admin use: see all customers currently in the hotel)
router.get('/', requireAuth(['admin', 'controller']), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, customer_code, full_name, phone_number, email, has_account, created_at FROM customers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

module.exports = router;
