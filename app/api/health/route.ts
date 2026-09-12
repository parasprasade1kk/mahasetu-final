import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await supabase.from('departments').select('count', { count: 'exact', head: true });
  const isConnected = !error;

  return NextResponse.json(
    {
      status: isConnected ? 'ok' : 'degraded',
      database: isConnected ? 'connected' : 'disconnected',
      provider: 'Supabase PostgreSQL',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString(),
    },
    {
      status: isConnected ? 200 : 503,
    }
  );
}
