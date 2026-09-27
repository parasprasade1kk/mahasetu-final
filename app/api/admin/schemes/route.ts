import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Administrator authentication required.' },
        { status: authResult.status || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    let query = supabase.from('schemes').select('*');

    if (department && department !== 'All') {
      query = query.or(`department_name.ilike.%${department}%,department_id.ilike.%${department}%`);
    }
    if (active && active !== 'All') {
      query = query.eq('active', active === 'true');
    }
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,name_mr.ilike.%${search}%,department_name.ilike.%${search}%,scheme_id.ilike.%${search}%`
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
      department: s.department_name,
      departmentMr: s.department_name_mr,
      departmentKey: s.department_id,
      nameMr: s.name_mr,
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
