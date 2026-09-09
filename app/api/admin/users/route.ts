import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { User, Profile } from '@/lib/models';
import { ensureDatabaseSeeded } from '@/lib/dbSeed';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function GET(req: NextRequest) {
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

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable.' },
        { status: 503 }
      );
    }

    await ensureDatabaseSeeded();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const district = searchParams.get('district');
    const category = searchParams.get('category');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 50;

    const userFilter: any = { role: 'citizen' };
    if (search) {
      userFilter.$or = [
        { fullName: new RegExp(search, 'i') },
        { mobile: new RegExp(search, 'i') },
        { userId: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(userFilter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const userIds = users.map((u) => u.userId);
    const profiles = await Profile.find({ userId: { $in: userIds } }).lean();
    const profileMap = Object.fromEntries(profiles.map((p) => [p.userId, p]));

    let combined = users.map((u) => {
      const p = profileMap[u.userId] || {};
      return {
        userId: u.userId,
        fullName: u.fullName,
        mobile: u.mobile,
        aadhaarMasked: u.aadhaarMasked,
        email: u.email || '',
        isVerified: u.isVerified,
        createdAt: u.createdAt,
        district: p.district || 'Maharashtra',
        category: p.category || 'General/Open',
        occupation: p.occupation || 'Not Specified',
        annualIncomeAmount: p.annualIncomeAmount || 0,
        educationLevel: p.educationLevel || '',
        isStudent: Boolean(p.isStudent),
        hasDisability: Boolean(p.hasDisability),
        digiLockerLinked: Boolean(p.digiLockerLinked),
        confirmedAccurate: Boolean(p.confirmedAccurate),
      };
    });

    if (district && district !== 'All') {
      combined = combined.filter((u) => u.district.toLowerCase() === district.toLowerCase());
    }
    if (category && category !== 'All') {
      combined = combined.filter((u) => u.category.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      users: combined,
      total: combined.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve users: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
