'use client';

import { useState, useEffect } from 'react';

interface Analysis {
  id: string;
  text: string;
  summary: string;
  title: string | null;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  created_at: string;
}

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [pastAnalyses, setPastAnalyses] = useState<Analysis[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load past analyses on mount
  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        const response = await fetch('/api/analyses');
        if (response.ok) {
          const data = await response.json();
          setPastAnalyses(data);
        }
      } catch (err) {
        console.error('Failed to load past analyses:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadAnalyses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const analysis = await response.json();
      setCurrentAnalysis(analysis);
      setPastAnalyses([analysis, ...pastAnalyses]);
      setInputText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    setSearchLoading(true);
    try {
      const url = query.trim()
        ? `/api/search?query=${encodeURIComponent(query)}`
        : '/api/analyses';

      const response = await fetch(url);
      if (response.ok) {
        const results = await response.json();
        setPastAnalyses(results);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            LLM Knowledge Extractor
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Extract insights, summaries, and structured metadata from text using AI
          </p>
        </div>

        {/* Input Form */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
          <form onSubmit={handleSubmit}>
            <label htmlFor="text-input" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Enter your text
            </label>
            <textarea
              id="text-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              placeholder="Paste an article, blog post, or any text to analyze..."
              rows={8}
              disabled={loading}
            />

            {error && (
              <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="mt-4 rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? 'Analyzing...' : 'Analyze Text'}
            </button>
          </form>
        </div>

        {/* Current Analysis Result */}
        {currentAnalysis && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Analysis Result
            </h2>

            {currentAnalysis.title && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {currentAnalysis.title}
                </h3>
              </div>
            )}

            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Summary</h4>
              <p className="text-zinc-600 dark:text-zinc-400">{currentAnalysis.summary}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis.topics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Sentiment</h4>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getSentimentColor(currentAnalysis.sentiment)}`}>
                  {currentAnalysis.sentiment}
                </span>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <label htmlFor="search" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Search past analyses
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by topic or keyword..."
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
        </div>

        {/* Past Analyses */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Past Analyses {searchLoading && '(Searching...)'}
          </h2>

          {initialLoading ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400">Loading analyses...</p>
            </div>
          ) : pastAnalyses.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400">
                No analyses yet. Submit some text to get started!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pastAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900"
                >
                  {analysis.title && (
                    <h3 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
                      {analysis.title}
                    </h3>
                  )}
                  <p className="mb-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {analysis.summary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.topics.slice(0, 2).map((topic, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {topic}
                      </span>
                    ))}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${getSentimentColor(analysis.sentiment)}`}>
                      {analysis.sentiment}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
