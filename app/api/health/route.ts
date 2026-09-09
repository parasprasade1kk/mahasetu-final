import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected, getDbDiagnostics } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();
  const dbConnected = isDatabaseConnected();
  const diagnostics = getDbDiagnostics();

  return NextResponse.json(
    {
      status: dbConnected ? 'ok' : 'error',
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'production',
      diagnostics: {
        uriConfigured: diagnostics.uriConfigured,
        placeholderDetected: diagnostics.placeholderDetected,
        placeholderType: diagnostics.placeholderType,
        error: diagnostics.lastError,
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: dbConnected ? 200 : 503,
    }
  );
}
