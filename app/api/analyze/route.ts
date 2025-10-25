import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractMetadata } from '@/lib/gemini';
import { extractKeywords } from '@/lib/keywords';
import { insertAnalysis, initializeDatabase } from '@/lib/db';

// Request body validation schema
const analyzeSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty').max(50000, 'Text is too long'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = analyzeSchema.safeParse(body);

    if (!validation.success) {
      const firstIssueMessage =
        validation.error.issues?.[0]?.message ?? 'Invalid request';
      return NextResponse.json(
        { error: firstIssueMessage },
        { status: 400 }
      );
    }

    const { text } = validation.data;

    // Handle empty input edge case
    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Text cannot be empty or contain only whitespace' },
        { status: 400 }
      );
    }

    // Initialize database (idempotent operation)
    await initializeDatabase();

    // Extract metadata using Gemini API
    const metadata = await extractMetadata(text);

    // Extract keywords (done locally, not via LLM)
    const keywords = extractKeywords(text);

    // Store in database
    const analysis = await insertAnalysis({
      text,
      summary: metadata.summary,
      title: metadata.title,
      topics: metadata.topics,
      sentiment: metadata.sentiment,
      keywords,
    });

    // Return the analysis result
    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in /api/analyze:', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
