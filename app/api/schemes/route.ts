import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Scheme } from '@/lib/models';
import { ensureDatabaseSeeded } from '@/lib/dbSeed';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable.' },
        { status: 503 }
      );
    }

    await ensureDatabaseSeeded();

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const filter: any = { active: true };
    if (department && department !== 'All') filter.department = department;
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { department: new RegExp(search, 'i') },
        { keywords: new RegExp(search, 'i') },
      ];
    }

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      schemes,
      total: schemes.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve schemes: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
