const express = require('express');
const router = express.Router();
const { verifyToken, requireCitizen } = require('../middleware/auth');
const { getConsentsByCitizen, toggleConsent } = require('../services/supabaseService');

function formatConsent(c) {
  if (!c) return null;
  return {
    ...c,
    id: c.consent_id,
    consentId: c.consent_id,
    userId: c.user_id,
    requestingDept: c.requesting_dept,
    requestingDeptMr: c.requesting_dept_mr || c.requesting_dept,
    sourceDept: c.source_dept,
    sourceDeptMr: c.source_dept_mr || c.source_dept,
    purpose: c.purpose,
    purposeMr: c.purpose_mr || c.purpose,
    dataFields: c.data_fields || [],
    status: c.status,
    validUntil: c.valid_until || '31 Dec 2026',
    granted: c.granted,
  };
}

// ─── GET /api/consents/my ─────────────────────────────────────────────────────
router.get('/my', verifyToken, requireCitizen, async (req, res) => {
  try {
    const raw = await getConsentsByCitizen(req.user.userId);
    const consents = raw.map(formatConsent);
    res.json({ success: true, count: consents.length, consents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/consents/toggle/:id ────────────────────────────────────────────
router.post('/toggle/:id', verifyToken, requireCitizen, async (req, res) => {
  try {
    const consent = await toggleConsent(req.params.id, req.user.userId);
    const formatted = formatConsent(consent);
    res.json({
      success: true,
      message: `Consent successfully ${formatted.status === 'Active' ? 're-activated' : 'revoked'}.`,
      consent: formatted,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
