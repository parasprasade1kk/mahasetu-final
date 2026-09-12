const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');

// ─── Utility helpers ─────────────────────────────────────────────────────────

function normalizeMobile(m) {
  const digits = String(m || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

function maskAadhaar(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  const last4 = digits.length >= 4 ? digits.slice(-4) : '0000';
  return `XXXX XXXX ${last4}`;
}

// ─── Audit Logger ────────────────────────────────────────────────────────────

async function createAuditLog({ actorId, actorRole = 'citizen', action, targetResource, targetId, status = 'SUCCESS', metadata = {} }) {
  try {
    const logId = `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    await supabase.from('audit_logs').insert({
      log_id: logId,
      actor_id: actorId,
      actor_role: actorRole,
      action,
      target_resource: targetResource,
      target_id: targetId,
      status,
      metadata,
    });
  } catch (err) {
    console.warn('Audit log write error:', err.message);
  }
}

// ─── Auth & Citizen Management ───────────────────────────────────────────────

async function findCitizenByMobile(mobile) {
  const cleanMobile = normalizeMobile(mobile);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('mobile_number', cleanMobile)
    .maybeSingle();

  if (error) {
    console.error('findCitizenByMobile error:', error.message);
    return null;
  }
  return data;
}

async function findCitizenByUserId(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('findCitizenByUserId error:', error.message);
    return null;
  }
  return data;
}

async function registerCitizen({ fullName, mobile, aadhaar, consent }) {
  const cleanMobile = normalizeMobile(mobile);
  const cleanAadhaar = String(aadhaar || '').replace(/\D/g, '');

  if (!fullName || fullName.trim().length < 2) {
    throw new Error('Please provide your full legal name (at least 2 characters).');
  }
  if (!cleanMobile || cleanMobile.length !== 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }
  if (!cleanAadhaar || cleanAadhaar.length !== 12) {
    throw new Error('Please enter a valid 12-digit Aadhaar Number.');
  }
  if (consent !== true && consent !== 'true') {
    throw new Error('Please provide Aadhaar consent to continue.');
  }

  // Hash Aadhaar
  const crypto = require('crypto');
  const aadhaarHash = crypto.createHash('sha256').update(cleanAadhaar).digest('hex');
  const maskedAadhaar = `XXXX XXXX ${cleanAadhaar.slice(-4)}`;

  // Check duplicate mobile
  const existingMobile = await findCitizenByMobile(cleanMobile);
  if (existingMobile) {
    const err = new Error('This mobile number is already associated with an existing account. Please log in using your existing account.');
    err.status = 409;
    throw err;
  }

  // Check duplicate Aadhaar
  const { data: existingAadhaar } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('aadhaar_hash', aadhaarHash)
    .maybeSingle();

  if (existingAadhaar) {
    const err = new Error('This Aadhaar number is already associated with an existing account. Please log in using your existing account.');
    err.status = 409;
    throw err;
  }

  // Generate unique citizen ID
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const userId = `MH-CIT-${ts}-${rand}`;

  // Insert profile record
  const profileRecord = {
    user_id: userId,
    full_name: fullName.trim(),
    mobile_number: cleanMobile,
    email: `citizen.${cleanMobile}@mahasetu.gov.in`,
    aadhaar_hash: aadhaarHash,
    aadhaar_masked: maskedAadhaar,
    aadhaar_consent_given: true,
    aadhaar_consent_at: new Date().toISOString(),
    confirmed_accurate: false,
    profile_completed: false,
  };

  const { data: newProfile, error: profileErr } = await supabase
    .from('profiles')
    .insert(profileRecord)
    .select()
    .single();

  if (profileErr) {
    console.error('Insert profile error:', profileErr.message);
    throw new Error('Failed to create citizen profile: ' + profileErr.message);
  }

  // Seed baseline DPDP consents for this fresh citizen
  const initialConsents = [
    {
      consent_id: `CNS-${userId}-001`,
      user_id: userId,
      requesting_dept: 'Higher & Technical Education Department',
      requesting_dept_mr: 'उच्च व तंत्रशिक्षण विभाग',
      source_dept: 'Revenue Department (e-Mahabhumi / DigiLocker)',
      source_dept_mr: 'महसूल विभाग (ई-महाभूमी / डिजिलॉकर)',
      purpose: 'Automatic income tier verification for MahaDBT scholarship disbursal',
      purpose_mr: 'महाडीबीटी शिष्यवृत्ती वितरणासाठी स्वयंचलित उत्पन्न पडताळणी',
      data_fields: ['Income Certificate 2025-26', 'Aadhaar Masked Ref', 'Caste Certificate Ref'],
      status: 'Active',
      valid_until: '31 Mar 2027',
    },
    {
      consent_id: `CNS-${userId}-002`,
      user_id: userId,
      requesting_dept: 'Agriculture Department (e-Pik Pahani)',
      requesting_dept_mr: 'कृषी विभाग (ई-पीक पाहणी)',
      source_dept: 'Revenue Department (7/12 Land Registry)',
      source_dept_mr: 'महसूल विभाग (७/१२ जमीन नोंदणी)',
      purpose: 'Verification of land ownership for PM Kisan & Namo Shetkari Mahasanman Yojana',
      purpose_mr: 'पीएम किसान आणि नमो शेतकरी महासन्मान योजनेसाठी जमिनीच्या मालकीची पडताळणी',
      data_fields: ['7/12 Extract (Record of Rights)', 'Gat Number', 'Crop Survey 2026'],
      status: 'Active',
      valid_until: '31 Dec 2026',
    },
  ];

  await supabase.from('consents').insert(initialConsents);

  await createAuditLog({
    actorId: userId,
    actorRole: 'citizen',
    action: 'CITIZEN_REGISTRATION',
    targetResource: 'Profile',
    targetId: userId,
    metadata: { fullName: profileRecord.full_name, mobile: cleanMobile },
  });

  return newProfile;
}

async function authenticateCitizen({ mobile, aadhaar }) {
  const cleanMobile = normalizeMobile(mobile);
  const citizen = await findCitizenByMobile(cleanMobile);

  if (!citizen) {
    const err = new Error('No account found for this mobile number. Please create a new account.');
    err.status = 404;
    throw err;
  }

  // Update Aadhaar if provided and not yet linked
  if (aadhaar) {
    const cleanAadhaar = String(aadhaar).replace(/\D/g, '');
    if (cleanAadhaar.length === 12 && (!citizen.aadhaar_hash || citizen.aadhaar_masked?.endsWith('0000'))) {
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(cleanAadhaar).digest('hex');
      const masked = `XXXX XXXX ${cleanAadhaar.slice(-4)}`;

      await supabase
        .from('profiles')
        .update({
          aadhaar_hash: hash,
          aadhaar_masked: masked,
          aadhaar_consent_given: true,
          aadhaar_consent_at: new Date().toISOString(),
        })
        .eq('user_id', citizen.user_id);

      citizen.aadhaar_masked = masked;
      citizen.aadhaar_hash = hash;
    }
  }

  await createAuditLog({
    actorId: citizen.user_id,
    actorRole: 'citizen',
    action: 'CITIZEN_LOGIN',
    targetResource: 'Profile',
    targetId: citizen.user_id,
    metadata: { mobile: cleanMobile },
  });

  return citizen;
}

// ─── Admin Management ────────────────────────────────────────────────────────

async function authenticateAdmin({ adminId, password }) {
  const trimmedId = String(adminId || '').trim();
  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('admin_id', trimmedId)
    .maybeSingle();

  if (error || !admin) {
    const err = new Error('Invalid Administrator ID or password.');
    err.status = 401;
    throw err;
  }

  const isValid = bcrypt.compareSync(password, admin.password_hash);
  if (!isValid) {
    await createAuditLog({
      actorId: trimmedId,
      actorRole: 'admin',
      action: 'ADMIN_LOGIN_FAILED',
      targetResource: 'AdminPortal',
      status: 'FAILURE',
      metadata: { attemptedId: trimmedId },
    });
    const err = new Error('Invalid Administrator ID or password.');
    err.status = 401;
    throw err;
  }

  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('admin_id', trimmedId);

  await createAuditLog({
    actorId: trimmedId,
    actorRole: 'admin',
    action: 'ADMIN_LOGIN',
    targetResource: 'AdminPortal',
    status: 'SUCCESS',
    metadata: { adminId: trimmedId },
  });

  return admin;
}

// ─── Applications ────────────────────────────────────────────────────────────

async function getApplicationsByCitizen(userId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('getApplicationsByCitizen error:', error.message);
    return [];
  }
  return data || [];
}

async function submitApplication(appData) {
  const deptCode = (appData.departmentId || appData.department || 'GOV').slice(0, 3).toUpperCase();
  const appId =
    appData.applicationId ||
    appData.id ||
    `MH-${deptCode}-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  const isScheme =
    appData.applicationType === 'scheme' ||
    Boolean(appData.schemeId) ||
    appData.type === 'scheme';

  const newApp = {
    application_id: appId,
    user_id: appData.userId,
    type: isScheme ? 'scheme' : 'service',
    scheme_id: isScheme ? (appData.schemeId || appData.serviceId) : null,
    service_id: !isScheme ? appData.serviceId : null,
    scheme_name: isScheme ? (appData.schemeName || appData.serviceName) : null,
    service_name: appData.serviceName,
    service_name_mr: appData.serviceNameMr || appData.serviceName,
    department_id: appData.departmentId || 'revenue',
    department: appData.department,
    department_mr: appData.departmentMr || appData.department,
    applicant_name: appData.applicantName || 'Citizen',
    applicant_mobile: appData.applicantMobile,
    applicant_aadhaar_masked: appData.applicantAadhaarMasked,
    district: appData.district || 'Maharashtra',
    status: appData.status || 'Submitted',
    status_color: appData.statusColor || 'bg-blue-100 text-blue-800 border-blue-300',
    applied_date:
      appData.appliedDate ||
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    submitted_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    remarks: appData.remarks || 'Application submitted successfully.',
    data: appData.data || {},
  };

  const { data, error } = await supabase
    .from('applications')
    .insert(newApp)
    .select()
    .single();

  if (error) {
    console.error('submitApplication error:', error.message);
    throw new Error('Failed to submit application: ' + error.message);
  }

  // Add initial timeline
  await supabase.from('application_timeline').insert({
    application_id: appId,
    status: newApp.status,
    message: 'Application submitted successfully through MahaSetu Portal.',
    changed_by: 'Citizen',
  });

  await createAuditLog({
    actorId: appData.userId,
    actorRole: 'citizen',
    action: 'APPLICATION_SUBMITTED',
    targetResource: 'Application',
    targetId: appId,
    metadata: { serviceName: newApp.service_name, department: newApp.department },
  });

  return data;
}

async function updateApplicationStatus({ applicationId, status, remarks, changedBy = 'Government Administrator' }) {
  let statusColor = 'bg-blue-100 text-blue-800 border-blue-300';
  const st = status.toLowerCase();
  if (st.includes('approve') || st.includes('issued') || st === 'completed') {
    statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (st.includes('reject')) {
    statusColor = 'bg-red-100 text-red-800 border-red-300';
  } else if (st.includes('scrutiny') || st.includes('verification') || st.includes('review') || st.includes('action')) {
    statusColor = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  const { data, error } = await supabase
    .from('applications')
    .update({
      status,
      status_color: statusColor,
      remarks: remarks || `Status updated to ${status}`,
      last_updated: new Date().toISOString(),
    })
    .eq('application_id', applicationId)
    .select()
    .single();

  if (error) {
    console.error('updateApplicationStatus error:', error.message);
    throw new Error('Failed to update application status: ' + error.message);
  }

  await supabase.from('application_timeline').insert({
    application_id: applicationId,
    status,
    message: remarks || `Application status changed to ${status}.`,
    changed_by: changedBy,
  });

  await createAuditLog({
    actorId: changedBy,
    actorRole: 'admin',
    action: 'APPLICATION_STATUS_UPDATED',
    targetResource: 'Application',
    targetId: applicationId,
    metadata: { newStatus: status, remarks },
  });

  return data;
}

// ─── Documents ───────────────────────────────────────────────────────────────

async function getDocumentsByCitizen(userId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getDocumentsByCitizen error:', error.message);
    return [];
  }
  return data || [];
}

async function syncDigiLockerForCitizen(userId) {
  const defaultSyncDocs = [
    {
      document_id: `DOC-DL-${Date.now().toString().slice(-5)}-01`,
      user_id: userId,
      document_type: 'Income Proof',
      document_name: 'Annual Income Certificate (1 Year)',
      document_name_mr: 'वार्षिक उत्पन्नाचा दाखला (१ वर्ष)',
      source: 'DigiLocker',
      verification_status: 'Verified',
      issued_date: new Date().toISOString(),
      file_size: '245 KB',
      file_name: 'income_certificate_digilocker.pdf',
      mime_type: 'application/pdf',
    },
    {
      document_id: `DOC-DL-${Date.now().toString().slice(-5)}-02`,
      user_id: userId,
      document_type: 'Caste & Category',
      document_name: 'Caste Certificate (State Authority)',
      document_name_mr: 'जात प्रमाणपत्र (राज्य प्राधिकरण)',
      source: 'DigiLocker',
      verification_status: 'Verified',
      issued_date: new Date().toISOString(),
      file_size: '310 KB',
      file_name: 'caste_certificate_digilocker.pdf',
      mime_type: 'application/pdf',
    },
    {
      document_id: `DOC-DL-${Date.now().toString().slice(-5)}-03`,
      user_id: userId,
      document_type: 'Identity & Domicile',
      document_name: 'Age, Nationality & Domicile Certificate',
      document_name_mr: 'वय, अधिवास व राष्ट्रीयत्व प्रमाणपत्र',
      source: 'DigiLocker',
      verification_status: 'Verified',
      issued_date: new Date().toISOString(),
      file_size: '280 KB',
      file_name: 'domicile_certificate_digilocker.pdf',
      mime_type: 'application/pdf',
    },
  ];

  for (const d of defaultSyncDocs) {
    await supabase.from('documents').upsert(d, { onConflict: 'document_id' });
  }

  await supabase
    .from('profiles')
    .update({
      digilocker_linked: true,
      digilocker_linked_at: new Date().toISOString(),
      digilocker_id: `DL-MH-${userId.slice(-4)}-SYNC`,
    })
    .eq('user_id', userId);

  await createAuditLog({
    actorId: userId,
    actorRole: 'citizen',
    action: 'DIGILOCKER_DOCUMENTS_SYNCED',
    targetResource: 'DocumentVault',
    targetId: userId,
    metadata: { syncedCount: defaultSyncDocs.length },
  });

  return getDocumentsByCitizen(userId);
}

// ─── Consents ────────────────────────────────────────────────────────────────

async function getConsentsByCitizen(userId) {
  const { data, error } = await supabase
    .from('consents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getConsentsByCitizen error:', error.message);
    return [];
  }
  return data || [];
}

async function toggleConsent(consentId, userId) {
  const { data: consent } = await supabase
    .from('consents')
    .select('*')
    .eq('consent_id', consentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!consent) {
    throw new Error('Consent record not found.');
  }

  const nextStatus = consent.status === 'Active' ? 'Revoked' : 'Active';
  const nextGranted = nextStatus === 'Active';

  const { data, error } = await supabase
    .from('consents')
    .update({
      status: nextStatus,
      granted: nextGranted,
      revoked_at: nextGranted ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('consent_id', consentId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update consent status: ' + error.message);
  }

  await createAuditLog({
    actorId: userId,
    actorRole: 'citizen',
    action: nextGranted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
    targetResource: 'Consent',
    targetId: consentId,
    metadata: { newStatus: nextStatus },
  });

  return data;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

async function getLiveAnalytics() {
  const [
    { count: totalCitizens },
    { count: verifiedCitizens },
    { count: totalApplications },
    { count: pendingApplications },
    { count: approvedApplications },
    { count: rejectedApplications },
    { count: totalSchemes },
    { count: totalServices },
    { count: documentsSubmitted },
    { count: digiLockerUsers },
    { count: activeConsents },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).not('aadhaar_hash', 'is', null),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }).in('status', ['Submitted', 'Under Scrutiny', 'Under Review', 'Field Verification', 'Document Verification']),
    supabase.from('applications').select('*', { count: 'exact', head: true }).in('status', ['Approved', 'Approved / Issued', 'Completed']),
    supabase.from('applications').select('*', { count: 'exact', head: true }).ilike('status', '%reject%'),
    supabase.from('schemes').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('digilocker_linked', true),
    supabase.from('consents').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
  ]);

  const { data: recentActivity } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    totalCitizens: totalCitizens || 0,
    verifiedCitizens: verifiedCitizens || 0,
    totalApplications: totalApplications || 0,
    pendingApplications: pendingApplications || 0,
    approvedApplications: approvedApplications || 0,
    rejectedApplications: rejectedApplications || 0,
    totalSchemes: totalSchemes || 0,
    totalServices: totalServices || 0,
    documentsSubmitted: documentsSubmitted || 0,
    digiLockerUsers: digiLockerUsers || 0,
    activeConsents: activeConsents || 0,
    recentActivity: recentActivity || [],
    departmentStats: [],
    statusStats: [],
    districtStats: [],
  };
}

module.exports = {
  normalizeMobile,
  maskAadhaar,
  createAuditLog,
  findCitizenByMobile,
  findCitizenByUserId,
  registerCitizen,
  authenticateCitizen,
  authenticateAdmin,
  getApplicationsByCitizen,
  submitApplication,
  updateApplicationStatus,
  getDocumentsByCitizen,
  syncDigiLockerForCitizen,
  getConsentsByCitizen,
  toggleConsent,
  getLiveAnalytics,
};
