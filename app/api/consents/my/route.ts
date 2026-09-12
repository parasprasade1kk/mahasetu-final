import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getConsentsByCitizen } from '@/lib/supabaseService';

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

    const consents = await getConsentsByCitizen(userId);

    const mapped = (consents || []).map((c: any) => ({
      ...c,
      id: c.consent_id,
      consentId: c.consent_id,
      requestingDept: c.requesting_dept,
      requestingDeptMr: c.requesting_dept_mr || c.requesting_dept,
      sourceDept: c.source_dept,
      sourceDeptMr: c.source_dept_mr || c.source_dept,
      purpose: c.purpose,
      purposeMr: c.purpose_mr || c.purpose,
      dataFields: c.data_fields || [],
      status: c.status,
      validUntil: c.valid_until,
      createdAt: c.created_at,
    }));

    return NextResponse.json({
      success: true,
      consents: mapped,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve consents: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
