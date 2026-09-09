import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { Consent, AuditLog } from '@/lib/models';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    let userId = 'MH-CIT-001';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.userId) {
          userId = decoded.userId;
        }
      } catch {}
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable.' },
        { status: 503 }
      );
    }

    const { id } = params;

    const consentQuery = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ consentId: id }, { _id: id }] }
      : { consentId: id };

    let consent = await Consent.findOne(consentQuery);

    if (!consent) {
      // If not found, create an active consent for this user
      consent = await Consent.create({
        consentId: id,
        userId,
        requestingDept: 'Higher & Technical Education Department',
        requestingDeptMr: 'उच्च व तंत्रशिक्षण विभाग',
        sourceDept: 'Revenue Department (e-Mahabhumi / DigiLocker)',
        sourceDeptMr: 'महसूल विभाग (ई-महाभूमी / डिजिलॉकर)',
        purpose: 'Automatic income tier verification for MahaDBT scholarship disbursal',
        purposeMr: 'महाडीबीटी शिष्यवृत्ती वितरणासाठी स्वयंचलित उत्पन्न पडताळणी',
        status: 'Active',
        validUntil: '31 Mar 2027',
      });
    } else {
      const newStatus = consent.status === 'Active' ? 'Revoked' : 'Active';
      consent.status = newStatus as any;
      if (newStatus === 'Revoked') {
        consent.revokedAt = new Date();
      }
      await consent.save();
    }

    await AuditLog.create({
      logId: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      actorId: userId,
      actorRole: 'citizen',
      action: 'TOGGLE_CONSENT',
      targetResource: 'Consent',
      targetId: consent.consentId,
      status: 'SUCCESS',
      metadata: { newStatus: consent.status },
    });

    return NextResponse.json({
      success: true,
      message: `Consent ${consent.consentId} is now ${consent.status}.`,
      consent,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to toggle consent: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
