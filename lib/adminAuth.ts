import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabaseClient';

export const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export interface VerifiedAdmin {
  adminId: string;
  name: string;
  role: string;
  department?: string;
  authUserId?: string;
}

export interface AdminAuthResult {
  authorized: boolean;
  admin?: VerifiedAdmin;
  error?: string;
  status?: number;
}

/**
 * Verifies an incoming Next.js API request for Administrator authorization.
 * Supports:
 * 1. Supabase Auth session access_token (Primary)
 * 2. Legacy/Internal JWT token signed with JWT_SECRET (Backward Compatibility)
 * 
 * Verifies both authentication AND administrator role in the Supabase admin_users table.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      error: 'Administrator authentication required.',
      status: 401,
    };
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    return {
      authorized: false,
      error: 'Invalid session token.',
      status: 401,
    };
  }

  return verifyAdminToken(token);
}

/**
 * Validates a token string as a legitimate administrator session.
 */
export async function verifyAdminToken(token: string): Promise<AdminAuthResult> {
  if (!token) {
    return {
      authorized: false,
      error: 'Invalid session token.',
      status: 401,
    };
  }

  // 1. Primary: Verify token against Supabase Auth
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (!userError && userData?.user) {
      const user = userData.user;
      const adminIdMeta = user.user_metadata?.admin_id;
      const email = user.email || '';

      // Check whether user matches an active record in public.admin_users
      let adminRow: any = null;

      // Check by auth_user_id or admin_id metadata
      const { data: row } = await supabase
        .from('admin_users')
        .select('*')
        .or(`auth_user_id.eq.${user.id},admin_id.eq.${adminIdMeta || 'NONE'}`)
        .eq('active', true)
        .maybeSingle();

      if (row) {
        adminRow = row;
      } else if (email.startsWith('admin.') && email.endsWith('@admin.mahasetu.gov.in')) {
        // Fallback: extract adminId from email (e.g., admin.1120610@admin.mahasetu.gov.in)
        const parts = email.split('@')[0].split('.');
        const extractedId = parts[1];
        if (extractedId) {
          const { data: byExtracted } = await supabase
            .from('admin_users')
            .select('*')
            .eq('admin_id', extractedId)
            .eq('active', true)
            .maybeSingle();
          if (byExtracted) adminRow = byExtracted;
        }
      }

      if (adminRow && (adminRow.role === 'admin' || adminRow.role === 'superadmin')) {
        return {
          authorized: true,
          admin: {
            adminId: adminRow.admin_id,
            name: adminRow.name,
            role: adminRow.role,
            department:
              adminRow.department ||
              'General Administration Department (GAD), Mantralaya, Mumbai',
            authUserId: user.id,
          },
        };
      }

      // If user exists in Supabase Auth (e.g., a citizen account) but is not in admin_users
      return {
        authorized: false,
        error: 'Access denied. Administrator privileges required.',
        status: 403,
      };
    }
  } catch (err: any) {
    console.warn('[AdminAuth] Supabase getUser check note:', err?.message);
  }

  // 2. Fallback: Verify legacy/internal JWT token
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded && (decoded.role === 'admin' || decoded.role === 'superadmin')) {
      return {
        authorized: true,
        admin: {
          adminId: decoded.adminId || '1120610',
          name: decoded.name || 'Shri. S. K. Deshmukh',
          role: decoded.role || 'admin',
          department:
            decoded.department ||
            'General Administration Department (GAD), Mantralaya, Mumbai',
        },
      };
    }

    return {
      authorized: false,
      error: 'Access denied. Administrator privileges required.',
      status: 403,
    };
  } catch {
    return {
      authorized: false,
      error: 'Administrator session expired. Please log in again.',
      status: 401,
    };
  }
}
