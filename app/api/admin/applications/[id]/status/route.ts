import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { updateApplicationStatus } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, remarks } = body || {};

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Application status is required.' },
        { status: 400 }
      );
    }

    const updated = await updateApplicationStatus({
      applicationId: id,
      status,
      remarks,
      changedBy: decoded.name || 'Government Administrator',
    });

    const mapped = {
      ...updated,
      id: updated.application_id,
      applicationId: updated.application_id,
      applicantName: updated.applicant_name,
      serviceName: updated.service_name,
      status: updated.status,
      statusColor: updated.status_color,
      remarks: updated.remarks,
      lastUpdated: updated.last_updated,
    };

    return NextResponse.json({
      success: true,
      message: `Application ${mapped.applicationId} status updated to ${status}.`,
      application: mapped,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update status: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
