import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { syncDigiLockerForCitizen, findCitizenByUserId } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Citizen authentication required.' },
        { status: 401 }
      );
    }

    let userId = '';
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.userId) {
        userId = decoded.userId;
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired session token.' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing authenticated citizen identity.' },
        { status: 401 }
      );
    }

    const docs = await syncDigiLockerForCitizen(userId);
    const updatedCitizen = await findCitizenByUserId(userId);

    const mapped = (docs || []).map((d: any) => ({
      ...d,
      id: d.document_id,
      documentId: d.document_id,
      documentType: d.document_type,
      documentName: d.document_name,
      documentNameMr: d.document_name_mr || d.document_name,
      authorityEn: d.authority_en || 'Government Authority',
      issueDate: d.issued_date,
      source: d.source,
      verificationStatus: d.verification_status,
      verified: true,
      uploadedAt: d.created_at,
    }));

    return NextResponse.json({
      success: true,
      message: 'DigiLocker account linked and verified documents stored in Supabase.',
      connection: {
        userId,
        isConnected: true,
        digiLockerId: updatedCitizen?.digilocker_id,
        linkedAt: updatedCitizen?.digilocker_linked_at,
      },
      documents: mapped,
    });
  } catch (err: any) {
    console.error('DigiLocker link error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to link DigiLocker: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
