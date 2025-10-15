import { NextResponse } from 'next/server';
import { getAvailableFunds } from '@/lib/dataLoader';

export async function GET() {
  try {
    const funds = await getAvailableFunds();
    return NextResponse.json({ funds });
  } catch (error) {
    console.error('Error in /api/funds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funds' },
      { status: 500 }
    );
  }
}
