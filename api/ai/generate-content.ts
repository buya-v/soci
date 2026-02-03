import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// These should be set in Vercel environment variables
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      systemPrompt,
      userPrompt,
      provider = 'anthropic',
      maxTokens = 1024
    } = req.body;

    // Validation
    if (!systemPrompt || typeof systemPrompt !== 'string') {
      return res.status(400).json({ error: 'System prompt is required' });
    }

    if (!userPrompt || typeof userPrompt !== 'string') {
      return res.status(400).json({ error: 'User prompt is required' });
    }

    if (systemPrompt.length > 10000 || userPrompt.length > 10000) {
      return res.status(400).json({ error: 'Prompts exceed maximum length' });
    }

    let responseText: string;

    if (provider === 'gemini') {
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured on server' });
      }

      const gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      });

      const response = result.response;
      responseText = response.text();

      // Clean up markdown code blocks if present
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else {
      // Use Anthropic (default)
      if (!ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: 'Anthropic API key not configured on server' });
      }

      const anthropic = new Anthropic({
        apiKey: ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt,
      });

      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      responseText = textContent.text;
    }

    return res.status(200).json({
      success: true,
      text: responseText,
    });

  } catch (error) {
    console.error('AI generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate content';

    // Format user-friendly error messages
    if (message.includes('credit balance') || message.includes('too low')) {
      return res.status(402).json({ error: 'API credits depleted. Please contact administrator.' });
    }
    if (message.includes('invalid_api_key') || message.includes('401')) {
      return res.status(401).json({ error: 'Invalid API key configured on server.' });
    }
    if (message.includes('rate_limit') || message.includes('429')) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment and try again.' });
    }
    if (message.includes('quota') || message.includes('limit')) {
      return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
    }

    return res.status(500).json({ error: message });
  }
}
