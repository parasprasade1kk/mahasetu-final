const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

function formatService(s) {
  if (!s) return null;
  return {
    ...s,
    id: s.service_id,
    serviceId: s.service_id,
    name: s.name,
    nameMr: s.name_mr,
    titleEn: s.name,
    titleMr: s.name_mr,
    departmentId: s.department_id,
    department: s.department_name,
    departmentMr: s.department_name_mr,
    deptNameEn: s.department_name,
    deptNameMr: s.department_name_mr,
    description: s.description,
    descriptionMr: s.description_mr,
    descEn: s.description,
    descMr: s.description_mr,
    eligibility: s.eligibility,
    eligibilityMr: s.eligibility_mr,
    applicationRoute: s.application_route || `/apply/${s.service_id}`,
    processingDays: s.processing_days || 7,
    feeInr: s.fee_inr ? Number(s.fee_inr) : 0,
    active: s.active,
  };
}

// ─── GET /api/services ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    const formatted = (services || []).map(formatService);
    res.json({ success: true, count: formatted.length, services: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/services/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .or(`service_id.eq.${id},id.eq.${id.match(/^[0-9a-fA-F-]{36}$/) ? id : '00000000-0000-0000-0000-000000000000'}`)
      .maybeSingle();

    if (error || !service) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }

    res.json({ success: true, service: formatService(service) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
