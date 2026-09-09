const express = require('express');
const router = express.Router();
const DigiLockerConnection = require('../models/DigiLockerConnection');
const Profile = require('../models/Profile');
const { verifyToken, requireCitizen } = require('../middleware/auth');
const { createAuditLog } = require('../utils/auditLogger');

// ─── GET /api/digilocker/status ───────────────────────────────────────────────
router.get('/status', verifyToken, requireCitizen, async (req, res) => {
  try {
    const userId = req.user.userId;
    const connection = await DigiLockerConnection.findOne({ userId });
    res.json({
      success: true,
      isConnected: connection ? connection.isConnected : false,
      digiLockerId: connection ? connection.digiLockerId : null,
      linkedAt: connection ? connection.linkedAt : null,
      isDemo: true,
      providerNote: 'Demo Integration — Production deployment connects to MeitY DigiLocker API Gateway',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/digilocker/link ────────────────────────────────────────────────
router.post('/link', verifyToken, requireCitizen, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { securityPin } = req.body;

    if (!securityPin || String(securityPin).replace(/\D/g, '').length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 6-digit DigiLocker security PIN.',
      });
    }

    const digiLockerId = `DL-MH-${userId.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();

    const connection = await DigiLockerConnection.findOneAndUpdate(
      { userId },
      {
        userId,
        isConnected: true,
        linkedAt: now,
        digiLockerId,
        consentGiven: true,
      },
      { upsert: true, new: true }
    );

    // Update profile
    await Profile.findOneAndUpdate(
      { userId },
      {
        digiLockerLinked: true,
        digiLockerId,
        digiLockerLinkedAt: now,
      }
    );

    await createAuditLog({
      actorId: userId,
      actorRole: 'citizen',
      action: 'DIGILOCKER_CONNECTED',
      targetResource: 'DigiLockerConnection',
      targetId: digiLockerId,
      metadata: { isDemo: true },
    });

    res.json({
      success: true,
      message: 'DigiLocker account linked successfully. (Demo Integration)',
      digiLockerId,
      linkedAt: now,
      isDemo: true,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/digilocker/unlink ──────────────────────────────────────────────
router.post('/unlink', verifyToken, requireCitizen, async (req, res) => {
  try {
    const userId = req.user.userId;

    await DigiLockerConnection.findOneAndUpdate(
      { userId },
      { isConnected: false, digiLockerId: '', linkedAt: null }
    );

    await Profile.findOneAndUpdate(
      { userId },
      { digiLockerLinked: false, digiLockerId: '', digiLockerLinkedAt: null }
    );

    await createAuditLog({
      actorId: userId,
      actorRole: 'citizen',
      action: 'DIGILOCKER_DISCONNECTED',
      targetResource: 'DigiLockerConnection',
    });

    res.json({
      success: true,
      message: 'DigiLocker account unlinked.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
