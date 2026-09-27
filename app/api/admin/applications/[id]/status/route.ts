import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { updateApplicationStatus } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Administrator authentication required.' },
        { status: authResult.status || 401 }
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
      changedBy: authResult.admin?.name || 'Government Administrator',
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
