import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { User, Profile, Consent, AuditLog } from '@/lib/models';
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

function maskAadhaar(raw?: string, cleanMobile: string = '0000'): string {
  if (!raw) return `XXXX XXXX ${cleanMobile.slice(-4)}`;
  const digits = String(raw).replace(/\D/g, '');
  const last4 = digits.length >= 4 ? digits.slice(-4) : cleanMobile.slice(-4);
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

    const { fullName, mobile, aadhaar, otp } = body || {};

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

    // Verify Demo OTP
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

    // Check if citizen already exists in MongoDB
    let existingUser = await User.findOne({ mobile: cleanMobile });
    if (existingUser) {
      const token = jwt.sign(
        { userId: existingUser.userId, mobile: existingUser.mobile, role: 'citizen' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const profile = await Profile.findOne({ userId: existingUser.userId });

      return NextResponse.json({
        success: true,
        message: 'Existing citizen account verified.',
        token,
        user: existingUser,
        profile,
      });
    }

    // Generate unique citizen ID
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const userId = `MH-CIT-${ts}-${rand}`;
    const masked = maskAadhaar(aadhaar, cleanMobile);

    // Create real User document in MongoDB
    const newUser = await User.create({
      userId,
      fullName: String(fullName).trim(),
      mobile: cleanMobile,
      aadhaarMasked: masked,
      email: `citizen.${cleanMobile}@mahasetu.gov.in`,
      role: 'citizen',
      isVerified: true,
      profileCompleted: false,
    });

    // Create initial profile record
    const newProfile = await Profile.create({
      userId,
      fullName: String(fullName).trim(),
      mobile: cleanMobile,
      aadhaarMasked: masked,
      confirmedAccurate: false,
    });

    // Brand-new citizen starts with zero consents, applications, or documents in MongoDB.

    // Create audit log
    await AuditLog.create({
      logId: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      actorId: userId,
      actorRole: 'citizen',
      action: 'CITIZEN_REGISTRATION',
      targetResource: 'User',
      targetId: userId,
      status: 'SUCCESS',
      metadata: { fullName: newUser.fullName, mobile: newUser.mobile },
    });

    const token = jwt.sign(
      { userId: newUser.userId, mobile: newUser.mobile, role: 'citizen' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Citizen account created successfully in MongoDB Atlas.',
        token,
        user: newUser,
        profile: newProfile,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Vercel Citizen Registration Error:', err);
    return NextResponse.json(
      { success: false, error: 'Registration failed: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
