import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);

    if (!authResult.authorized || !authResult.admin) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Access denied. Administrator privileges required.' },
        { status: authResult.status || 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        adminId: authResult.admin.adminId,
        name: authResult.admin.name,
        role: authResult.admin.role,
        department: authResult.admin.department || 'General Administration Department (GAD), Mantralaya, Mumbai',
      },
    });
  } catch (err: any) {
    console.error('Admin Me Error:', err);
    return NextResponse.json(
      { success: false, error: 'Administration service is temporarily unavailable.' },
      { status: 500 }
    );
  }
}
