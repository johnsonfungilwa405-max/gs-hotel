const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this-in-production';

// Verifies the Authorization: Bearer <token> header and attaches the
// decoded staff payload ({ id, username, role }) to req.staff.
function requireAuth(allowedRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'You do not have permission to do this' });
      }
      req.staff = payload;
      next();
    } catch {
      return res.status(401).json({ error: 'Session expired or invalid, please log in again' });
    }
  };
}

module.exports = { requireAuth, JWT_SECRET };
