# LLM Knowledge Extractor

A simple Next.js app that takes text and uses AI to extract a summary, topics, sentiment, and keywords, then stores everything in PostgreSQL so you can search through past analyses.

## Quick Start

**1. Install dependencies:** `npm install`

**2. Set up your environment variables** in `.env`:
```bash
GEMINI_API_KEY=your_api_key
POSTGRES_URL=postgresql://username:password@localhost:5432/llm_extractor
```

**3. Set up the database**

**4. Run it:** `npm run dev` and open http://localhost:3000

## Design Choices

Went with Next.js to keep everything in one place—API routes and frontend together makes it easier. Gemini was the obvious choice due to it's fast and has a generous free tier. Keyword extraction is just counting word frequency locally. Tailwind keeps the UI clean without CSS files.

## Trade-offs (Time Constraints)

- **No auth**: Skipped user accounts entirely
- **No caching**: Hits the database every time

## API Endpoints

**POST /api/analyze** - Submit text, get back summary + metadata + keywords
**GET /api/search?query=xyz** - Search past analyses by topic/keyword
**GET /api/analyses** - Fetch all past analyses

## Stack

Next.js • TypeScript • Tailwind CSS • Gemini • PostgreSQL • Zod
