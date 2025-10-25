import { Pool } from 'pg';

// Create a singleton pool instance
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL;

    if (!connectionString) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
  }

  return pool;
}

export interface Analysis {
  id: string;
  text: string;
  summary: string;
  title: string | null;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  created_at: Date;
}

export interface NewAnalysis {
  text: string;
  summary: string;
  title: string | null;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}


export async function insertAnalysis(analysis: NewAnalysis): Promise<Analysis> {
  const pool = getPool();

  const result = await pool.query(
    `INSERT INTO analyses (text, summary, title, topics, sentiment, keywords)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      analysis.text,
      analysis.summary,
      analysis.title,
      analysis.topics,
      analysis.sentiment,
      analysis.keywords,
    ]
  );

  return result.rows[0];
}


// Search analyses by topic or keyword
export async function searchAnalyses(query: string): Promise<Analysis[]> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT * FROM analyses
     WHERE
       $1 = ANY(topics) OR
       $1 = ANY(keywords) OR
       title ILIKE $2 OR
       summary ILIKE $2
     ORDER BY created_at DESC
     LIMIT 50`,
    [query, `%${query}%`]
  );

  return result.rows;
}

export async function getAllAnalyses(limit = 50): Promise<Analysis[]> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT * FROM analyses
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
}

// Initialize the database schema
export async function initializeDatabase(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS analyses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      text TEXT NOT NULL,
      summary TEXT NOT NULL,
      title TEXT,
      topics TEXT[] NOT NULL,
      sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
      keywords TEXT[] NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_analyses_topics ON analyses USING GIN (topics);
    CREATE INDEX IF NOT EXISTS idx_analyses_keywords ON analyses USING GIN (keywords);
    CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses (created_at DESC);
  `);
}
