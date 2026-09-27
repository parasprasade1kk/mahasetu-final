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
