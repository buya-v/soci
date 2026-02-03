import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Should be set in Vercel environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    const {
      prompt,
      style = 'vivid',
      size = '1024x1024',
      quality = 'standard'
    } = req.body;

    // Validation
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (prompt.length > 4000) {
      return res.status(400).json({ error: 'Prompt exceeds maximum length' });
    }

    // Validate size
    const validSizes = ['1024x1024', '1024x1792', '1792x1024'];
    if (!validSizes.includes(size)) {
      return res.status(400).json({ error: 'Invalid size parameter' });
    }

    // Validate style
    if (style !== 'natural' && style !== 'vivid') {
      return res.status(400).json({ error: 'Invalid style parameter' });
    }

    // Validate quality
    if (quality !== 'standard' && quality !== 'hd') {
      return res.status(400).json({ error: 'Invalid quality parameter' });
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    const enhancedPrompt = `Create a modern, professional social media image: ${prompt}.
Style: Clean, high-quality, suitable for social media marketing.
Do not include any text or words in the image.`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: size as '1024x1024' | '1024x1792' | '1792x1024',
      style: style as 'natural' | 'vivid',
      quality: quality as 'standard' | 'hd',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    return res.status(200).json({
      success: true,
      imageUrl,
    });

  } catch (error) {
    console.error('Image generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate image';

    // Format user-friendly error messages
    if (message.includes('billing') || message.includes('quota')) {
      return res.status(402).json({ error: 'API quota exceeded. Please contact administrator.' });
    }
    if (message.includes('invalid_api_key') || message.includes('401')) {
      return res.status(401).json({ error: 'Invalid API key configured on server.' });
    }
    if (message.includes('rate_limit') || message.includes('429')) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment and try again.' });
    }
    if (message.includes('content_policy')) {
      return res.status(400).json({ error: 'Prompt violates content policy. Please try a different prompt.' });
    }

    return res.status(500).json({ error: message });
  }
}
