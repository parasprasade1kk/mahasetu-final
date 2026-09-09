const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { verifyToken, requireCitizen } = require('../middleware/auth');
const { createAuditLog } = require('../utils/auditLogger');

// ─── GET /api/applications/my ─────────────────────────────────────────────────
router.get('/my', verifyToken, requireCitizen, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/applications ───────────────────────────────────────────────────
router.post('/', verifyToken, requireCitizen, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      serviceId,
      schemeId,
      serviceName,
      serviceNameMr,
      department,
      departmentMr,
      district,
      formData,
      smartDocumentPack,
      applicationRoute,
      applicationType,
    } = req.body;

    if (!serviceName || !department) {
      return res.status(400).json({
        success: false,
        error: 'Application requires serviceName and department.',
      });
    }

    const user = await User.findOne({ userId });
    const profile = await Profile.findOne({ userId });

    const deptPrefixMap = {
      revenue: 'REV',
      education: 'EDU',
      social: 'SOC',
      agriculture: 'AGR',
      food: 'FCS',
    };

    const deptCode =
      deptPrefixMap[String(department).toLowerCase()] ||
      (String(department).toUpperCase().includes('REV') ? 'REV' :
       String(department).toUpperCase().includes('EDU') ? 'EDU' :
       String(department).toUpperCase().includes('AGR') ? 'AGR' : 'MAHA');

    const num = Math.floor(10000 + Math.random() * 90000);
    const applicationId = `MH-${deptCode}-2026-${num}`;

    const newApplication = await Application.create({
      applicationId,
      userId,
      applicantName: user ? user.fullName : (profile ? profile.fullName : 'Citizen'),
      serviceId: serviceId || '',
      schemeId: schemeId || '',
      serviceName,
      serviceNameMr: serviceNameMr || serviceName,
      department,
      departmentMr: departmentMr || department,
      district: district || (profile ? profile.district : 'Maharashtra'),
      formData: formData || {},
      smartDocumentPack: smartDocumentPack || [],
      applicationRoute: applicationRoute || '',
      applicationType: applicationType || 'scheme',
      status: 'Submitted',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
    });

    await createAuditLog({
      actorId: userId,
      actorRole: 'citizen',
      action: 'APPLICATION_SUBMITTED',
      targetResource: 'Application',
      targetId: applicationId,
      metadata: {
        serviceName,
        department,
        documentPackCount: (smartDocumentPack || []).length,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully to department queue.',
      application: newApplication,
    });
  } catch (err) {
    console.error('Application submission error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit application: ' + err.message });
  }
});

// ─── GET /api/applications/:id ────────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const query = { applicationId: req.params.id };
    // Citizen can only access their own application
    if (req.user.role === 'citizen') {
      query.userId = req.user.userId;
    }

    const application = await Application.findOne(query);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application record not found.' });
    }

    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
