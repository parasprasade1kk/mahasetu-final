import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { Application, User, AuditLog } from '@/lib/models';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let userId = 'MH-CIT-001';
    let applicantName = 'Paras Prasade';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.userId) {
          userId = decoded.userId;
        }
      } catch {}
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable.' },
        { status: 503 }
      );
    }

    // Try to get citizen name from DB
    const userDoc = await User.findOne({ userId });
    if (userDoc) {
      applicantName = userDoc.fullName;
    }

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

    const ts = Date.now().toString().slice(-5);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const deptCode = department.includes('Revenue')
      ? 'REV'
      : department.includes('Education')
      ? 'EDU'
      : department.includes('Agriculture')
      ? 'AGR'
      : 'GEN';
    const applicationId = `MH-${deptCode}-2026-${ts}${rand}`;

    const newApp = await Application.create({
      applicationId,
      userId,
      applicantName: body.applicantName || applicantName,
      serviceId: serviceId || schemeId || '',
      schemeId: schemeId || '',
      serviceName,
      serviceNameMr: serviceNameMr || serviceName,
      department,
      departmentMr: departmentMr || department,
      status: 'Submitted',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
      district: district || 'Maharashtra',
      formData: formData || {},
      smartDocumentPack: smartDocumentPack || [],
      applicationType: applicationType || 'scheme',
      appliedDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    });

    await AuditLog.create({
      logId: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      actorId: userId,
      actorRole: 'citizen',
      action: 'SUBMIT_APPLICATION',
      targetResource: 'Application',
      targetId: applicationId,
      status: 'SUCCESS',
      metadata: { serviceName, department },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully to MongoDB Atlas.',
        application: newApp,
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
