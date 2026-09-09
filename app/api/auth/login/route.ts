import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { User, Profile, AuditLog } from '@/lib/models';
import { ensureDatabaseSeeded } from '@/lib/dbSeed';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';
const DEMO_OTP = process.env.DEMO_OTP || '123456';

function normalizeMobile(m: string): string {
  const digits = String(m || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

function maskAadhaar(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const last4 = digits.length >= 4 ? digits.slice(-4) : '0000';
  return `XXXX XXXX ${last4}`;
}

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

    // Connect to MongoDB Atlas
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database connection is currently unavailable.' },
        { status: 503 }
      );
    }

    await ensureDatabaseSeeded();

    // Look up existing user in MongoDB
    const user = await User.findOne({ mobile: cleanMobile });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No account found for this mobile number. Please create a new account.',
        },
        { status: 404 }
      );
    }

    // Update lastLoginAt without creating a duplicate record
    user.lastLoginAt = new Date();
    if (aadhaar && String(aadhaar).replace(/\D/g, '').length === 12) {
      user.aadhaarMasked = maskAadhaar(aadhaar);
    }
    await user.save();

    const profile = await Profile.findOne({ userId: user.userId });

    // Audit log
    await AuditLog.create({
      logId: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      actorId: user.userId,
      actorRole: 'citizen',
      action: 'CITIZEN_LOGIN',
      targetResource: 'User',
      targetId: user.userId,
      status: 'SUCCESS',
      metadata: { mobile: user.mobile },
    });

    const token = jwt.sign(
      { userId: user.userId, mobile: user.mobile, role: 'citizen' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Citizen authenticated successfully.',
      token,
      user,
      profile,
    });
  } catch (err: any) {
    console.error('Vercel Citizen Login Error:', err);
    return NextResponse.json(
      { success: false, error: 'Citizen login failed: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
