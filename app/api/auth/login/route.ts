import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { authenticateCitizen, normalizeMobile } from '@/lib/supabaseService';

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

    const { mobile, aadhaar, otp } = body || {};
    const cleanMobile = normalizeMobile(mobile);

    if (!cleanMobile || cleanMobile.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit registered mobile number.' },
        { status: 400 }
      );
    }

    // Strictly validate demo OTP
    if (!otp || String(otp).trim() !== DEMO_OTP) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please enter the authorized demo OTP: 123456.' },
        { status: 400 }
      );
    }

    const citizen = await authenticateCitizen({ mobile: cleanMobile, aadhaar });

    const userObj = {
      userId: citizen.user_id,
      fullName: citizen.full_name,
      fullNameMr: citizen.full_name_mr || citizen.full_name,
      mobile: citizen.mobile_number,
      email: citizen.email,
      aadhaarMasked: citizen.aadhaar_masked,
      role: 'citizen',
      createdAt: citizen.created_at,
      aadhaarLinked: Boolean(citizen.aadhaar_hash || (citizen.aadhaar_masked && !citizen.aadhaar_masked.endsWith('0000'))),
    };

    const token = jwt.sign(
      { userId: citizen.user_id, mobile: citizen.mobile_number, role: 'citizen' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Citizen authenticated successfully.',
      token,
      user: userObj,
      profile: citizen,
    });
  } catch (err: any) {
    console.error('Supabase Citizen Login Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Citizen login failed' },
      { status: err.status || 500 }
    );
  }
}
