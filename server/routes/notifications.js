const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { verifyToken, requireCitizen } = require('../middleware/auth');

// ─── GET /api/notifications/my ────────────────────────────────────────────────
router.get('/my', verifyToken, requireCitizen, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: notifications.length, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/notifications/read/:id ──────────────────────────────────────────
router.put('/read/:id', verifyToken, requireCitizen, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { notificationId: req.params.id, userId: req.user.userId },
      { isRead: true }
    );
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
