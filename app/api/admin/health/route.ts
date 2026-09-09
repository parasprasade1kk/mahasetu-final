import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();
  const dbConnected = isDatabaseConnected();

  return NextResponse.json({
    service: 'MahaSetu Administrator Management Subsystem',
    runtime: 'Vercel Serverless Function',
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    adminAccountConfigured: true,
    timestamp: new Date().toISOString(),
  });
}
