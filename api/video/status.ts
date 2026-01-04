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

  const { operationName, apiKey } = req.body;

  if (!operationName || typeof operationName !== 'string') {
    return res.status(400).json({ error: 'Operation name is required' });
  }

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API key is required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Get the operation status
    const operation = await ai.operations.getVideosOperation({
      operation: { name: operationName },
    });

    if (operation.done) {
      // Video generation complete
      const generatedVideos = operation.response?.generatedVideos;

      if (generatedVideos && generatedVideos.length > 0 && generatedVideos[0].video) {
        const video = generatedVideos[0].video;

        return res.status(200).json({
          done: true,
          success: true,
          video: {
            uri: video.uri,
            mimeType: video.mimeType || 'video/mp4',
          },
        });
      } else {
        // Generation completed but no video (may have been filtered)
        return res.status(200).json({
          done: true,
          success: false,
          error: 'Video generation completed but no video was returned. Content may have been filtered.',
        });
      }
    } else {
      // Still processing
      return res.status(200).json({
        done: false,
        message: 'Video is still being generated...',
      });
    }

  } catch (error) {
    console.error('Status check error:', error);
    const message = error instanceof Error ? error.message : 'Failed to check operation status';

    // Check if operation not found
    if (message.includes('not found') || message.includes('NOT_FOUND')) {
      return res.status(404).json({ error: 'Operation not found or expired' });
    }

    return res.status(500).json({ error: message });
  }
}
