import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { registerCitizen, normalizeMobile } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';
const DEMO_OTP = process.env.DEMO_OTP || '123456';

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

    const { fullName, mobile, aadhaar, consent, otp } = body || {};

    if (!fullName || String(fullName).trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide your full legal name (at least 2 characters).' },
        { status: 400 }
      );
    }

    const cleanMobile = normalizeMobile(mobile);
    if (!cleanMobile || cleanMobile.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    if (!aadhaar || String(aadhaar).trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Aadhaar Number is required.' },
        { status: 400 }
      );
    }

    const cleanAadhaar = String(aadhaar).replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 12-digit Aadhaar Number.' },
        { status: 400 }
      );
    }

    if (consent !== true && consent !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Please provide Aadhaar consent to continue.' },
        { status: 400 }
      );
    }

    if (!otp || String(otp).trim() !== DEMO_OTP) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please enter the authorized demo OTP: 123456.' },
        { status: 400 }
      );
    }

    const newProfile = await registerCitizen({
      fullName,
      mobile,
      aadhaar,
      consent,
    });

    const userObj = {
      userId: newProfile.user_id,
      fullName: newProfile.full_name,
      fullNameMr: newProfile.full_name_mr || newProfile.full_name,
      mobile: newProfile.mobile_number,
      email: newProfile.email,
      aadhaarMasked: newProfile.aadhaar_masked,
      role: 'citizen',
      createdAt: newProfile.created_at,
    };

    const token = jwt.sign(
      { userId: newProfile.user_id, mobile: newProfile.mobile_number, role: 'citizen' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Citizen account created successfully in Supabase.',
        token,
        user: userObj,
        profile: newProfile,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Supabase Citizen Registration Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Registration failed' },
      { status: err.status || 500 }
    );
  }
}
