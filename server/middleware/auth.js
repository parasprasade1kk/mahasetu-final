const jwt = require('jsonwebtoken');

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

/**
 * Verifies JWT token from Authorization header (Bearer <token>)
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Valid Sovereign Bearer token required.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token. Please authenticate again.',
    });
  }
}

/**
 * Restricts route to citizen users only
 */
function requireCitizen(req, res, next) {
  if (!req.user || req.user.role !== 'citizen') {
    return res.status(403).json({
      success: false,
      error: 'Access restricted to authorized Maharashtra Citizens.',
    });
  }
  next();
}

/**
 * Restricts route to authorized administrators only
 */
function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Dedicated Government Administrator privilege required.',
    });
  }
  next();
}

/**
 * Optional authentication - attaches decoded token if present
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Ignore expired/invalid token in optional mode
    }
  }
  next();
}

module.exports = {
  verifyToken,
  requireCitizen,
  requireAdmin,
  optionalAuth,
  JWT_SECRET,
};
