const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const TOKEN_EXPIRY = '12h';
const RESET_CODE_EXPIRY_MINUTES = 15;

function issueToken(account) {
  return jwt.sign(
    { id: account.id, username: account.username, role: account.role, full_name: account.full_name },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// POST /api/auth/login
// body: { username, password }
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM staff_accounts WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const account = result.rows[0];
    const matches = await bcrypt.compare(password, account.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = issueToken(account);
    res.json({
      token,
      account: {
        id: account.id,
        username: account.username,
        role: account.role,
        full_name: account.full_name,
        email: account.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me - confirms the current token is valid and returns the account
router.get('/me', requireAuth(), async (req, res) => {
  res.json({ staff: req.staff });
});

// GET /api/auth/setup-status
// Public check used by the frontend Setup page to know whether the
// one-time controller bootstrap is still available.
router.get('/setup-status', async (req, res) => {
  try {
    const existing = await pool.query("SELECT id FROM staff_accounts WHERE role = 'controller'");
    res.json({ needs_setup: existing.rows.length === 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check setup status' });
  }
});

// POST /api/auth/bootstrap-controller
// One-time setup route: creates the FIRST controller account, only works
// if no controller account exists yet. After that, this route always
// refuses - new controller/admin accounts must go through the normal
// "create admin" flow (which only an existing controller can call).
router.post('/bootstrap-controller', async (req, res) => {
  const { username, email, password, full_name } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, and password are required' });
  }

  try {
    const existing = await pool.query("SELECT id FROM staff_accounts WHERE role = 'controller'");
    if (existing.rows.length > 0) {
      return res.status(403).json({ error: 'A controller account already exists. Bootstrap is disabled.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO staff_accounts (username, email, password_hash, role, full_name)
       VALUES ($1, $2, $3, 'controller', $4) RETURNING id, username, role, full_name, email`,
      [username, email, passwordHash, full_name || null]
    );

    const account = result.rows[0];
    const token = issueToken(account);
    res.status(201).json({ token, account });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That username or email is already taken' });
    }
    res.status(500).json({ error: 'Failed to create controller account' });
  }
});

// POST /api/auth/admins - controller creates a new admin account
router.post('/admins', requireAuth(['controller']), async (req, res) => {
  const { username, email, password, full_name } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, and password are required' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO staff_accounts (username, email, password_hash, role, full_name)
       VALUES ($1, $2, $3, 'admin', $4) RETURNING id, username, role, full_name, email, created_at`,
      [username, email, passwordHash, full_name || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That username or email is already taken' });
    }
    res.status(500).json({ error: 'Failed to create admin account' });
  }
});

// GET /api/auth/admins - controller lists all admin accounts
router.get('/admins', requireAuth(['controller']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, full_name, created_at FROM staff_accounts WHERE role = 'admin' ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admin accounts' });
  }
});

// DELETE /api/auth/admins/:id - controller removes an admin account
router.delete('/admins/:id', requireAuth(['controller']), async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM staff_accounts WHERE id = $1 AND role = 'admin' RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Admin account not found' });
    res.json({ message: 'Admin account removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove admin account' });
  }
});

// --- Password recovery ---

// POST /api/auth/request-reset
// body: { email }
// Generates a 6-digit code valid for 15 minutes. In production this
// would be emailed; for now it's returned directly in the response so
// the flow can be tested without a live email service connected.
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  try {
    const account = await pool.query('SELECT id FROM staff_accounts WHERE email = $1', [email]);
    if (account.rows.length === 0) {
      // Don't reveal whether the email exists - generic response either way
      return res.json({ message: 'If that email is registered, a reset code has been issued.' });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + RESET_CODE_EXPIRY_MINUTES * 60 * 1000);

    await pool.query(
      `INSERT INTO password_resets (staff_account_id, code, expires_at) VALUES ($1, $2, $3)`,
      [account.rows[0].id, code, expiresAt]
    );

    // TODO: send `code` via email once an email provider is connected.
    // Returned here directly so the reset flow is testable today.
    res.json({ message: 'If that email is registered, a reset code has been issued.', dev_code: code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process reset request' });
  }
});

// POST /api/auth/confirm-reset
// body: { email, code, new_password }
router.post('/confirm-reset', async (req, res) => {
  const { email, code, new_password } = req.body;
  if (!email || !code || !new_password) {
    return res.status(400).json({ error: 'email, code, and new_password are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const account = await client.query('SELECT id FROM staff_accounts WHERE email = $1', [email]);
    if (account.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid code or email' });
    }
    const accountId = account.rows[0].id;

    const reset = await client.query(
      `SELECT * FROM password_resets
       WHERE staff_account_id = $1 AND code = $2 AND used = FALSE AND expires_at > now()
       ORDER BY created_at DESC LIMIT 1`,
      [accountId, code]
    );
    if (reset.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    const passwordHash = await bcrypt.hash(new_password, 10);
    await client.query('UPDATE staff_accounts SET password_hash = $1 WHERE id = $2', [passwordHash, accountId]);
    await client.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [reset.rows[0].id]);

    await client.query('COMMIT');
    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  } finally {
    client.release();
  }
});

// PATCH /api/auth/change-password - logged-in user changes their own password
router.patch('/change-password', requireAuth(), async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'current_password and new_password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM staff_accounts WHERE id = $1', [req.staff.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Account not found' });

    const matches = await bcrypt.compare(current_password, result.rows[0].password_hash);
    if (!matches) return res.status(401).json({ error: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE staff_accounts SET password_hash = $1 WHERE id = $2', [newHash, req.staff.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
