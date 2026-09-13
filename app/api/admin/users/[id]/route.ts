import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = params.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Citizen ID parameter is required.' },
        { status: 400 }
      );
    }

    // 1. Fetch citizen profile from Supabase
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileErr) {
      console.error('Error fetching citizen profile:', profileErr.message);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve citizen: ' + profileErr.message },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Citizen not found in database.' },
        { status: 404 }
      );
    }

    // 2. Fetch applications, documents, and consents from Supabase
    const [
      { data: applications },
      { data: documents },
      { data: consents },
      { data: auditLogs },
    ] = await Promise.all([
      supabase.from('applications').select('*').eq('user_id', userId).order('submitted_at', { ascending: false }),
      supabase.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('consents').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('audit_logs').select('*').eq('actor_id', userId).order('created_at', { ascending: false }).limit(20),
    ]);

    const formattedUser = {
      userId: profile.user_id,
      fullName: profile.full_name,
      fullNameMr: profile.full_name_mr || profile.full_name,
      mobile: profile.mobile_number,
      aadhaarMasked: profile.aadhaar_masked,
      email: profile.email || '',
      isVerified: Boolean(profile.aadhaar_hash),
      createdAt: profile.created_at,
      district: profile.district || 'Maharashtra',
      taluka: profile.taluka || '',
      villageCity: profile.village_city || profile.village || '',
      category: profile.category || profile.caste_category || 'General/Open',
      religion: profile.religion || '',
      maritalStatus: profile.marital_status || '',
      annualIncomeAmount: profile.annual_income_amount || profile.annual_family_income || 0,
      annualIncomeTier: profile.annual_income_tier || '',
      occupation: profile.occupation || 'Not Specified',
      educationLevel: profile.education_level || profile.current_education_level || '',
      isStudent: Boolean(profile.student_status),
      currentCourse: profile.current_course || '',
      hasDisability: Boolean(profile.disability_status),
      disabilityType: profile.disability_type || '',
      disabilityPercentage: profile.disability_percentage || 0,
      digiLockerLinked: Boolean(profile.digilocker_linked),
      digiLockerId: profile.digilocker_id || '',
      confirmedAccurate: Boolean(profile.confirmed_accurate),
      profileCompleted: Boolean(profile.profile_completed),
    };

    const formattedApplications = (applications || []).map((a: any) => ({
      ...a,
      id: a.application_id,
      applicationId: a.application_id,
      serviceName: a.service_name,
      serviceNameMr: a.service_name_mr,
      department: a.department,
      appliedDate: a.applied_date,
      status: a.status,
      statusColor: a.status_color,
      applicantName: a.applicant_name,
      district: a.district,
      lastUpdated: a.last_updated,
    }));

    const formattedDocuments = (documents || []).map((d: any) => ({
      ...d,
      id: d.document_id,
      documentId: d.document_id,
      documentType: d.document_type,
      documentName: d.document_name,
      documentNameMr: d.document_name_mr,
      source: d.source,
      verificationStatus: d.verification_status,
      uploadedAt: d.created_at,
    }));

    const formattedConsents = (consents || []).map((c: any) => ({
      ...c,
      id: c.consent_id,
      consentId: c.consent_id,
      requestingDept: c.requesting_dept,
      sourceDept: c.source_dept,
      purpose: c.purpose,
      dataFields: c.data_fields,
      status: c.status,
      validUntil: c.valid_until,
    }));

    return NextResponse.json({
      success: true,
      user: formattedUser,
      profile: formattedUser,
      applications: formattedApplications,
      documents: formattedDocuments,
      consents: formattedConsents,
      activity: auditLogs || [],
    });
  } catch (err: any) {
    console.error('Admin user detail route error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (err?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
