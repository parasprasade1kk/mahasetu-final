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
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    let query = supabase.from('applications').select('*');

    if (status && status !== 'All') {
      query = query.eq('status', status);
    }
    if (type && type !== 'All') {
      query = query.eq('type', type.toLowerCase());
    }
    if (search) {
      query = query.or(
        `application_id.ilike.%${search}%,applicant_name.ilike.%${search}%,service_name.ilike.%${search}%,department.ilike.%${search}%`
      );
    }

    const { data: apps, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      console.error('Fetch admin applications error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve applications: ' + error.message },
        { status: 500 }
      );
    }

    const mapped = (apps || []).map((a: any) => ({
      ...a,
      id: a.application_id,
      applicationId: a.application_id,
      applicantName: a.applicant_name,
      serviceName: a.service_name,
      serviceNameMr: a.service_name_mr,
      department: a.department,
      departmentMr: a.department_mr,
      status: a.status,
      statusColor: a.status_color,
      appliedDate: a.applied_date,
      district: a.district,
      serviceId: a.service_id,
      schemeId: a.scheme_id,
      applicationType: a.type,
      remarks: a.remarks,
      lastUpdated: a.last_updated,
    }));

    return NextResponse.json({
      success: true,
      applications: mapped,
      total: mapped.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve applications: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
