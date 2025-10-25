import { NextRequest, NextResponse } from 'next/server';
import { getAllAnalyses } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 100.' },
        { status: 400 }
      );
    }

    const analyses = await getAllAnalyses(limit);

    return NextResponse.json(analyses);
  } catch (error) {
    console.error('Error fetching analyses:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch analyses',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
