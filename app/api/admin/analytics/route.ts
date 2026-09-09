import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import {
  User,
  Profile,
  Application,
  Scheme,
  Document,
  Consent,
  DigiLockerConnection,
  AuditLog,
} from '@/lib/models';
import { ensureDatabaseSeeded } from '@/lib/dbSeed';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function GET(req: NextRequest) {
  try {
    console.log('[ADMIN ANALYTICS] Request received');

    // 1. Verify Admin Authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Administrator session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any = null;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Administrator session expired. Please log in again.' },
        { status: 401 }
      );
    }

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { success: false, error: 'Administrator access required.' },
        { status: 403 }
      );
    }

    console.log('[ADMIN ANALYTICS] Admin authenticated');

    // 2. Connect to MongoDB Atlas
    const conn = await connectToDatabase();
    if (!conn) {
      console.warn('[ADMIN ANALYTICS] Database connection unavailable');
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection unavailable.',
        },
        { status: 503 }
      );
    }

    console.log('[ADMIN ANALYTICS] MongoDB connected');

    // 3. Ensure baseline demo records exist in database without creating duplicates
    await ensureDatabaseSeeded();

    // 4. Calculate real KPI metrics directly from MongoDB collections
    const [
      totalCitizens,
      verifiedCitizens,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalSchemes,
      documentsSubmitted,
      digiLockerUsers,
      activeConsents,
    ] = await Promise.all([
      User.countDocuments({ role: 'citizen' }),
      User.countDocuments({ role: 'citizen', isVerified: true }),
      Application.countDocuments(),
      Application.countDocuments({
        status: {
          $in: [
            'Draft',
            'Submitted',
            'Under Review',
            'Under Scrutiny',
            'Field Verification',
            'Documents Required',
            'Action Required',
            'Pending',
            'pending',
          ],
        },
      }),
      Application.countDocuments({
        status: { $in: ['Approved', 'Completed', 'Approved / Issued', 'approved'] },
      }),
      Application.countDocuments({
        status: { $in: ['Rejected', 'rejected'] },
      }),
      Scheme.countDocuments({ $or: [{ active: true }, { applicationType: 'scheme' }] }),
      Document.countDocuments(),
      DigiLockerConnection.countDocuments({ isConnected: true }),
      Consent.countDocuments({ status: 'Active' }),
    ]);

    console.log('[ADMIN ANALYTICS] Users count:', totalCitizens);
    console.log('[ADMIN ANALYTICS] Applications count:', totalApplications);

    // Breakdown aggregations
    const [departmentStats, statusStats, districtStats, recentActivity] = await Promise.all([
      Application.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Profile.aggregate([
        { $match: { district: { $ne: '' } } },
        { $group: { _id: '$district', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      AuditLog.find().sort({ timestamp: -1 }).limit(10).lean(),
    ]);

    console.log('[ADMIN ANALYTICS] Returning KPI response');

    return NextResponse.json({
      success: true,
      data: {
        totalCitizens,
        verifiedCitizens,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        totalSchemes,
        documentsSubmitted,
        digiLockerUsers,
        activeConsents,
        departmentStats,
        statusStats,
        districtStats,
        recentActivity,
      },
      kpis: {
        totalRegisteredCitizens: totalCitizens,
        verifiedCitizens,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        totalSchemes,
        documentsSubmitted,
        digilockerConnectedUsers: digiLockerUsers,
        activeConsents,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[ADMIN ANALYTICS] Serverless execution error:', err?.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to load live dashboard data.',
      },
      { status: 500 }
    );
  }
}
