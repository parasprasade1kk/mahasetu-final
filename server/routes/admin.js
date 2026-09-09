const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Profile = require('../models/Profile');
const AdminUser = require('../models/AdminUser');
const Scheme = require('../models/Scheme');
const Application = require('../models/Application');
const Document = require('../models/Document');
const Consent = require('../models/Consent');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const DigiLockerConnection = require('../models/DigiLockerConnection');
const { verifyToken, requireAdmin, JWT_SECRET } = require('../middleware/auth');
const { createAuditLog } = require('../utils/auditLogger');

// ─── POST /api/admin/login (PUBLIC: Unauthenticated) ─────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { adminId, password } = req.body || {};

    if (!adminId || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both Administrator ID and Password.',
      });
    }

    const trimmedId = String(adminId).trim();
    const ADMIN_ID = process.env.ADMIN_ID || '1120610';
    const ADMIN_PASSWORD_HASH =
      process.env.ADMIN_PASSWORD_HASH ||
      '$2a$10$ZB4s9wtLu841OUnZwDw/G.bU6Woe.BTNeyarNiH9jj3b25Qdnj11O';

    let admin = null;
    let isPasswordValid = false;

    // Check database connection
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      admin = await AdminUser.findOne({ adminId: trimmedId });
      if (admin && admin.passwordHash) {
        isPasswordValid = bcrypt.compareSync(password, admin.passwordHash);
      } else if (trimmedId === ADMIN_ID) {
        // Fallback check against env hash and bootstrap DB record
        isPasswordValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
        if (isPasswordValid) {
          admin = await AdminUser.findOneAndUpdate(
            { adminId: ADMIN_ID },
            {
              adminId: ADMIN_ID,
              name: 'Shri. S. K. Deshmukh',
              department: 'General Administration Department (GAD), Mantralaya, Mumbai',
              role: 'admin',
              passwordHash: ADMIN_PASSWORD_HASH,
              isActive: true,
              lastLogin: new Date(),
            },
            { upsert: true, new: true }
          );
        }
      }
    } else {
      // Database not connected or reconnecting: verify against env credentials
      if (trimmedId === ADMIN_ID) {
        isPasswordValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
      }
    }

    if (!isPasswordValid) {
      if (isDbConnected) {
        await createAuditLog({
          actorId: trimmedId,
          actorRole: 'admin',
          action: 'ADMIN_LOGIN_FAILED',
          targetResource: 'AdminPortal',
          status: 'FAILURE',
          metadata: { attemptedId: trimmedId },
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid Administrator ID or password.',
      });
    }

    if (admin && isDbConnected) {
      admin.lastLogin = new Date();
      await admin.save();
    }

    if (isDbConnected) {
      await createAuditLog({
        actorId: trimmedId,
        actorRole: 'admin',
        action: 'ADMIN_LOGIN_SUCCESS',
        targetResource: 'AdminPortal',
        targetId: trimmedId,
      });
    }

    const token = jwt.sign(
      {
        adminId: trimmedId,
        role: 'admin',
        name: admin ? admin.name : 'Shri. S. K. Deshmukh',
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      success: true,
      message: 'Government Administrator session authorized.',
      token,
      admin: {
        adminId: trimmedId,
        name: admin ? admin.name : 'Shri. S. K. Deshmukh',
        role: 'admin',
        department: admin
          ? admin.department
          : 'General Administration Department (GAD), Mantralaya, Mumbai',
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Administration service is temporarily unavailable.',
    });
  }
});

// ─── GET /api/admin/me (PROTECTED) ───────────────────────────────────────────
router.get('/me', verifyToken, requireAdmin, async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let admin = null;
    if (isDbConnected) {
      admin = await AdminUser.findOne({ adminId: req.user.adminId }).select('-passwordHash');
    }

    return res.json({
      success: true,
      admin: admin || {
        adminId: req.user.adminId,
        name: req.user.name || 'Shri. S. K. Deshmukh',
        role: 'admin',
        department: 'General Administration Department (GAD), Mantralaya, Mumbai',
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/health (PUBLIC) ──────────────────────────────────────────
router.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    service: 'MahaSetu Administrator Management Subsystem',
    status: isDbConnected ? 'ok' : 'degraded',
    database: isDbConnected ? 'connected' : 'disconnected',
    adminAccountConfigured: true,
    timestamp: new Date().toISOString(),
  });
});

// All subsequent routes in this router require valid Admin authentication
router.use(verifyToken, requireAdmin);

// ─── GET /api/admin/analytics ─────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const [
      totalCitizens,
      verifiedCitizens,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalSchemes,
      documentsSubmitted,
      digiLockerUsers,
      activeConsents,
    ] = await Promise.all([
      User.countDocuments({ role: 'citizen' }),
      User.countDocuments({ role: 'citizen', isVerified: true }),
      Application.countDocuments(),
      Application.countDocuments({
        status: { $in: ['Draft', 'Submitted', 'Under Review', 'Documents Required'] },
      }),
      Application.countDocuments({ status: { $in: ['Approved', 'Completed', 'Approved / Issued'] } }),
      Application.countDocuments({ status: 'Rejected' }),
      Scheme.countDocuments({ applicationType: 'scheme' }),
      Document.countDocuments(),
      DigiLockerConnection.countDocuments({ isConnected: true }),
      Consent.countDocuments({ status: 'Active' }),
    ]);

    // Department breakdown
    const departmentStats = await Application.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Status breakdown
    const statusStats = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // District breakdown from Profiles
    const districtStats = await Profile.aggregate([
      { $match: { district: { $ne: '' } } },
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Recent audit activity
    const recentActivity = await AuditLog.find().sort({ timestamp: -1 }).limit(10);

    res.json({
      success: true,
      data: {
        totalCitizens,
        verifiedCitizens,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        totalSchemes,
        documentsSubmitted,
        digiLockerUsers,
        activeConsents,
        departmentStats,
        statusStats,
        districtStats,
        recentActivity,
      },
    });
  } catch (err) {
    console.error('Analytics aggregation error:', err);
    res.status(500).json({ success: false, error: 'Failed to aggregate admin analytics: ' + err.message });
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search, district, category, page = 1, limit = 50 } = req.query;

    const userFilter = { role: 'citizen' };
    if (search) {
      userFilter.$or = [
        { fullName: new RegExp(search, 'i') },
        { mobile: new RegExp(search, 'i') },
        { userId: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(userFilter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const userIds = users.map((u) => u.userId);
    const profiles = await Profile.find({ userId: { $in: userIds } });
    const profileMap = Object.fromEntries(profiles.map((p) => [p.userId, p]));

    // Join users with their profile data
    let combined = users.map((u) => {
      const p = profileMap[u.userId] || {};
      return {
        userId: u.userId,
        fullName: u.fullName,
        mobile: u.mobile,
        aadhaarMasked: u.aadhaarMasked,
        email: u.email,
        isVerified: u.isVerified,
        createdAt: u.createdAt,
        district: p.district || 'Maharashtra',
        category: p.category || 'General/Open',
        occupation: p.occupation || 'Not Specified',
        annualIncomeAmount: p.annualIncomeAmount || 0,
        educationLevel: p.educationLevel || '',
        isStudent: Boolean(p.isStudent),
        hasDisability: Boolean(p.hasDisability),
        digiLockerLinked: Boolean(p.digiLockerLinked),
        confirmedAccurate: Boolean(p.confirmedAccurate),
      };
    });

    if (district) {
      combined = combined.filter((u) =>
        u.district.toLowerCase().includes(district.toLowerCase())
      );
    }
    if (category) {
      combined = combined.filter((u) =>
        u.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    res.json({
      success: true,
      count: combined.length,
      users: combined,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/users/:userId ─────────────────────────────────────────────
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Citizen account not found.' });
    }

    const [profile, documents, applications, consents, activity] = await Promise.all([
      Profile.findOne({ userId }),
      Document.find({ userId }).sort({ createdAt: -1 }),
      Application.find({ userId }).sort({ createdAt: -1 }),
      Consent.find({ userId }).sort({ createdAt: -1 }),
      AuditLog.find({ actorId: userId }).sort({ timestamp: -1 }).limit(20),
    ]);

    res.json({
      success: true,
      user,
      profile,
      documents,
      applications,
      consents,
      activity,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/applications ──────────────────────────────────────────────
router.get('/applications', async (req, res) => {
  try {
    const { status, department, type, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (department && department !== 'All') {
      filter.department = new RegExp(department, 'i');
    }
    if (type && type !== 'All') {
      filter.applicationType = type;
    }
    if (search) {
      filter.$or = [
        { applicationId: new RegExp(search, 'i') },
        { applicantName: new RegExp(search, 'i') },
        { serviceName: new RegExp(search, 'i') },
      ];
    }

    const applications = await Application.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/admin/applications/:id/status ───────────────────────────────────
router.put('/applications/:id/status', async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const validStatuses = [
      'Draft',
      'Submitted',
      'Under Review',
      'Documents Required',
      'Approved',
      'Rejected',
      'Completed',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const statusColorMap = {
      Draft: 'bg-slate-100 text-slate-800 border-slate-300',
      Submitted: 'bg-blue-100 text-blue-800 border-blue-300',
      'Under Review': 'bg-amber-100 text-amber-800 border-amber-300',
      'Documents Required': 'bg-purple-100 text-purple-800 border-purple-300',
      Approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      Rejected: 'bg-red-100 text-red-800 border-red-300',
      Completed: 'bg-teal-100 text-teal-800 border-teal-300',
    };

    const application = await Application.findOne({
      $or: [{ applicationId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application record not found.' });
    }

    const previousStatus = application.status;
    application.status = status;
    application.statusColor = statusColorMap[status] || 'bg-blue-100 text-blue-800 border-blue-300';
    if (remarks) application.remarks = remarks;
    application.lastUpdated = new Date();
    await application.save();

    // Create Notification for the citizen
    await Notification.create({
      notificationId: `NOTIF-${Date.now()}`,
      userId: application.userId,
      title: `Application ${application.applicationId} Updated`,
      titleMr: `अर्ज ${application.applicationId} अद्ययावत झाला`,
      message: `Status updated to: ${status}${remarks ? '. Remarks: ' + remarks : ''}`,
      messageMr: `अर्जाची स्थिती: ${status}`,
      type: status === 'Approved' ? 'success' : status === 'Rejected' ? 'warning' : 'info',
    });

    // Write AuditLog
    await createAuditLog({
      actorId: req.user.adminId,
      actorRole: 'admin',
      action: 'APPLICATION_STATUS_UPDATE',
      targetResource: 'Application',
      targetId: application.applicationId,
      metadata: {
        previousStatus,
        newStatus: status,
        remarks: remarks || '',
        applicantName: application.applicantName,
      },
    });

    res.json({
      success: true,
      message: `Application status updated to ${status}.`,
      application,
    });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/schemes ───────────────────────────────────────────────────
router.get('/schemes', async (req, res) => {
  try {
    const { department, active, search } = req.query;
    const filter = {};
    if (department && department !== 'All') {
      filter.department = new RegExp(department, 'i');
    }
    if (active !== undefined && active !== 'All') {
      filter.active = active === 'true';
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { schemeId: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: schemes.length, schemes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/admin/schemes ──────────────────────────────────────────────────
router.post('/schemes', async (req, res) => {
  try {
    const schemeData = req.body;
    if (!schemeData.name || !schemeData.department || !schemeData.applicationRoute) {
      return res.status(400).json({
        success: false,
        error: 'Scheme name, department, and applicationRoute are required.',
      });
    }

    const schemeId =
      schemeData.schemeId ||
      schemeData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const scheme = await Scheme.create({
      ...schemeData,
      schemeId,
      active: schemeData.active !== false,
    });

    await createAuditLog({
      actorId: req.user.adminId,
      actorRole: 'admin',
      action: 'SCHEME_CREATED',
      targetResource: 'Scheme',
      targetId: scheme.schemeId,
      metadata: { name: scheme.name, department: scheme.department },
    });

    res.status(201).json({
      success: true,
      message: 'New scheme added to state repository.',
      scheme,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/admin/schemes/:id ───────────────────────────────────────────────
router.put('/schemes/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findOneAndUpdate(
      { $or: [{ schemeId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }] },
      req.body,
      { new: true }
    );

    if (!scheme) {
      return res.status(404).json({ success: false, error: 'Scheme not found.' });
    }

    await createAuditLog({
      actorId: req.user.adminId,
      actorRole: 'admin',
      action: 'SCHEME_UPDATED',
      targetResource: 'Scheme',
      targetId: scheme.schemeId,
      metadata: { name: scheme.name },
    });

    res.json({ success: true, message: 'Scheme updated successfully.', scheme });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/admin/schemes/:id ────────────────────────────────────────────
router.delete('/schemes/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findOneAndDelete({
      $or: [{ schemeId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });

    if (!scheme) {
      return res.status(404).json({ success: false, error: 'Scheme not found.' });
    }

    await createAuditLog({
      actorId: req.user.adminId,
      actorRole: 'admin',
      action: 'SCHEME_DELETED',
      targetResource: 'Scheme',
      targetId: scheme.schemeId,
      metadata: { name: scheme.name },
    });

    res.json({ success: true, message: 'Scheme removed from database.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/documents ─────────────────────────────────────────────────
router.get('/documents', async (req, res) => {
  try {
    const { source, verificationStatus } = req.query;
    const filter = {};
    if (source && source !== 'All') filter.source = source;
    if (verificationStatus && verificationStatus !== 'All') {
      filter.verificationStatus = verificationStatus;
    }

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: documents.length, documents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/consents ──────────────────────────────────────────────────
router.get('/consents', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;

    const consents = await Consent.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: consents.length, consents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/audit-logs ────────────────────────────────────────────────
router.get('/audit-logs', async (req, res) => {
  try {
    const { action, actorRole, limit = 100 } = req.query;
    const filter = {};
    if (action && action !== 'All') filter.action = action;
    if (actorRole && actorRole !== 'All') filter.actorRole = actorRole;

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(Number(limit));
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/admin/notifications/broadcast ──────────────────────────────────
router.post('/notifications/broadcast', async (req, res) => {
  try {
    const { title, titleMr, message, messageMr, type = 'info', targetUserId } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required.' });
    }

    let targetUsers = [];
    if (targetUserId) {
      targetUsers = [{ userId: targetUserId }];
    } else {
      targetUsers = await User.find({ role: 'citizen' }).select('userId');
    }

    const notificationsToInsert = targetUsers.map((u) => ({
      notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: u.userId,
      title,
      titleMr: titleMr || title,
      message,
      messageMr: messageMr || message,
      type,
    }));

    await Notification.insertMany(notificationsToInsert);

    await createAuditLog({
      actorId: req.user.adminId,
      actorRole: 'admin',
      action: 'ADMIN_BROADCAST_NOTIFICATION',
      targetResource: 'Notification',
      metadata: { recipientCount: notificationsToInsert.length, title },
    });

    res.json({
      success: true,
      message: `Notification broadcasted to ${notificationsToInsert.length} citizen(s).`,
      count: notificationsToInsert.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
