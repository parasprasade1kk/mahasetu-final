import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { AdminUser } from '@/lib/models/AdminUser';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';
const ADMIN_ID = process.env.ADMIN_ID || '1120610';
const rawEnvHash = (process.env.ADMIN_PASSWORD_HASH || '').trim();
const CANONICAL_ADMIN_HASH =
  '$2a$10$ZB4s9wtLu841OUnZwDw/G.bU6Woe.BTNeyarNiH9jj3b25Qdnj11O';
const ADMIN_PASSWORD_HASH =
  rawEnvHash.startsWith('$2') ? rawEnvHash : CANONICAL_ADMIN_HASH;

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

    const { adminId, password } = body || {};

    // 1. Validate fields
    if (!adminId || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both Administrator ID and Password.' },
        { status: 400 }
      );
    }

    const trimmedId = String(adminId).trim();

    // 2. Connect to MongoDB Atlas
    const conn = await connectToDatabase();
    let adminRecord = null;
    let isPasswordValid = false;

    if (conn) {
      adminRecord = await AdminUser.findOne({ adminId: trimmedId });

      if (adminRecord) {
        // 5. Verify isActive
        if (!adminRecord.isActive) {
          return NextResponse.json(
            { success: false, error: 'Access denied. Account is inactive.' },
            { status: 403 }
          );
        }

        // 6. Verify role = admin
        if (adminRecord.role !== 'admin' && (adminRecord.role as any) !== 'superadmin') {
          return NextResponse.json(
            { success: false, error: 'Access denied. Account lacks administrator privileges.' },
            { status: 403 }
          );
        }

        // 4. Verify password using bcrypt
        isPasswordValid = bcrypt.compareSync(password, adminRecord.passwordHash);
      } else if (trimmedId === ADMIN_ID) {
        // Bootstrap admin record in MongoDB on initial setup
        isPasswordValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
        if (isPasswordValid) {
          adminRecord = await AdminUser.findOneAndUpdate(
            { adminId: ADMIN_ID },
            {
              adminId: ADMIN_ID,
              name: 'Shri. S. K. Deshmukh',
              department: 'General Administration Department (GAD), Mantralaya, Mumbai',
              role: 'admin',
              passwordHash: ADMIN_PASSWORD_HASH,
              isActive: true,
              lastLogin: new Date(),
            },
            { upsert: true, new: true }
          );
        }
      }
    } else {
      // Resilient fallback when MongoDB Atlas connection string is awaiting password configuration
      if (trimmedId === ADMIN_ID) {
        isPasswordValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
      }
    }

    // 10. Return 401 for invalid credentials
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid Administrator ID or password.' },
        { status: 401 }
      );
    }

    // Update lastLogin if in database
    if (adminRecord && conn) {
      adminRecord.lastLogin = new Date();
      await adminRecord.save();
    }

    const adminName = adminRecord ? adminRecord.name : 'Shri. S. K. Deshmukh';
    const adminDept = adminRecord
      ? adminRecord.department
      : 'General Administration Department (GAD), Mantralaya, Mumbai';

    // 7. Generate secure JWT token
    const token = jwt.sign(
      {
        adminId: trimmedId,
        role: 'admin',
        name: adminName,
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // 8. Return successful authentication (never expose password/hash)
    return NextResponse.json({
      success: true,
      message: 'Administrator authenticated successfully',
      token,
      admin: {
        adminId: trimmedId,
        role: 'admin',
        name: adminName,
        department: adminDept,
      },
    });
  } catch (err: any) {
    console.error('Vercel Admin Login Serverless Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Administration service is temporarily unavailable. Please try again.',
      },
      { status: 500 }
    );
  }
}
