import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabaseClient';

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

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const actorRole = searchParams.get('actorRole');
    const limit = Number(searchParams.get('limit')) || 100;

    let query = supabase.from('audit_logs').select('*');

    if (action && action !== 'All') {
      query = query.eq('action', action);
    }
    if (actorRole && actorRole !== 'All') {
      query = query.eq('actor_role', actorRole);
    }

    const { data: logs, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Fetch audit logs error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve audit trail: ' + error.message },
        { status: 500 }
      );
    }

    const mapped = (logs || []).map((l: any) => ({
      _id: l.id,
      id: l.log_id || l.id,
      logId: l.log_id || l.id,
      actorId: l.actor_id,
      actorRole: l.actor_role,
      action: l.action,
      targetResource: l.target_resource,
      targetId: l.target_id,
      metadata: l.metadata,
      status: l.status || 'SUCCESS',
      timestamp: l.created_at,
    }));

    return NextResponse.json({
      success: true,
      logs: mapped,
      total: mapped.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve audit trail: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
