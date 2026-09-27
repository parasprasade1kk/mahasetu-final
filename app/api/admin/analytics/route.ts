import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getLiveAnalytics } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Administrator access required.' },
        { status: authResult.status || 401 }
      );
    }

    const analyticsData = await getLiveAnalytics();

    return NextResponse.json({
      success: true,
      data: analyticsData,
      kpis: {
        totalRegisteredCitizens: analyticsData.totalCitizens,
        verifiedCitizens: analyticsData.verifiedCitizens,
        totalAuditLogs: analyticsData.totalAuditLogs,
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
