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
    // 1. Verify Admin Authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Valid Administrator Bearer token required.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any = null;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired administrator session.' },
        { status: 401 }
      );
    }

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Administrator privileges required.' },
        { status: 403 }
      );
    }

    // 2. Connect to MongoDB Atlas
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to connect to MongoDB Atlas database. Please verify connection string.',
        },
        { status: 503 }
      );
    }

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
    console.error('Vercel Admin Analytics Route Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to aggregate admin analytics: ' + (err?.message || 'Internal error'),
      },
      { status: 500 }
    );
  }
}
