const express = require('express');
const router = express.Router();
const { verifyToken, requireCitizen } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const { createAuditLog } = require('../services/supabaseService');

// ─── GET /api/digilocker/status ───────────────────────────────────────────────
router.get('/status', verifyToken, requireCitizen, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { data: profile } = await supabase
      .from('profiles')
      .select('digilocker_linked, digilocker_id, digilocker_linked_at')
      .eq('user_id', userId)
      .maybeSingle();

    res.json({
      success: true,
      isConnected: Boolean(profile?.digilocker_linked),
      digiLockerId: profile?.digilocker_id || null,
      linkedAt: profile?.digilocker_linked_at || null,
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
    const now = new Date().toISOString();

    await supabase
      .from('profiles')
      .update({
        digilocker_linked: true,
        digilocker_id: digiLockerId,
        digilocker_linked_at: now,
      })
      .eq('user_id', userId);

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

    await supabase
      .from('profiles')
      .update({
        digilocker_linked: false,
        digilocker_id: null,
        digilocker_linked_at: null,
      })
      .eq('user_id', userId);

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
