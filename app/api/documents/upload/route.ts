import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { Document, AuditLog } from '@/lib/models';

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

    const body = await req.json();
    const { documentName, documentType, authorityEn, issueDate } = body || {};

    if (!documentName || !documentType) {
      return NextResponse.json(
        { success: false, error: 'Document name and type are required.' },
        { status: 400 }
      );
    }

    const docId = `DOC-UPL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDoc = await Document.create({
      documentId: docId,
      userId,
      documentType,
      documentName,
      authorityEn: authorityEn || 'Government Authority',
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      source: 'User Upload',
      verificationStatus: 'Citizen Uploaded',
      verified: true,
      uploadedAt: new Date(),
    });

    await AuditLog.create({
      logId: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      actorId: userId,
      actorRole: 'citizen',
      action: 'DOCUMENT_UPLOAD',
      targetResource: 'Document',
      targetId: docId,
      status: 'SUCCESS',
      metadata: { documentName, documentType },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Document uploaded successfully to MongoDB Atlas.',
        document: newDoc,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to upload document: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
