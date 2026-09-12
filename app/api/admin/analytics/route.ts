import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getLiveAnalytics } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function GET(req: NextRequest) {
  try {
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

    const analyticsData = await getLiveAnalytics();

    return NextResponse.json({
      success: true,
      data: analyticsData,
      kpis: {
        totalRegisteredCitizens: analyticsData.totalCitizens,
        verifiedCitizens: analyticsData.verifiedCitizens,
        totalApplications: analyticsData.totalApplications,
        pendingApplications: analyticsData.pendingApplications,
        approvedApplications: analyticsData.approvedApplications,
        rejectedApplications: analyticsData.rejectedApplications,
        totalSchemes: analyticsData.totalSchemes,
        totalServices: analyticsData.totalServices,
        documentsSubmitted: analyticsData.documentsSubmitted,
        digilockerConnectedUsers: analyticsData.digiLockerUsers,
        activeConsents: analyticsData.activeConsents,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[ADMIN ANALYTICS] Serverless execution error:', err?.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to load live dashboard data: ' + (err?.message || 'Server error'),
      },
      { status: 500 }
    );
  }
}
