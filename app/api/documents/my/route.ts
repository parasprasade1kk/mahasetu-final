import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDocumentsByCitizen } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let userId = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.userId) {
          userId = decoded.userId;
        }
      } catch {}
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Citizen authentication required.' },
        { status: 401 }
      );
    }

    const documents = await getDocumentsByCitizen(userId);

    const mapped = (documents || []).map((d: any) => ({
      ...d,
      id: d.document_id,
      documentId: d.document_id,
      documentType: d.document_type,
      documentName: d.document_name,
      documentNameMr: d.document_name_mr || d.document_name,
      authorityEn: d.authority_en || 'Government Authority',
      authorityMr: d.authority_mr || d.authority_en,
      issueDate: d.issued_date,
      certNo: d.cert_no,
      source: d.source,
      verificationStatus: d.verification_status,
      verified: d.verification_status === 'Verified',
      fileUrl: d.file_url,
      uploadedAt: d.created_at,
    }));

    return NextResponse.json({
      success: true,
      documents: mapped,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve documents: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
