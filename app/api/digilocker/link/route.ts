import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { DigiLockerConnection, Profile, AuditLog } from '@/lib/models';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function POST(req: NextRequest) {
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

    const digiLockerId = `DL-MH-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const connection = await DigiLockerConnection.findOneAndUpdate(
      { userId },
      {
        userId,
        isConnected: true,
        linkedAt: new Date(),
        digiLockerId,
        consentGiven: true,
      },
      { upsert: true, new: true }
    );

    await Profile.findOneAndUpdate(
      { userId },
      {
        digiLockerLinked: true,
        digiLockerId,
        digiLockerLinkedAt: new Date(),
      }
    );

    await AuditLog.create({
      logId: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      actorId: userId,
      actorRole: 'citizen',
      action: 'DIGILOCKER_LINKED',
      targetResource: 'DigiLockerConnection',
      targetId: userId,
      status: 'SUCCESS',
      metadata: { digiLockerId },
    });

    return NextResponse.json({
      success: true,
      message: 'DigiLocker successfully connected and stored in MongoDB Atlas.',
      connection,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to link DigiLocker: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
