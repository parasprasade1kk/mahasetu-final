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
    const search = searchParams.get('search');
    const district = searchParams.get('district');
    const category = searchParams.get('category');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 50;

    let query = supabase.from('profiles').select('*', { count: 'exact' });

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,mobile_number.ilike.%${search}%,user_id.ilike.%${search}%`
      );
    }
    if (district && district !== 'All') {
      query = query.ilike('district', district);
    }
    if (category && category !== 'All') {
      query = query.ilike('caste_category', category);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: profiles, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Fetch admin users error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve users: ' + error.message },
        { status: 500 }
      );
    }

    const combined = (profiles || []).map((p: any) => ({
      userId: p.user_id,
      fullName: p.full_name,
      mobile: p.mobile_number,
      aadhaarMasked: p.aadhaar_masked,
      email: p.email || '',
      isVerified: Boolean(p.aadhaar_hash),
      createdAt: p.created_at,
      district: p.district || 'Maharashtra',
      category: p.caste_category || 'General/Open',
      occupation: p.occupation || 'Not Specified',
      annualIncomeAmount: p.annual_income_amount || 0,
      educationLevel: p.current_education_level || '',
      isStudent: Boolean(p.student_status),
      hasDisability: Boolean(p.disability_status),
      digiLockerLinked: Boolean(p.digilocker_linked),
      confirmedAccurate: Boolean(p.confirmed_accurate),
    }));

    return NextResponse.json({
      success: true,
      users: combined,
      total: count || combined.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve users: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
