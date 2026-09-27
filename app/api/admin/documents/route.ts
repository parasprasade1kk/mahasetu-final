import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Administrator authentication required.' },
        { status: authResult.status || 401 }
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
