import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { submitApplication, findCitizenByUserId } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function POST(req: NextRequest) {
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

    const citizen = await findCitizenByUserId(userId);

    const body = await req.json();
    const {
      serviceId,
      schemeId,
      serviceName,
      serviceNameMr,
      department,
      departmentMr,
      district,
      formData,
      smartDocumentPack,
      applicationType,
    } = body || {};

    if (!serviceName || !department) {
      return NextResponse.json(
        { success: false, error: 'Service name and department are required.' },
        { status: 400 }
      );
    }

    const createdApp = await submitApplication({
      userId,
      applicantName: body.applicantName || citizen?.full_name || 'Citizen',
      applicantMobile: citizen?.mobile_number,
      applicantAadhaarMasked: citizen?.aadhaar_masked,
      serviceId,
      schemeId,
      serviceName,
      serviceNameMr,
      department,
      departmentMr,
      district: district || citizen?.district || 'Maharashtra',
      applicationType,
      data: { formData, smartDocumentPack },
    });

    const mapped = {
      ...createdApp,
      applicationId: createdApp.application_id,
      serviceName: createdApp.service_name,
      serviceNameMr: createdApp.service_name_mr,
      department: createdApp.department,
      departmentMr: createdApp.department_mr,
      appliedDate: createdApp.applied_date,
      status: createdApp.status,
      statusColor: createdApp.status_color,
      applicantName: createdApp.applicant_name,
      district: createdApp.district,
      serviceId: createdApp.service_id,
      schemeId: createdApp.scheme_id,
      applicationType: createdApp.type,
      updatedAt: createdApp.last_updated,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully to Supabase.',
        application: mapped,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Application submission error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
