const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const { verifyToken, requireCitizen } = require('../middleware/auth');
const { createAuditLog } = require('../utils/auditLogger');

// ─── GET /api/profiles/me ─────────────────────────────────────────────────────
router.get('/me', verifyToken, requireCitizen, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.userId });
    if (!profile) {
      const user = await User.findOne({ userId: req.user.userId });
      profile = await Profile.create({
        userId: req.user.userId,
        fullName: user ? user.fullName : 'Citizen',
        mobile: req.user.mobile,
        aadhaarMasked: user ? user.aadhaarMasked : '',
      });
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/profiles/me ─────────────────────────────────────────────────────
router.put('/me', verifyToken, requireCitizen, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    // Disallow overriding userId
    delete updates.userId;
    delete updates._id;

    if (updates.fullName && updates.fullName.trim()) {
      await User.findOneAndUpdate(
        { userId },
        { fullName: updates.fullName.trim() }
      );
    }

    const profile = await Profile.findOneAndUpdate(
      { userId },
      {
        ...updates,
        completedAt: updates.confirmedAccurate ? new Date() : undefined,
      },
      { new: true, upsert: true }
    );

    await createAuditLog({
      actorId: userId,
      actorRole: 'citizen',
      action: 'PROFILE_UPDATE',
      targetResource: 'Profile',
      targetId: userId,
      metadata: { district: profile.district, category: profile.category, occupation: profile.occupation },
    });

    res.json({
      success: true,
      message: 'Citizen profile updated successfully.',
      profile,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile: ' + err.message });
  }
});

module.exports = router;
