const express = require('express');
const router = express.Router();
const { verifyToken, requireCitizen } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const {
  getApplicationsByCitizen,
  submitApplication,
} = require('../services/supabaseService');

function formatApplication(a) {
  if (!a) return null;
  return {
    ...a,
    id: a.application_id,
    applicationId: a.application_id,
    userId: a.user_id,
    serviceId: a.service_id,
    schemeId: a.scheme_id,
    serviceName: a.service_name,
    serviceNameMr: a.service_name_mr || a.service_name,
    schemeName: a.scheme_name,
    department: a.department,
    departmentMr: a.department_mr || a.department,
    departmentId: a.department_id,
    applicantName: a.applicant_name,
    applicantMobile: a.applicant_mobile,
    district: a.district,
    status: a.status,
    statusColor: a.status_color || 'bg-blue-100 text-blue-800 border-blue-300',
    appliedDate: a.applied_date,
    submittedAt: a.submitted_at,
    lastUpdated: a.last_updated,
    updatedAt: a.last_updated || a.updated_at,
    remarks: a.remarks,
    applicationType: a.type,
    downloadUrl: a.download_url || '#',
  };
}

// ─── GET /api/applications/my ─────────────────────────────────────────────────
router.get('/my', verifyToken, requireCitizen, async (req, res) => {
  try {
    const raw = await getApplicationsByCitizen(req.user.userId);
    const applications = raw.map(formatApplication);
    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/applications ───────────────────────────────────────────────────
router.post('/', verifyToken, requireCitizen, async (req, res) => {
  try {
    const userId = req.user.userId;
    const body = req.body || {};

    if (!body.serviceName || !body.department) {
      return res.status(400).json({
        success: false,
        error: 'Application requires serviceName and department.',
      });
    }

    const created = await submitApplication({
      userId,
      applicationId: body.id || body.applicationId,
      serviceId: body.serviceId,
      schemeId: body.schemeId,
      serviceName: body.serviceName,
      serviceNameMr: body.serviceNameMr,
      department: body.department,
      departmentMr: body.departmentMr,
      departmentId: body.departmentId,
      district: body.district,
      applicantName: body.applicantName,
      applicantMobile: req.user.mobile,
      applicantAadhaarMasked: body.applicantAadhaarMasked,
      applicationType: body.applicationType || (body.schemeId ? 'scheme' : 'service'),
      appliedDate: body.appliedDate,
      status: body.status || 'Submitted',
      statusColor: body.statusColor,
      data: body.formData || body.data || {},
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully to department queue.',
      application: formatApplication(created),
    });
  } catch (err) {
    console.error('Application submission error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit application: ' + err.message });
  }
});

// ─── GET /api/applications/:id ────────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    let query = supabase.from('applications').select('*').eq('application_id', id);

    // Citizen can only access their own application
    if (req.user.role === 'citizen') {
      query = query.eq('user_id', req.user.userId);
    }

    const { data: application, error } = await query.maybeSingle();

    if (error || !application) {
      return res.status(404).json({ success: false, error: 'Application record not found.' });
    }

    // Also fetch timeline
    const { data: timeline } = await supabase
      .from('application_timeline')
      .select('*')
      .eq('application_id', id)
      .order('created_at', { ascending: true });

    res.json({
      success: true,
      application: {
        ...formatApplication(application),
        timeline: timeline || [],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
