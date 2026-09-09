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

    // Canonical Aadhaar handling:
    // If the user does not yet have an Aadhaar hash (e.g. existing user migration)
    if (!user.aadhaarHash && aadhaar) {
      const cleanAadhaar = String(aadhaar).replace(/\D/g, '');
      if (cleanAadhaar.length === 12) {
        const crypto = await import('crypto');
        const hash = crypto.createHash('sha256').update(cleanAadhaar).digest('hex');

        // Verify this Aadhaar does not belong to another account
        const existingAadhaarOwner = await User.findOne({
          aadhaarHash: hash,
          userId: { $ne: user.userId },
        });

        if (!existingAadhaarOwner) {
          user.aadhaarHash = hash;
          user.aadhaarMasked = maskAadhaar(cleanAadhaar);
          user.aadhaarConsentGiven = true;
          user.aadhaarConsentAt = new Date();

          await Profile.updateOne(
            { userId: user.userId },
            { $set: { aadhaarMasked: user.aadhaarMasked } }
          );
        }
      }
    }

    await user.save();

    const profile = await Profile.findOne({ userId: user.userId });

    // Audit log (never exposing raw Aadhaar)
    await AuditLog.create({
      logId: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      actorId: user.userId,
      actorRole: 'citizen',
      action: 'CITIZEN_LOGIN',
      targetResource: 'User',
      targetId: user.userId,
      status: 'SUCCESS',
      metadata: { mobile: user.mobile, aadhaarMasked: user.aadhaarMasked },
    });

    const token = jwt.sign(
      { userId: user.userId, mobile: user.mobile, role: 'citizen' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Sanitize user object for client: never expose raw aadhaar or hash
    const userObj: any = user.toObject ? user.toObject() : { ...user };
    delete userObj.aadhaarHash;
    userObj.aadhaarLinked = !!(user.aadhaarHash || (user.aadhaarMasked && !user.aadhaarMasked.endsWith('0000')));

    return NextResponse.json({
      success: true,
      message: 'Citizen authenticated successfully.',
      token,
      user: userObj,
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
