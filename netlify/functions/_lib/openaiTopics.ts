import axios from 'axios';
import type { RawItem } from './rss';

type LocationContext = {
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type GeneratedTopicSnapshot = {
  generatedAt: string;
  locationContext: LocationContext;
  topics: Array<{
    id: string;
    title: string;
    summary: string;
    source?: string;
    trendScore?: number | null;
    locationRelevance?: number;
    supportingItemIds: string[];
    subTopics: Array<{
      id: string;
      title: string;
      summary: string;
      supportingItemIds: string[];
    }>;
  }>;
};

function buildPrompt(location: LocationContext, rawItems: RawItem[]) {
  return {
    system:
      "You are an assistant for the 'Upto Date' app. Convert RAW_ITEMS into a ranked daily feed. Return ONLY valid JSON (no markdown). Output must match this schema exactly: {generatedAt: string, locationContext: {city: string|null, country: string|null, latitude: number|null, longitude: number|null}, topics: Array<{id: string, title: string, summary: string, source?: string, trendScore?: number|null, locationRelevance?: number, supportingItemIds: string[], subTopics: Array<{id: string, title: string, summary: string, supportingItemIds: string[]}>}>}. Ensure ids are stable strings, unique within the response.",
    user: JSON.stringify({ locationContext: location, rawItems }, null, 2)
  };
}

export async function generateTopicsWithOpenAI(params: {
  location: LocationContext;
  rawItems: RawItem[];
}): Promise<GeneratedTopicSnapshot> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  const { system, user } = buildPrompt(params.location, params.rawItems);

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: system
        },
        {
          role: 'user',
          content: user
        }
      ],
      temperature: 0.4,
      max_tokens: 2500
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned empty response');
  }

  const jsonText = String(content).replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(jsonText);

  if (!parsed || !Array.isArray(parsed.topics)) {
    throw new Error('OpenAI response did not match expected schema');
  }

  return parsed;
}
