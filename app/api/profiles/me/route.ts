import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabaseClient';
import { findCitizenByUserId, createAuditLog } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Citizen authentication required.' },
        { status: 401 }
      );
    }

    let userId = '';
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.userId) {
        userId = decoded.userId;
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired session token.' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing authenticated userId.' },
        { status: 401 }
      );
    }

    const profile = await findCitizenByUserId(userId);
    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve profile: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Citizen authentication required.' },
        { status: 401 }
      );
    }

    let userId = '';
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.userId) {
        userId = decoded.userId;
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired session token.' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing authenticated userId.' },
        { status: 401 }
      );
    }

    const currentProfile = await findCitizenByUserId(userId);
    if (!currentProfile) {
      return NextResponse.json(
        { success: false, error: 'Citizen account not found.' },
        { status: 404 }
      );
    }

    const body = await req.json();

    const updateFields: any = {
      full_name: body.fullName || body.full_name || currentProfile.full_name,
      full_name_mr: body.fullNameMr || body.full_name_mr || currentProfile.full_name_mr,
      date_of_birth: body.dateOfBirth || body.date_of_birth || currentProfile.date_of_birth,
      gender: body.gender || currentProfile.gender,
      annual_income: body.annualIncome || body.annual_income || currentProfile.annual_income,
      annual_income_amount: body.annualIncomeAmount || body.annual_income_amount || currentProfile.annual_income_amount,
      district: body.district || currentProfile.district,
      taluka: body.taluka || currentProfile.taluka,
      village: body.village || currentProfile.village,
      address: body.address || currentProfile.address,
      pin_code: body.pinCode || body.pin_code || currentProfile.pin_code,
      caste_category: body.casteCategory || body.caste_category || currentProfile.caste_category,
      caste: body.caste || currentProfile.caste,
      sub_caste: body.subCaste || body.sub_caste || currentProfile.sub_caste,
      occupation: body.occupation || currentProfile.occupation,
      disability_status: body.disabilityStatus !== undefined ? body.disabilityStatus : currentProfile.disability_status,
      ration_card_type: body.rationCardType || body.ration_card_type || currentProfile.ration_card_type,
      farmer_category: body.farmerCategory || body.farmer_category || currentProfile.farmer_category,
      land_holding_acres: body.landHoldingAcres !== undefined ? body.landHoldingAcres : currentProfile.land_holding_acres,
      student_status: body.studentStatus !== undefined ? body.studentStatus : currentProfile.student_status,
      current_education_level: body.currentEducationLevel || body.current_education_level || currentProfile.current_education_level,
      confirmed_accurate: true,
      profile_completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updateFields)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Failed to update profile: ' + error.message },
        { status: 500 }
      );
    }

    await createAuditLog({
      actorId: userId,
      actorRole: 'citizen',
      action: 'UPDATE_PROFILE',
      targetResource: 'Profile',
      targetId: userId,
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully in Supabase.',
      profile: updatedProfile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update profile: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
