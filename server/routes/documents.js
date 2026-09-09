const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const User = require('../models/User');
const { verifyToken, requireCitizen } = require('../middleware/auth');
const { createAuditLog } = require('../utils/auditLogger');

// ─── GET /api/documents/my ────────────────────────────────────────────────────
router.get('/my', verifyToken, requireCitizen, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId }).sort({ createdAt: -1 });
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

    const newDoc = await Document.create({
      documentId,
      userId,
      documentType,
      documentName,
      source: 'User Upload',
      verificationStatus: 'Citizen Uploaded',
      verified: false,
      uploadedAt: new Date(),
      expiryDate: 'Under Verification',
      fileUrl: fileName || 'citizen_document.pdf',
    });

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
      document: newDoc,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/documents/sync-digilocker ───────────────────────────────────────
router.post('/sync-digilocker', verifyToken, requireCitizen, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({ userId });

    const seedDocs = [
      {
        documentId: `DOC-INC-${userId.slice(-4)}`,
        userId,
        documentType: 'Income Proof',
        documentName: 'Annual Income Certificate (1 Year)',
        documentNameMr: 'वार्षिक उत्पन्नाचा दाखला (१ वर्ष)',
        authorityEn: 'Tehsildar Office, Revenue Department',
        authorityMr: 'तहसीलदार कार्यालय, महसूल विभाग',
        issueDate: '04 Sep 2026',
        certNo: `MH-REV-2025-${Math.floor(10000 + Math.random() * 90000)}`,
        source: 'DigiLocker',
        verificationStatus: 'Verified',
        verified: true,
      },
      {
        documentId: `DOC-CST-${userId.slice(-4)}`,
        userId,
        documentType: 'Caste & Category',
        documentName: 'Caste Certificate (OBC / SC / ST / General)',
        documentNameMr: 'जात प्रमाणपत्र',
        authorityEn: 'Sub-Divisional Officer, Revenue Division',
        authorityMr: 'उपविभागीय अधिकारी, महसूल विभाग',
        issueDate: '12 Jan 2024',
        certNo: `MH-CST-2024-${Math.floor(10000 + Math.random() * 90000)}`,
        source: 'DigiLocker',
        verificationStatus: 'Verified',
        verified: true,
      },
      {
        documentId: `DOC-DOM-${userId.slice(-4)}`,
        userId,
        documentType: 'Identity & Domicile',
        documentName: 'Age, Nationality & Domicile Certificate',
        documentNameMr: 'वय, अधिवास व राष्ट्रीयत्व प्रमाणपत्र',
        authorityEn: 'Executive Magistrate Office',
        authorityMr: 'कार्यकारी दंडाधिकारी कार्यालय',
        issueDate: '18 Aug 2023',
        certNo: `MH-DOM-2023-${Math.floor(10000 + Math.random() * 90000)}`,
        source: 'DigiLocker',
        verificationStatus: 'Verified',
        verified: true,
      },
      {
        documentId: `DOC-LND-${userId.slice(-4)}`,
        userId,
        documentType: 'Land & Property',
        documentName: '7/12 Land Record Extract (e-Mahabhumi)',
        documentNameMr: 'डिजिटल स्वाक्षरीत ७/१२ जमीन उतारा',
        authorityEn: 'Revenue Department & Settlement Commissioner',
        authorityMr: 'महसूल व भूमी अभिलेख विभाग',
        issueDate: '28 Aug 2026',
        certNo: `MH-LND-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        source: 'Demo Government Connector',
        verificationStatus: 'Verified',
        verified: true,
      },
    ];

    for (const doc of seedDocs) {
      await Document.findOneAndUpdate(
        { userId, documentType: doc.documentType },
        doc,
        { upsert: true, new: true }
      );
    }

    await createAuditLog({
      actorId: userId,
      actorRole: 'citizen',
      action: 'DIGILOCKER_SYNC',
      targetResource: 'DocumentVault',
      metadata: { source: 'DigiLocker / Demo Government Connector', count: seedDocs.length },
    });

    const currentDocs = await Document.find({ userId });

    res.json({
      success: true,
      message: 'DigiLocker certificates synced successfully. (Demo Integration)',
      count: currentDocs.length,
      documents: currentDocs,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
