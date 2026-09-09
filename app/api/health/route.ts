import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();
  const dbConnected = isDatabaseConnected();

  return NextResponse.json(
    {
      status: dbConnected ? 'ok' : 'error',
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString(),
    },
    {
      status: dbConnected ? 200 : 503,
    }
  );
}
