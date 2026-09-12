import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Administrator authentication required.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any = null;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session.' },
        { status: 401 }
      );
    }

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source');
    const verificationStatus = searchParams.get('verificationStatus');

    let query = supabase.from('documents').select('*');

    if (source && source !== 'All') {
      query = query.eq('source', source);
    }
    if (verificationStatus && verificationStatus !== 'All') {
      query = query.eq('verification_status', verificationStatus);
    }

    const { data: documents, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch admin documents error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve documents: ' + error.message },
        { status: 500 }
      );
    }

    const mapped = (documents || []).map((d: any) => ({
      ...d,
      id: d.document_id,
      documentId: d.document_id,
      documentType: d.document_type,
      documentName: d.document_name,
      documentNameMr: d.document_name_mr,
      authorityEn: d.authority_en,
      verificationStatus: d.verification_status,
      uploadedAt: d.created_at,
    }));

    return NextResponse.json({
      success: true,
      documents: mapped,
      total: mapped.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve documents: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
