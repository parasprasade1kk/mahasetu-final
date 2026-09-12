const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { verifyToken, requireAdmin, JWT_SECRET } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const {
  authenticateAdmin,
  createAuditLog,
  getLiveAnalytics,
  updateApplicationStatus,
} = require('../services/supabaseService');

// ─── POST /api/admin/login (PUBLIC) ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { adminId, password } = req.body || {};

    if (!adminId || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both Administrator ID and Password.',
      });
    }

    const admin = await authenticateAdmin({ adminId, password });

    const token = jwt.sign(
      { adminId: admin.admin_id, role: admin.role, name: admin.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Government Administrator authenticated successfully.',
      token,
      admin: {
        adminId: admin.admin_id,
        name: admin.name,
        role: admin.role,
        department: 'General Administration Department (GAD), Mantralaya, Mumbai',
        lastLogin: admin.last_login,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/health (PUBLIC) ───────────────────────────────────────────
router.get('/health', async (req, res) => {
  const { error } = await supabase.from('admin_users').select('admin_id').limit(1);
  const isDbConnected = !error;
  res.json({
    status: isDbConnected ? 'ok' : 'degraded',
    service: 'MahaSetu Administration API',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// All subsequent routes require valid Admin authentication
router.use(verifyToken, requireAdmin);

// ─── GET /api/admin/me (PROTECTED) ────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('admin_id, name, role, last_login')
      .eq('admin_id', req.user.adminId)
      .maybeSingle();

    if (error || !admin) {
      return res.status(404).json({ success: false, error: 'Administrator profile not found.' });
    }

    res.json({
      success: true,
      admin: {
        adminId: admin.admin_id,
        name: admin.name,
        role: admin.role,
        department: 'General Administration Department (GAD), Mantralaya, Mumbai',
        lastLogin: admin.last_login,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/analytics ─────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const data = await getLiveAnalytics();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Analytics aggregation error:', err);
    res.status(500).json({ success: false, error: 'Failed to aggregate admin analytics: ' + err.message });
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search, district, category } = req.query;
    let query = supabase.from('profiles').select('*');

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,mobile_number.ilike.%${search}%,user_id.ilike.%${search}%`);
    }
    if (district) {
      query = query.ilike('district', `%${district}%`);
    }
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    const { data: profiles, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    const users = (profiles || []).map((p) => ({
      userId: p.user_id,
      fullName: p.full_name,
      mobile: p.mobile_number,
      aadhaarMasked: p.aadhaar_masked,
      email: p.email,
      isVerified: Boolean(p.aadhaar_hash),
      createdAt: p.created_at,
      district: p.district || 'Maharashtra',
      category: p.category || 'General/Open',
      occupation: p.occupation || 'Not Specified',
      annualIncomeAmount: p.annual_family_income ? Number(p.annual_family_income) : 0,
      educationLevel: p.education_level || '',
      isStudent: Boolean(p.student_status),
      hasDisability: Boolean(p.disability_status),
      digiLockerLinked: Boolean(p.digilocker_linked),
      confirmedAccurate: Boolean(p.confirmed_accurate),
    }));

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/users/:userId ─────────────────────────────────────────────
router.get('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Citizen not found.' });
    }

    const [{ data: applications }, { data: documents }, { data: consents }] = await Promise.all([
      supabase.from('applications').select('*').eq('user_id', userId),
      supabase.from('documents').select('*').eq('user_id', userId),
      supabase.from('consents').select('*').eq('user_id', userId),
    ]);

    res.json({
      success: true,
      user: {
        userId: profile.user_id,
        fullName: profile.full_name,
        mobile: profile.mobile_number,
        aadhaarMasked: profile.aadhaar_masked,
        email: profile.email,
        isVerified: Boolean(profile.aadhaar_hash),
        createdAt: profile.created_at,
        district: profile.district,
        category: profile.category,
        occupation: profile.occupation,
      },
      profile,
      applications: applications || [],
      documents: documents || [],
      consents: consents || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/applications ──────────────────────────────────────────────
router.get('/applications', async (req, res) => {
  try {
    const { status, department, search, type } = req.query;
    let query = supabase.from('applications').select('*');

    if (status) {
      query = query.ilike('status', `%${status}%`);
    }
    if (department) {
      query = query.ilike('department', `%${department}%`);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (search) {
      query = query.or(`applicant_name.ilike.%${search}%,service_name.ilike.%${search}%,application_id.ilike.%${search}%`);
    }

    const { data: applications, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    const formatted = (applications || []).map((a) => ({
      ...a,
      id: a.application_id,
      applicationId: a.application_id,
      serviceName: a.service_name,
      serviceNameMr: a.service_name_mr || a.service_name,
      applicantName: a.applicant_name,
      appliedDate: a.applied_date,
      statusColor: a.status_color,
      submittedAt: a.submitted_at,
      lastUpdated: a.last_updated,
    }));

    res.json({ success: true, count: formatted.length, applications: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/admin/applications/:id/status ───────────────────────────────────
router.put('/applications/:id/status', async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const applicationId = req.params.id;

    const application = await updateApplicationStatus({
      applicationId,
      status,
      remarks,
      changedBy: req.user.name || 'Government Administrator',
    });

    // Send notification
    await supabase.from('notifications').insert({
      user_id: application.user_id,
      title: `Application ${application.application_id} Updated`,
      title_mr: `अर्ज ${application.application_id} अद्ययावत झाला`,
      message: `Status updated to: ${status}${remarks ? '. Remarks: ' + remarks : ''}`,
      message_mr: `अर्जाची स्थिती: ${status}`,
      type: status === 'Approved' ? 'success' : status === 'Rejected' ? 'warning' : 'info',
    });

    res.json({
      success: true,
      message: `Application status updated to ${status}.`,
      application: {
        ...application,
        id: application.application_id,
        applicationId: application.application_id,
        serviceName: application.service_name,
      },
    });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ success: false, error: 'Failed to update application status: ' + err.message });
  }
});

// ─── GET /api/admin/schemes ───────────────────────────────────────────────────
router.get('/schemes', async (req, res) => {
  try {
    const { department, active, search } = req.query;
    let query = supabase.from('schemes').select('*');

    if (active !== undefined) {
      query = query.eq('active', active === 'true');
    }
    if (department) {
      query = query.ilike('department_id', `%${department}%`);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: schemes, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, count: schemes.length, schemes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/admin/schemes ──────────────────────────────────────────────────
router.post('/schemes', async (req, res) => {
  try {
    const body = req.body;
    const schemeId = body.schemeId || `SCH-${Date.now().toString(36).toUpperCase()}`;

    const newScheme = {
      scheme_id: schemeId,
      name: body.name,
      name_mr: body.nameMr || body.name,
      department_id: body.departmentId || 'general',
      department_name: body.department || body.departmentName || 'General Administration',
      department_name_mr: body.departmentMr || body.departmentNameMr || '',
      category: body.category || 'Welfare',
      description: body.description || '',
      benefits: body.benefits || '',
      income_limit: body.incomeLimit ? Number(body.incomeLimit) : null,
      min_age: body.minAge ? Number(body.minAge) : null,
      max_age: body.maxAge ? Number(body.maxAge) : null,
      allowed_categories: body.allowedCategories || [],
      keywords: body.keywords || [],
      problem_types: body.problemTypes || [],
      application_route: body.applicationRoute || `/apply/scheme/${schemeId}`,
      active: body.active !== false,
    };

    const { data, error } = await supabase.from('schemes').insert(newScheme).select().single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    await createAuditLog({
      actorId: req.user.adminId,
      actorRole: 'admin',
      action: 'SCHEME_CREATED',
      targetResource: 'Scheme',
      targetId: schemeId,
      metadata: { name: newScheme.name },
    });

    res.status(201).json({ success: true, message: 'Scheme created successfully.', scheme: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/admin/schemes/:id ───────────────────────────────────────────────
router.put('/schemes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;

    const updates = {
      name: body.name,
      name_mr: body.nameMr,
      description: body.description,
      benefits: body.benefits,
      income_limit: body.incomeLimit !== undefined ? Number(body.incomeLimit) : undefined,
      min_age: body.minAge !== undefined ? Number(body.minAge) : undefined,
      max_age: body.maxAge !== undefined ? Number(body.maxAge) : undefined,
      active: body.active !== undefined ? Boolean(body.active) : undefined,
      updated_at: new Date().toISOString(),
    };

    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const { data, error } = await supabase
      .from('schemes')
      .update(updates)
      .or(`scheme_id.eq.${id},id.eq.${id.match(/^[0-9a-fA-F-]{36}$/) ? id : '00000000-0000-0000-0000-000000000000'}`)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, message: 'Scheme updated.', scheme: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/admin/schemes/:id ────────────────────────────────────────────
router.delete('/schemes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { error } = await supabase
      .from('schemes')
      .update({ active: false })
      .or(`scheme_id.eq.${id},id.eq.${id.match(/^[0-9a-fA-F-]{36}$/) ? id : '00000000-0000-0000-0000-000000000000'}`);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, message: 'Scheme marked as inactive.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/documents ─────────────────────────────────────────────────
router.get('/documents', async (req, res) => {
  try {
    const { source, verificationStatus } = req.query;
    let query = supabase.from('documents').select('*');

    if (source) query = query.ilike('source', `%${source}%`);
    if (verificationStatus) query = query.ilike('verification_status', `%${verificationStatus}%`);

    const { data: documents, error } = await query.order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true, count: documents.length, documents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/consents ──────────────────────────────────────────────────
router.get('/consents', async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from('consents').select('*');

    if (status) query = query.eq('status', status);

    const { data: consents, error } = await query.order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true, count: consents.length, consents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/audit-logs ────────────────────────────────────────────────
router.get('/audit-logs', async (req, res) => {
  try {
    const { action, actorRole, limit = 50 } = req.query;
    let query = supabase.from('audit_logs').select('*');

    if (action) query = query.ilike('action', `%${action}%`);
    if (actorRole) query = query.eq('actor_role', actorRole);

    const { data: logs, error } = await query
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) return res.status(500).json({ success: false, error: error.message });

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

    const newNotif = {
      user_id: targetUserId || 'ALL',
      title,
      title_mr: titleMr || title,
      message,
      message_mr: messageMr || message,
      type,
      read: false,
    };

    const { data, error } = await supabase.from('notifications').insert(newNotif).select().single();

    if (error) return res.status(500).json({ success: false, error: error.message });

    await createAuditLog({
      actorId: req.user.adminId,
      actorRole: 'admin',
      action: 'NOTIFICATION_BROADCAST',
      targetResource: 'Notification',
      metadata: { title, target: targetUserId || 'ALL' },
    });

    res.json({ success: true, message: 'Notification broadcasted successfully.', notification: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
