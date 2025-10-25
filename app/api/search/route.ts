import { NextRequest, NextResponse } from 'next/server';
import { searchAnalyses, getAllAnalyses } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    // If no query return all analyses
    if (!query || !query.trim()) {
      const analyses = await getAllAnalyses();
      return NextResponse.json(analyses);
    }

    // Search for analyses matching the query
    const results = await searchAnalyses(query.trim());

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);

    return NextResponse.json(
      {
        error: 'Failed to search analyses',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
