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

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const { title, titleMr, message, messageMr, type = 'info', targetUserId } = body || {};

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Notification title and message are required.' },
        { status: 400 }
      );
    }

    let recipientUserIds: string[] = [];

    if (targetUserId) {
      recipientUserIds = [targetUserId.trim()];
    } else {
      // Broadcast to all registered citizens
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('user_id');

      if (profErr) {
        throw new Error('Failed to retrieve citizen recipients: ' + profErr.message);
      }
      recipientUserIds = (profiles || []).map((p: any) => p.user_id);
    }

    if (recipientUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'No registered citizens found for dispatch.',
      });
    }

    const notifRecords = recipientUserIds.map((uId: string) => ({
      notification_id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      user_id: uId,
      title,
      title_mr: titleMr || title,
      message,
      message_mr: messageMr || message,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    const { error: insertErr } = await supabase
      .from('notifications')
      .insert(notifRecords);

    if (insertErr) {
      throw new Error('Failed to save notification records: ' + insertErr.message);
    }

    await createAuditLog({
      actorId: decoded.adminId || '1120610',
      actorRole: 'admin',
      action: 'NOTIFICATION_BROADCAST',
      targetResource: 'Notifications',
      targetId: `Count-${recipientUserIds.length}`,
      metadata: { title, type, recipientCount: recipientUserIds.length },
    });

    return NextResponse.json({
      success: true,
      count: recipientUserIds.length,
      message: `Notification successfully dispatched to ${recipientUserIds.length} citizen(s).`,
    });
  } catch (err: any) {
    console.error('Notification dispatch error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Notification broadcast failed.' },
      { status: 500 }
    );
  }
}
