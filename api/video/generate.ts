import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, aspectRatio = '16:9', apiKey } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API key is required' });
  }

  if (prompt.length > 1024) {
    return res.status(400).json({ error: 'Prompt exceeds 1024 character limit' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Start video generation - this returns an operation that needs polling
    const operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001', // Veo 2 for wider availability
      prompt,
      config: {
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
        numberOfVideos: 1,
      },
    });

    // Return the operation details for client-side polling
    return res.status(200).json({
      success: true,
      operation: {
        name: operation.name,
        done: operation.done || false,
      },
      message: 'Video generation started. Poll the status endpoint for progress.',
    });

  } catch (error) {
    console.error('Video generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to start video generation';

    // Check for specific error types
    if (message.includes('quota') || message.includes('limit')) {
      return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
    }
    if (message.includes('invalid') || message.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key. Please check your Gemini API key.' });
    }

    return res.status(500).json({ error: message });
  }
}
