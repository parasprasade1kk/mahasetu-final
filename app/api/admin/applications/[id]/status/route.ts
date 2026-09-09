import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { Application, AuditLog } from '@/lib/models';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable.' },
        { status: 503 }
      );
    }

    const { id } = params;
    const { status, remarks } = await req.json();

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Application status is required.' },
        { status: 400 }
      );
    }

    let statusColor = 'bg-blue-100 text-blue-800 border-blue-300';
    if (status === 'Approved' || status === 'Completed') {
      statusColor = 'bg-teal-100 text-teal-800 border-teal-300';
    } else if (status === 'Rejected') {
      statusColor = 'bg-red-100 text-red-800 border-red-300';
    } else if (status === 'Under Review' || status === 'Under Scrutiny') {
      statusColor = 'bg-amber-100 text-amber-800 border-amber-300';
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ applicationId: id }, { _id: id }] }
      : { applicationId: id };

    const application = await Application.findOneAndUpdate(
      query,
      {
        status,
        statusColor,
        remarks: remarks || '',
        lastUpdated: new Date(),
      },
      { returnDocument: 'after' }
    );

    if (!application) {
      return NextResponse.json(
        { success: false, error: `Application ${id} not found.` },
        { status: 404 }
      );
    }

    // Audit log
    await AuditLog.create({
      logId: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      actorId: decoded.adminId || '1120610',
      actorRole: 'admin',
      action: 'UPDATE_APPLICATION_STATUS',
      targetResource: 'Application',
      targetId: application.applicationId,
      status: 'SUCCESS',
      metadata: { newStatus: status, remarks },
    });

    return NextResponse.json({
      success: true,
      message: `Application ${application.applicationId} status updated to ${status}.`,
      application,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update status: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
