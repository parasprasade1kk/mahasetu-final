import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { Profile, User, AuditLog } from '@/lib/models';

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

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable.' },
        { status: 503 }
      );
    }

    const profile = await Profile.findOne({ userId });
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

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable.' },
        { status: 503 }
      );
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Citizen account not found.' },
        { status: 404 }
      );
    }

    const data = await req.json();

    // Preserve canonical masked Aadhaar from user account — prevent replacement
    const canonicalAadhaar = user.aadhaarMasked;

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      {
        ...data,
        aadhaarMasked: canonicalAadhaar,
        confirmedAccurate: true,
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Also update User profileCompleted flag
    await User.findOneAndUpdate(
      { userId },
      { profileCompleted: true }
    );

    await AuditLog.create({
      logId: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      actorId: userId,
      actorRole: 'citizen',
      action: 'UPDATE_PROFILE',
      targetResource: 'Profile',
      targetId: userId,
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully in MongoDB Atlas.',
      profile: updatedProfile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update profile: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
