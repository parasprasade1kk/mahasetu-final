import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { User, Profile } from '@/lib/models';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization Bearer token required.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any = null;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session token.' },
        { status: 401 }
      );
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database unavailable.' },
        { status: 503 }
      );
    }

    const user = await User.findOne({ userId: decoded.userId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Citizen account not found.' },
        { status: 404 }
      );
    }

    const profile = await Profile.findOne({ userId: decoded.userId });

    return NextResponse.json({
      success: true,
      user,
      profile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
