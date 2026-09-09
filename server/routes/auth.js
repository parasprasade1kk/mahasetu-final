const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const AdminUser = require('../models/AdminUser');
const Consent = require('../models/Consent');
const { verifyToken, requireAdmin, JWT_SECRET } = require('../middleware/auth');
const { createAuditLog } = require('../utils/auditLogger');

const DEMO_OTP = process.env.DEMO_OTP || '123456';
const ADMIN_ID = process.env.ADMIN_ID || '1120610';
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  '$2a$10$ZB4s9wtLu841OUnZwDw/G.bU6Woe.BTNeyarNiH9jj3b25Qdnj11O';

function normalizeMobile(m) {
  const digits = String(m || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

function maskAadhaar(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  const last4 = digits.length >= 4 ? digits.slice(-4) : '0000';
  return `XXXX XXXX ${last4}`;
}

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile, aadhaar, purpose } = req.body;
    const cleanMobile = normalizeMobile(mobile);

    if (!cleanMobile || cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number.',
      });
    }

    // In demo environment, return the authorized DEMO_OTP
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
    const { fullName, mobile, aadhaar, otp } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your full legal name (at least 2 characters).',
      });
    }

    const cleanMobile = normalizeMobile(mobile);
    if (!cleanMobile || cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number.',
      });
    }

    // Strictly validate demo OTP
    if (!otp || String(otp).trim() !== DEMO_OTP) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP. Please enter the authorized demo OTP: 123456.',
      });
    }

    // Check if citizen already exists
    let existingUser = await User.findOne({ mobile: cleanMobile });
    if (existingUser) {
      // Generate token for existing user
      const token = jwt.sign(
        { userId: existingUser.userId, mobile: existingUser.mobile, role: 'citizen' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const profile = await Profile.findOne({ userId: existingUser.userId });

      return res.json({
        success: true,
        message: 'Existing citizen account verified.',
        token,
        user: existingUser,
        profile,
      });
    }

    // Generate unique citizen ID
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const userId = `MH-CIT-${ts}-${rand}`;
    const masked = aadhaar ? maskAadhaar(aadhaar) : `XXXX XXXX ${cleanMobile.slice(-4)}`;

    const newUser = await User.create({
      userId,
      fullName: fullName.trim(),
      mobile: cleanMobile,
      aadhaarMasked: masked,
      email: `citizen.${cleanMobile}@mahasetu.gov.in`,
      role: 'citizen',
      isVerified: true,
    });

    // Create initial profile record
    const newProfile = await Profile.create({
      userId,
      fullName: fullName.trim(),
      mobile: cleanMobile,
      aadhaarMasked: masked,
      confirmedAccurate: false,
    });

    // Seed default baseline DPDP consent records for this new citizen
    await Consent.insertMany([
      {
        consentId: `CNS-${Date.now().toString().slice(-4)}-001`,
        userId,
        requestingDept: 'Higher & Technical Education Department',
        requestingDeptMr: 'उच्च व तंत्रशिक्षण विभाग',
        sourceDept: 'Revenue Department (e-Mahabhumi / DigiLocker)',
        sourceDeptMr: 'महसूल विभाग (ई-महाभूमी / डिजिलॉकर)',
        purpose: 'Automatic income tier verification for MahaDBT scholarship disbursal',
        purposeMr: 'महाडीबीटी शिष्यवृत्ती वितरणासाठी स्वयंचलित उत्पन्न पडताळणी',
        dataFields: ['Income Certificate 2025-26', 'Aadhaar Masked Ref', 'Caste Certificate Ref'],
        status: 'Active',
        validUntil: '31 Mar 2027',
      },
      {
        consentId: `CNS-${Date.now().toString().slice(-4)}-002`,
        userId,
        requestingDept: 'Agriculture Department (e-Pik Pahani)',
        requestingDeptMr: 'कृषी विभाग (ई-पीक पाहणी)',
        sourceDept: 'Revenue Department (7/12 Land Registry)',
        sourceDeptMr: 'महसूल विभाग (७/१२ जमीन नोंदणी)',
        purpose: 'Verification of land ownership for PM Kisan & Namo Shetkari Mahasanman Yojana',
        purposeMr: 'पीएम किसान आणि नमो शेतकरी महासन्मान योजनेसाठी जमिनीच्या मालकीची पडताळणी',
        dataFields: ['7/12 Extract (Record of Rights)', 'Gat Number', 'Crop Survey 2026'],
        status: 'Active',
        validUntil: '31 Dec 2026',
      },
    ]);

    await createAuditLog({
      actorId: userId,
      actorRole: 'citizen',
      action: 'CITIZEN_REGISTRATION',
      targetResource: 'User',
      targetId: userId,
      metadata: { fullName: newUser.fullName, mobile: newUser.mobile },
    });

    const token = jwt.sign(
      { userId: newUser.userId, mobile: newUser.mobile, role: 'citizen' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Citizen account created successfully.',
      token,
      user: newUser,
      profile: newProfile,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Registration failed: ' + err.message });
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

    // Strictly validate demo OTP
    if (!otp || String(otp).trim() !== DEMO_OTP) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP. Please enter the authorized demo OTP: 123456.',
      });
    }

    // Look up user in database
    let user = await User.findOne({ mobile: cleanMobile });

    // If not found, return clean error
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found for this mobile number. Please create a new account.',
      });
    }

    if (aadhaar && aadhaar.replace(/\D/g, '').length === 12) {
      user.aadhaarMasked = maskAadhaar(aadhaar);
      await user.save();
    }

    const profile = await Profile.findOne({ userId: user.userId });

    await createAuditLog({
      actorId: user.userId,
      actorRole: 'citizen',
      action: 'CITIZEN_LOGIN',
      targetResource: 'User',
      targetId: user.userId,
      metadata: { mobile: user.mobile },
    });

    const token = jwt.sign(
      { userId: user.userId, mobile: user.mobile, role: 'citizen' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user,
      profile,
    });
  } catch (err) {
    console.error('Citizen login error:', err);
    res.status(500).json({ success: false, error: 'Authentication failed: ' + err.message });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }
    const profile = await Profile.findOne({ userId: user.userId });
    res.json({
      success: true,
      user,
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

    const trimmedId = String(adminId).trim();

    // Check database for AdminUser
    let admin = await AdminUser.findOne({ adminId: trimmedId });

    let isPasswordValid = false;

    if (admin) {
      isPasswordValid = bcrypt.compareSync(password, admin.passwordHash);
    } else if (trimmedId === ADMIN_ID) {
      // Direct comparison with env hash for initial bootstrap
      isPasswordValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
      if (isPasswordValid) {
        // Upsert admin in database
        admin = await AdminUser.create({
          adminId: ADMIN_ID,
          name: 'Shri. S. K. Deshmukh (Addl. Secretary, GAD)',
          passwordHash: ADMIN_PASSWORD_HASH,
          role: 'admin',
          lastLogin: new Date(),
        });
      }
    }

    if (!isPasswordValid) {
      await createAuditLog({
        actorId: trimmedId,
        actorRole: 'admin',
        action: 'ADMIN_LOGIN_FAILED',
        targetResource: 'AdminPortal',
        status: 'FAILURE',
        metadata: { attemptedId: trimmedId },
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid Administrator ID or Password. Access denied.',
      });
    }

    // Update lastLogin
    if (admin) {
      admin.lastLogin = new Date();
      await admin.save();
    }

    await createAuditLog({
      actorId: trimmedId,
      actorRole: 'admin',
      action: 'ADMIN_LOGIN_SUCCESS',
      targetResource: 'AdminPortal',
      targetId: trimmedId,
    });

    const token = jwt.sign(
      { adminId: trimmedId, role: 'admin', name: admin ? admin.name : 'Administrator' },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      message: 'Government Administrator session authorized.',
      token,
      admin: {
        adminId: trimmedId,
        name: admin ? admin.name : 'Administrator',
        role: 'admin',
        department: admin ? admin.department : 'General Administration Department',
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, error: 'Administrator authorization failed: ' + err.message });
  }
});

// ─── GET /api/auth/admin-me ───────────────────────────────────────────────────
router.get('/admin-me', verifyToken, requireAdmin, async (req, res) => {
  try {
    const admin = await AdminUser.findOne({ adminId: req.user.adminId }).select('-passwordHash');
    res.json({
      success: true,
      admin: admin || {
        adminId: req.user.adminId,
        name: req.user.name || 'Administrator',
        role: 'admin',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
