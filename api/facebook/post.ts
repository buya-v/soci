import type { VercelRequest, VercelResponse } from '@vercel/node';

// Facebook Graph API base URL
const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

interface PostParams {
  pageId: string;
  pageAccessToken: string;
  message?: string;
  link?: string;
  photoUrl?: string;
  scheduledPublishTime?: number; // Unix timestamp
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    pageId,
    pageAccessToken,
    message,
    link,
    photoUrl,
    scheduledPublishTime,
  }: PostParams = req.body;

  // Validate required fields
  if (!pageId || !pageAccessToken) {
    return res.status(400).json({ error: 'Page ID and access token are required' });
  }

  if (!message && !link && !photoUrl) {
    return res.status(400).json({ error: 'At least one of message, link, or photo is required' });
  }

  // Validate message length (Facebook allows up to 63,206 characters)
  if (message && message.length > 63206) {
    return res.status(400).json({ error: 'Post exceeds 63,206 character limit' });
  }

  try {
    let endpoint: string;
    let postBody: Record<string, string | number | boolean>;

    if (photoUrl) {
      // Photo post
      endpoint = `${GRAPH_API_BASE}/${pageId}/photos`;
      postBody = {
        url: photoUrl,
        access_token: pageAccessToken,
      };
      if (message) {
        postBody.caption = message;
      }
    } else {
      // Regular post (text or link)
      endpoint = `${GRAPH_API_BASE}/${pageId}/feed`;
      postBody = {
        access_token: pageAccessToken,
      };
      if (message) {
        postBody.message = message;
      }
      if (link) {
        postBody.link = link;
      }
    }

    // Handle scheduled posts
    if (scheduledPublishTime) {
      // Facebook requires scheduled time to be at least 10 minutes in the future
      // and no more than 6 months in the future
      const now = Math.floor(Date.now() / 1000);
      const minTime = now + 600; // 10 minutes
      const maxTime = now + 15768000; // ~6 months

      if (scheduledPublishTime < minTime) {
        return res.status(400).json({
          error: 'Scheduled time must be at least 10 minutes in the future',
        });
      }

      if (scheduledPublishTime > maxTime) {
        return res.status(400).json({
          error: 'Scheduled time cannot be more than 6 months in the future',
        });
      }

      postBody.published = false;
      postBody.scheduled_publish_time = scheduledPublishTime;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Facebook post failed:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Failed to publish post',
        details: data.error,
      });
    }

    return res.status(200).json({
      success: true,
      post: {
        id: data.id || data.post_id,
        scheduled: !!scheduledPublishTime,
      },
    });

  } catch (error) {
    console.error('Post error:', error);
    return res.status(500).json({ error: 'Failed to publish post' });
  }
}
