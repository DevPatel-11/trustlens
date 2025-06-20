// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

/**
 * Role-based protection middleware.
 * Usage: protectVendor = authMiddleware('vendor')
 */
function authMiddleware(requiredRole) {
  return (req, res, next) => {
    try {
      // 1. Get token from header
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '');
      if (!token) throw new Error('No token provided');

      // 2. Verify and decode
      const payload = jwt.verify(token, JWT_SECRET);

      // 3. Check role
      if (payload.role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden: wrong role' });
      }

      // 4. Attach vendorId (or userId/adminId) for controllers
      req.vendorId = payload.id;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Not authorized' });
    }
  };
}

module.exports = authMiddleware;


