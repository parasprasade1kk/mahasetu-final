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
    const status = searchParams.get('status');

    let query = supabase.from('consents').select('*');

    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    const { data: consents, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch admin consents error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve consents: ' + error.message },
        { status: 500 }
      );
    }

    const mapped = (consents || []).map((c: any) => ({
      ...c,
      id: c.consent_id,
      consentId: c.consent_id,
      requestingDept: c.requesting_dept,
      requestingDeptMr: c.requesting_dept_mr,
      sourceDept: c.source_dept,
      sourceDeptMr: c.source_dept_mr,
      purpose: c.purpose,
      purposeMr: c.purpose_mr,
      dataFields: c.data_fields || [],
      status: c.status,
      validUntil: c.valid_until,
      createdAt: c.created_at,
    }));

    return NextResponse.json({
      success: true,
      consents: mapped,
      total: mapped.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve consents: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
