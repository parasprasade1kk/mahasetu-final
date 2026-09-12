import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { authenticateAdmin } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const { adminId, password } = body || {};

    if (!adminId || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both Administrator ID and Password.' },
        { status: 400 }
      );
    }

    const admin = await authenticateAdmin({ adminId, password });

    const token = jwt.sign(
      {
        adminId: admin.admin_id,
        role: admin.role || 'admin',
        name: admin.name,
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return NextResponse.json({
      success: true,
      message: 'Administrator authenticated successfully',
      token,
      admin: {
        adminId: admin.admin_id,
        role: admin.role || 'admin',
        name: admin.name,
        department: admin.department,
      },
    });
  } catch (err: any) {
    console.error('Supabase Admin Login Error:', err?.message);
    return NextResponse.json(
      { success: false, error: err?.message || 'Invalid Administrator ID or password.' },
      { status: err.status || 401 }
    );
  }
}
