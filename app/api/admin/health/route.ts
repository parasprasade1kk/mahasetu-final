import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbConnected = false;
  try {
    const { data, error } = await supabase.from('departments').select('department_id').limit(1);
    dbConnected = !error && Boolean(data);
  } catch {
    dbConnected = false;
  }

  return NextResponse.json({
    service: 'MahaSetu Administrator Management Subsystem',
    runtime: 'Supabase PostgreSQL Cloud Backend',
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    adminAccountConfigured: true,
    timestamp: new Date().toISOString(),
  });
}
