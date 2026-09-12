import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase.from('schemes').select('*').eq('active', true);

    if (department && department !== 'All') {
      query = query.or(`department.eq.${department},department_mr.eq.${department}`);
    }
    if (category && category !== 'All') {
      query = query.or(`category.eq.${category},category_mr.eq.${category}`);
    }
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,name_mr.ilike.%${search}%,department.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data: schemes, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch schemes error:', error.message);
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
      maxAnnualIncome: s.max_annual_income,
      eligibleCategories: s.eligible_categories || [],
      eligibleGenders: s.eligible_genders || [],
      eligibleOccupations: s.eligible_occupations || [],
      requiredDocuments: s.required_documents || [],
      benefitsSummary: s.benefits_summary,
      financialAssistance: s.financial_assistance,
      disbursalMode: s.disbursal_mode,
      portalUrl: s.portal_url,
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
