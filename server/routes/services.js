const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');

// ─── GET /api/services ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const services = await Scheme.find({ applicationType: 'service', active: true });
    res.json({ success: true, count: services.length, services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/services/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const service = await Scheme.findOne({
      schemeId: req.params.id,
      applicationType: 'service',
    });
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
