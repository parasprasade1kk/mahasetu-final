import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getApplicationsByCitizen } from '@/lib/supabaseService';

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

    const applications = await getApplicationsByCitizen(userId);

    const mapped = (applications || []).map((a: any) => ({
      ...a,
      id: a.application_id,
      applicationId: a.application_id,
      serviceName: a.service_name,
      serviceNameMr: a.service_name_mr || a.service_name,
      department: a.department,
      departmentMr: a.department_mr || a.department,
      appliedDate: a.applied_date,
      status: a.status,
      statusColor: a.status_color,
      downloadUrl: a.download_url,
      applicantName: a.applicant_name,
      district: a.district,
      serviceId: a.service_id,
      schemeId: a.scheme_id,
      applicationType: a.type,
      updatedAt: a.last_updated,
    }));

    return NextResponse.json({
      success: true,
      applications: mapped,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve applications: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
