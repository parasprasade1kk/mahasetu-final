const express = require('express');
const router = express.Router();
const { verifyToken, requireCitizen } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

// ─── GET /api/notifications/my ────────────────────────────────────────────────
router.get('/my', verifyToken, requireCitizen, async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${req.user.userId},user_id.eq.ALL`)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, count: notifications.length, notifications: notifications || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/notifications/read/:id ──────────────────────────────────────────
router.put('/read/:id', verifyToken, requireCitizen, async (req, res) => {
  try {
    const id = req.params.id;
    await supabase
      .from('notifications')
      .update({ read: true })
      .or(`id.eq.${id.match(/^[0-9a-fA-F-]{36}$/) ? id : '00000000-0000-0000-0000-000000000000'}`);

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
