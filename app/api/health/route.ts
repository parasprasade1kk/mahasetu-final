import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();
  const dbConnected = isDatabaseConnected();

  return NextResponse.json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    platform: 'MahaSetu Vercel Serverless Architecture',
    state: 'Maharashtra',
    timestamp: new Date().toISOString(),
  });
}
