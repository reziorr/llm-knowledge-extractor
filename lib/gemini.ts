import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    genAI = new GoogleGenerativeAI(apiKey);
  }

  return genAI;
}

export interface ExtractedMetadata {
  summary: string;
  title: string | null;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}


export async function extractMetadata(text: string): Promise<ExtractedMetadata> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze the following text and provide a JSON response with these exact fields:
{
  "summary": "A 2-3 sentence summary of the text",
  "title": "A concise title for the text (or null if no clear title can be determined)",
  "topics": ["topic1", "topic2", "topic3"],
  "sentiment": "positive, neutral, or negative"
}

Guidelines:
- summary: Should be 1-2 sentences maximum
- title: Extract or create a short, descriptive title (max 10 words). Return null if the text is too fragmented or unclear.
- topics: Identify exactly 3 key topics or themes
- sentiment: Analyze the overall tone and return one of: positive, neutral, negative

Text to analyze:
${text}

Return ONLY the JSON object, no additional text or formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // Parse the JSON response
    // Remove markdown code blocks if present
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const metadata = JSON.parse(cleanedText);

    // Validate and normalize the response
    return {
      summary: metadata.summary || 'No summary available',
      title: metadata.title || null,
      topics: Array.isArray(metadata.topics) ? metadata.topics.slice(0, 3) : ['unknown'],
      sentiment: ['positive', 'neutral', 'negative'].includes(metadata.sentiment)
        ? metadata.sentiment
        : 'neutral',
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);

    // Return a fallback response when API fails
    throw new Error('Failed to analyze text with Gemini API. Please try again.');
  }
}