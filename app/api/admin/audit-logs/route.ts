import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Administrator authentication required.' },
        { status: authResult.status || 401 }
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
