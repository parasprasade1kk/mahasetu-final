import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEMO_OTP = process.env.DEMO_OTP || '123456';

function normalizeMobile(m: string): string {
  const digits = String(m || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const { mobile } = body || {};
    const cleanMobile = normalizeMobile(mobile);

    if (!cleanMobile || cleanMobile.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      demoOtp: DEMO_OTP,
      message: `OTP sent successfully. Demo OTP: ${DEMO_OTP}`,
      isDemo: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Error dispatching OTP: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
