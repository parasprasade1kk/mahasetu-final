const express = require('express');
const router = express.Router();
const { verifyToken, requireCitizen } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const {
  getDocumentsByCitizen,
  createAuditLog,
} = require('../services/supabaseService');

function formatDocument(d) {
  if (!d) return null;
  return {
    ...d,
    id: d.document_id,
    documentId: d.document_id,
    userId: d.user_id,
    documentType: d.document_type,
    documentName: d.document_name,
    documentNameMr: d.document_name_mr || d.document_name,
    source: d.source || 'Uploaded',
    verificationStatus: d.verification_status || 'Verified',
    verified: d.verification_status === 'Verified',
    fileSize: d.file_size || '250 KB',
    fileName: d.file_name || 'document.pdf',
    issueDate: d.issued_date || '04 Sep 2026',
    certNo: d.external_document_id || d.document_id,
  };
}

// ─── GET /api/documents/my ────────────────────────────────────────────────────
router.get('/my', verifyToken, requireCitizen, async (req, res) => {
  try {
    const raw = await getDocumentsByCitizen(req.user.userId);
    const documents = raw.map(formatDocument);
    res.json({ success: true, count: documents.length, documents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/documents/upload ───────────────────────────────────────────────
router.post('/upload', verifyToken, requireCitizen, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { documentName, documentType, fileName, fileSize } = req.body;

    if (!documentName || !documentType) {
      return res.status(400).json({ success: false, error: 'Document name and type are required.' });
    }

    const documentId = `DOC-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    const newDoc = {
      document_id: documentId,
      user_id: userId,
      document_type: documentType,
      document_name: documentName,
      source: 'Uploaded',
      verification_status: 'Citizen Uploaded',
      file_name: fileName || 'citizen_document.pdf',
      file_size: fileSize || '250 KB',
      issued_date: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('documents').insert(newDoc).select().single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    await createAuditLog({
      actorId: userId,
      actorRole: 'citizen',
      action: 'DOCUMENT_UPLOAD',
      targetResource: 'Document',
      targetId: documentId,
      metadata: { documentType, documentName },
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      document: formatDocument(data),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/documents/sync-digilocker ───────────────────────────────────────
router.post('/sync-digilocker', verifyToken, requireCitizen, async (req, res) => {
  try {
    const userId = req.user.userId;

    const seedDocs = [
      {
        document_id: `DOC-INC-${userId.slice(-4)}`,
        user_id: userId,
        document_type: 'Income Proof',
        document_name: 'Annual Income Certificate (1 Year)',
        document_name_mr: 'वार्षिक उत्पन्नाचा दाखला (१ वर्ष)',
        external_document_id: `MH-REV-2025-${Math.floor(10000 + Math.random() * 90000)}`,
        source: 'DigiLocker',
        verification_status: 'Verified',
        issued_date: '2026-09-04T00:00:00Z',
        file_size: '245 KB',
        file_name: 'income_certificate_2026.pdf',
        mime_type: 'application/pdf',
      },
      {
        document_id: `DOC-CST-${userId.slice(-4)}`,
        user_id: userId,
        document_type: 'Caste & Category',
        document_name: 'Caste Certificate (OBC / SC / ST / General)',
        document_name_mr: 'जात प्रमाणपत्र',
        external_document_id: `MH-CST-2024-${Math.floor(10000 + Math.random() * 90000)}`,
        source: 'DigiLocker',
        verification_status: 'Verified',
        issued_date: '2024-01-12T00:00:00Z',
        file_size: '310 KB',
        file_name: 'caste_certificate.pdf',
        mime_type: 'application/pdf',
      },
      {
        document_id: `DOC-DOM-${userId.slice(-4)}`,
        user_id: userId,
        document_type: 'Identity & Domicile',
        document_name: 'Age, Nationality & Domicile Certificate',
        document_name_mr: 'वय, अधिवास व राष्ट्रीयत्व प्रमाणपत्र',
        external_document_id: `MH-DOM-2023-${Math.floor(10000 + Math.random() * 90000)}`,
        source: 'DigiLocker',
        verification_status: 'Verified',
        issued_date: '2023-08-18T00:00:00Z',
        file_size: '280 KB',
        file_name: 'domicile_certificate.pdf',
        mime_type: 'application/pdf',
      },
      {
        document_id: `DOC-LND-${userId.slice(-4)}`,
        user_id: userId,
        document_type: 'Land & Property',
        document_name: '7/12 Land Record Extract (e-Mahabhumi)',
        document_name_mr: 'डिजिटल स्वाक्षरीत ७/१२ जमीन उतारा',
        external_document_id: `MH-LND-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        source: 'Demo Government Connector',
        verification_status: 'Verified',
        issued_date: '2026-08-28T00:00:00Z',
        file_size: '350 KB',
        file_name: '7_12_extract.pdf',
        mime_type: 'application/pdf',
      },
    ];

    for (const doc of seedDocs) {
      await supabase.from('documents').upsert(doc, { onConflict: 'document_id' });
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
      action: 'DIGILOCKER_SYNC',
      targetResource: 'DocumentVault',
      metadata: { source: 'DigiLocker / Demo Government Connector', count: seedDocs.length },
    });

    const { data: currentDocs } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const formatted = (currentDocs || []).map(formatDocument);

    res.json({
      success: true,
      message: 'DigiLocker certificates synced successfully. (Demo Integration)',
      count: formatted.length,
      documents: formatted,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
