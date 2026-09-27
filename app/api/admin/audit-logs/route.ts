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
    const search = searchParams.get('search');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 100;

    let query = supabase.from('audit_logs').select('*', { count: 'exact' });

    if (action && action !== 'All') {
      query = query.eq('action', action);
    }
    if (actorRole && actorRole !== 'All') {
      query = query.eq('actor_role', actorRole);
    }
    if (search) {
      query = query.or(`action.ilike.%${search}%,actor_id.ilike.%${search}%,target_resource.ilike.%${search}%,target_id.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: logs, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Fetch audit logs error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve audit trail: ' + error.message },
        { status: 500 }
      );
    }

    // Resolve actor names from profiles and admin_users
    const actorIds = Array.from(new Set((logs || []).map((l: any) => l.actor_id).filter(Boolean)));
    const profilesMap = new Map<string, any>();
    const adminsMap = new Map<string, any>();

    if (actorIds.length > 0) {
      const [{ data: matchedProfiles }, { data: matchedAdmins }] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name, mobile_number, district').in('user_id', actorIds),
        supabase.from('admin_users').select('admin_id, name').in('admin_id', actorIds),
      ]);
      (matchedProfiles || []).forEach((p: any) => profilesMap.set(p.user_id, p));
      (matchedAdmins || []).forEach((a: any) => adminsMap.set(a.admin_id, a));
    }

    const mapped = (logs || []).map((l: any) => {
      const profile = profilesMap.get(l.actor_id);
      const adminUser = adminsMap.get(l.actor_id);

      let actorName = l.metadata?.applicantName || l.metadata?.fullName;
      if (!actorName) {
        if (profile) {
          actorName = profile.full_name;
        } else if (adminUser) {
          actorName = adminUser.name;
        } else if (l.actor_role === 'admin') {
          actorName = `Administrator (${l.actor_id})`;
        } else {
          actorName = l.actor_id;
        }
      }

      // Sanitize metadata to never leak passwords, tokens, or OTPs
      const safeMetadata = { ...(l.metadata || {}) };
      delete safeMetadata.password;
      delete safeMetadata.password_hash;
      delete safeMetadata.token;
      delete safeMetadata.accessToken;
      delete safeMetadata.refreshToken;
      delete safeMetadata.otp;
      delete safeMetadata.secret;

      return {
        _id: l.id,
        id: l.log_id || l.id,
        logId: l.log_id || l.id,
        actorId: l.actor_id,
        actorName,
        actorRole: l.actor_role,
        action: l.action,
        targetResource: l.target_resource,
        targetId: l.target_id,
        metadata: safeMetadata,
        status: l.status || 'SUCCESS',
        timestamp: l.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      logs: mapped,
      total: count !== null && count !== undefined ? count : mapped.length,
      page,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve audit trail: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
