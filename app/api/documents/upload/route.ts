import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabaseClient';
import { createAuditLog } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function POST(req: NextRequest) {
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
        { success: false, error: 'Unauthorized: Invalid session token.' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing authenticated userId.' },
        { status: 401 }
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

    const newDoc = {
      document_id: docId,
      user_id: userId,
      document_type: documentType,
      document_name: documentName,
      document_name_mr: body.documentNameMr || documentName,
      authority_en: authorityEn || 'Government Authority',
      issued_date: issueDate || new Date().toISOString().split('T')[0],
      source: 'User Upload',
      verification_status: 'Citizen Uploaded',
      file_name: `${documentName.replace(/\s+/g, '_').toLowerCase()}.pdf`,
      file_size: '256 KB',
      mime_type: 'application/pdf',
    };

    const { data: insertedDoc, error } = await supabase
      .from('documents')
      .insert(newDoc)
      .select()
      .single();

    if (error) {
      console.error('Insert document error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Failed to insert document: ' + error.message },
        { status: 500 }
      );
    }

    await createAuditLog({
      actorId: userId,
      actorRole: 'citizen',
      action: 'DOCUMENT_UPLOAD',
      targetResource: 'Document',
      targetId: docId,
      status: 'SUCCESS',
      metadata: { documentName, documentType },
    });

    const mapped = {
      ...insertedDoc,
      id: insertedDoc.document_id,
      documentId: insertedDoc.document_id,
      documentType: insertedDoc.document_type,
      documentName: insertedDoc.document_name,
      documentNameMr: insertedDoc.document_name_mr,
      authorityEn: insertedDoc.authority_en,
      issueDate: insertedDoc.issued_date,
      source: insertedDoc.source,
      verificationStatus: insertedDoc.verification_status,
      verified: true,
      uploadedAt: insertedDoc.created_at,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Document uploaded successfully to Supabase.',
        document: mapped,
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
