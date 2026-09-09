const express = require('express');
const router = express.Router();
const Consent = require('../models/Consent');
const { verifyToken, requireCitizen } = require('../middleware/auth');
const { createAuditLog } = require('../utils/auditLogger');

// ─── GET /api/consents/my ─────────────────────────────────────────────────────
router.get('/my', verifyToken, requireCitizen, async (req, res) => {
  try {
    const consents = await Consent.find({ userId: req.user.userId }).sort({ createdAt: 1 });
    res.json({ success: true, count: consents.length, consents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/consents/toggle/:id ────────────────────────────────────────────
router.post('/toggle/:id', verifyToken, requireCitizen, async (req, res) => {
  try {
    const userId = req.user.userId;
    const consent = await Consent.findOne({ userId, consentId: req.params.id });

    if (!consent) {
      return res.status(404).json({ success: false, error: 'Consent record not found.' });
    }

    const nextStatus = consent.status === 'Active' ? 'Revoked' : 'Active';
    consent.status = nextStatus;
    if (nextStatus === 'Revoked') {
      consent.revokedAt = new Date();
    } else {
      consent.grantedAt = new Date();
      consent.revokedAt = null;
    }
    await consent.save();

    await createAuditLog({
      actorId: userId,
      actorRole: 'citizen',
      action: nextStatus === 'Active' ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
      targetResource: 'Consent',
      targetId: consent.consentId,
      metadata: {
        requestingDept: consent.requestingDept,
        sourceDept: consent.sourceDept,
        status: nextStatus,
      },
    });

    res.json({
      success: true,
      message: `Consent successfully ${nextStatus === 'Active' ? 're-activated' : 'revoked'}.`,
      consent,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
