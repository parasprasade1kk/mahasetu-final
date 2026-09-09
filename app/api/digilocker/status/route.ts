import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { DigiLockerConnection } from '@/lib/models';

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

    const connection = await DigiLockerConnection.findOne({ userId });

    return NextResponse.json({
      success: true,
      connected: Boolean(connection?.isConnected),
      connection,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve DigiLocker status: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
