const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { verifyToken, requireAdmin, JWT_SECRET } = require('../middleware/auth');
const {
  normalizeMobile,
  registerCitizen,
  authenticateCitizen,
  authenticateAdmin,
  findCitizenByUserId,
} = require('../services/supabaseService');
const { supabase } = require('../config/supabase');

const DEMO_OTP = process.env.DEMO_OTP || '123456';

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    const cleanMobile = normalizeMobile(mobile);

    if (!cleanMobile || cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number.',
      });
    }

    res.json({
      success: true,
      demoOtp: DEMO_OTP,
      message: `OTP sent successfully. Demo OTP: ${DEMO_OTP}`,
      isDemo: true,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error while dispatching OTP.' });
  }
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { fullName, mobile, aadhaar, consent, otp } = req.body;

    // Strictly validate demo OTP
    if (!otp || String(otp).trim() !== DEMO_OTP) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP. Please enter the authorized demo OTP: 123456.',
      });
    }

    const newProfile = await registerCitizen({
      fullName,
      mobile,
      aadhaar,
      consent,
    });

    const userObj = {
      userId: newProfile.user_id,
      fullName: newProfile.full_name,
      fullNameMr: newProfile.full_name_mr || newProfile.full_name,
      mobile: newProfile.mobile_number,
      email: newProfile.email,
      aadhaarMasked: newProfile.aadhaar_masked,
      role: 'citizen',
      createdAt: newProfile.created_at,
    };

    const token = jwt.sign(
      { userId: newProfile.user_id, mobile: newProfile.mobile_number, role: 'citizen' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Citizen account created successfully.',
      token,
      user: userObj,
      profile: newProfile,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { mobile, aadhaar, otp } = req.body;
    const cleanMobile = normalizeMobile(mobile);

    if (!cleanMobile || cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit registered mobile number.',
      });
    }

    if (!otp || String(otp).trim() !== DEMO_OTP) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP. Please enter the authorized demo OTP: 123456.',
      });
    }

    const profile = await authenticateCitizen({ mobile: cleanMobile, aadhaar });

    const userObj = {
      userId: profile.user_id,
      fullName: profile.full_name,
      fullNameMr: profile.full_name_mr || profile.full_name,
      mobile: profile.mobile_number,
      email: profile.email,
      aadhaarMasked: profile.aadhaar_masked,
      role: 'citizen',
      createdAt: profile.created_at,
    };

    const token = jwt.sign(
      { userId: profile.user_id, mobile: profile.mobile_number, role: 'citizen' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: userObj,
      profile,
    });
  } catch (err) {
    console.error('Citizen login error:', err);
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const profile = await findCitizenByUserId(req.user.userId);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    const userObj = {
      userId: profile.user_id,
      fullName: profile.full_name,
      fullNameMr: profile.full_name_mr || profile.full_name,
      mobile: profile.mobile_number,
      email: profile.email,
      aadhaarMasked: profile.aadhaar_masked,
      role: 'citizen',
      createdAt: profile.created_at,
    };

    res.json({
      success: true,
      user: userObj,
      profile,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/auth/admin-login ───────────────────────────────────────────────
router.post('/admin-login', async (req, res) => {
  try {
    const { adminId, password } = req.body;
    if (!adminId || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both Administrator ID and Password.',
      });
    }

    const admin = await authenticateAdmin({ adminId, password });

    const token = jwt.sign(
      { adminId: admin.admin_id, role: admin.role, name: admin.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Administrator authenticated successfully.',
      token,
      admin: {
        adminId: admin.admin_id,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.last_login,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/auth/admin-me ───────────────────────────────────────────────────
router.get('/admin-me', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('admin_id, name, role, last_login')
      .eq('admin_id', req.user.adminId)
      .maybeSingle();

    if (error || !admin) {
      return res.status(404).json({ success: false, error: 'Administrator account not found.' });
    }

    res.json({
      success: true,
      admin: {
        adminId: admin.admin_id,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.last_login,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
