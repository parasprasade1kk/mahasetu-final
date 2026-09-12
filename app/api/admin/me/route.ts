import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Valid Bearer token required.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any = null;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session token.' },
        { status: 401 }
      );
    }

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Administrator privileges required.' },
        { status: 403 }
      );
    }

    let adminRecord: any = null;
    if (decoded.adminId) {
      const { data } = await supabase
        .from('admin_users')
        .select('admin_id, name, department, role, is_active, last_login')
        .eq('admin_id', decoded.adminId)
        .maybeSingle();
      adminRecord = data;
    }

    return NextResponse.json({
      success: true,
      admin: adminRecord
        ? {
            adminId: adminRecord.admin_id,
            name: adminRecord.name,
            role: adminRecord.role,
            department: adminRecord.department,
          }
        : {
            adminId: decoded.adminId || '1120610',
            name: decoded.name || 'Shri. S. K. Deshmukh',
            role: 'admin',
            department: 'General Administration Department (GAD), Mantralaya, Mumbai',
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
