import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { Consent } from '@/lib/models';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let userId = 'MH-CIT-001';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.userId) {
          userId = decoded.userId;
        }
      } catch {}
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable.' },
        { status: 503 }
      );
    }

    const consents = await Consent.find({ userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      consents,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve consents: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
