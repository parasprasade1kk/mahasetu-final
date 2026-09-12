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

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    let query = supabase.from('schemes').select('*');

    if (department && department !== 'All') {
      query = query.or(`department.eq.${department},department_mr.eq.${department}`);
    }
    if (active && active !== 'All') {
      query = query.eq('active', active === 'true');
    }
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,name_mr.ilike.%${search}%,department.ilike.%${search}%,scheme_id.ilike.%${search}%`
      );
    }

    const { data: schemes, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch admin schemes error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve schemes: ' + error.message },
        { status: 500 }
      );
    }

    const mapped = (schemes || []).map((s: any) => ({
      ...s,
      schemeId: s.scheme_id,
      nameMr: s.name_mr,
      departmentMr: s.department_mr,
      categoryMr: s.category_mr,
      descriptionMr: s.description_mr,
    }));

    return NextResponse.json({
      success: true,
      schemes: mapped,
      total: mapped.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve schemes: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
