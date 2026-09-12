import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { findCitizenByUserId } from '@/lib/supabaseService';

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

    const citizen = await findCitizenByUserId(decoded.userId);
    if (!citizen) {
      return NextResponse.json(
        { success: false, error: 'Citizen account not found.' },
        { status: 404 }
      );
    }

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

    return NextResponse.json({
      success: true,
      user: userObj,
      profile: citizen,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
