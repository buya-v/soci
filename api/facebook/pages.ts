import type { VercelRequest, VercelResponse } from '@vercel/node';

const FACEBOOK_ACCOUNTS_URL = 'https://graph.facebook.com/v18.0/me/accounts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const accessToken = authHeader.substring(7);

  try {
    // Fetch user's managed pages with relevant fields
    const response = await fetch(
      `${FACEBOOK_ACCOUNTS_URL}?access_token=${accessToken}&fields=id,name,access_token,category,picture.type(small)`,
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch pages:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Failed to fetch pages',
      });
    }

    // Transform the response
    const pages = (data.data || []).map((page: {
      id: string;
      name: string;
      access_token: string;
      category: string;
      picture?: { data?: { url?: string } };
    }) => ({
      id: page.id,
      name: page.name,
      accessToken: page.access_token,
      category: page.category,
      pictureUrl: page.picture?.data?.url,
    }));

    return res.status(200).json({
      pages,
      hasMore: !!data.paging?.next,
    });

  } catch (error) {
    console.error('Pages fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch pages' });
  }
}
