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
      query = query.or(`category.ilike.%${category}%,caste_category.ilike.%${category}%`);
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

    const combined = (profiles || []).map((p: any) => {
      const isVerified = Boolean(p.aadhaar_hash && p.aadhaar_hash.trim() !== '');
      const cleanMobile = p.mobile_number ? String(p.mobile_number).replace(/\D/g, '') : '';
      const mobileMasked = cleanMobile.length >= 4 ? `******${cleanMobile.slice(-4)}` : '******0000';

      return {
        userId: p.user_id,
        fullName: p.full_name,
        mobile: p.mobile_number,
        mobileMasked,
        aadhaarMasked: p.aadhaar_masked || (isVerified ? 'XXXX XXXX ****' : 'Not Linked'),
        email: p.email || '',
        isVerified,
        verificationStatus: isVerified ? 'Verified' : 'Unverified',
        accountStatus: 'Active',
        createdAt: p.created_at,
        district: p.district || 'Maharashtra',
        category: p.category || p.caste_category || 'General/Open',
        occupation: p.occupation || 'Not Specified',
        annualIncomeAmount: Number(p.annual_family_income || p.annual_income_amount || 0),
        educationLevel: p.education_level || p.current_education_level || '',
        isStudent: Boolean(p.student_status),
        hasDisability: Boolean(p.disability_status),
        digiLockerLinked: Boolean(p.digilocker_linked),
        confirmedAccurate: Boolean(p.confirmed_accurate),
      };
    });

    return NextResponse.json({
      success: true,
      users: combined,
      total: count !== null && count !== undefined ? count : combined.length,
      page,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve users: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
