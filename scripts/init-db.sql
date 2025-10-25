-- Create the analyses table
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analyses_topics ON analyses USING GIN (topics);
CREATE INDEX IF NOT EXISTS idx_analyses_keywords ON analyses USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses (created_at DESC);

-- Verify table creation
SELECT 'Database initialized successfully!' AS status;
