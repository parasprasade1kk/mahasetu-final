const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

/**
 * Verifies Bearer token from Authorization header.
 * Supports:
 * 1. Supabase Auth session tokens (Primary)
 * 2. Legacy/Internal JWT tokens (Fallback)
 */
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Valid Sovereign Bearer token required.',
    });
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Invalid session token.',
    });
  }

  // 1. Try Supabase Auth token
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (!userError && userData?.user) {
      const user = userData.user;
      const adminIdMeta = user.user_metadata?.admin_id;
      const email = user.email || '';

      // Check admin_users table
      let adminRow = null;
      const { data: row } = await supabase
        .from('admin_users')
        .select('*')
        .or(`auth_user_id.eq.${user.id},admin_id.eq.${adminIdMeta || 'NONE'}`)
        .eq('active', true)
        .maybeSingle();

      if (row) {
        adminRow = row;
      } else if (email.startsWith('admin.') && email.endsWith('@admin.mahasetu.gov.in')) {
        const parts = email.split('@')[0].split('.');
        const extractedId = parts[1];
        if (extractedId) {
          const { data: byExtracted } = await supabase
            .from('admin_users')
            .select('*')
            .eq('admin_id', extractedId)
            .eq('active', true)
            .maybeSingle();
          if (byExtracted) adminRow = byExtracted;
        }
      }

      if (adminRow) {
        req.user = {
          adminId: adminRow.admin_id,
          role: adminRow.role,
          name: adminRow.name,
          authUserId: user.id,
        };
        return next();
      }

      // Check citizen profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, full_name, mobile_number')
        .or(`auth_user_id.eq.${user.id},email.eq.${email}`)
        .maybeSingle();

      req.user = {
        userId: profile?.user_id || user.id,
        role: 'citizen',
        authUserId: user.id,
      };
      return next();
    }
  } catch {}

  // 2. Fallback: JWT verification
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
