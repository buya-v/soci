import type { Trend } from '@/types';

export interface TrendSource {
  id: string;
  name: string;
  enabled: boolean;
}

export const trendSources: TrendSource[] = [
  { id: 'google', name: 'Google Trends', enabled: true },
  { id: 'reddit', name: 'Reddit', enabled: true },
  { id: 'hackernews', name: 'Hacker News', enabled: true },
];

interface RedditPost {
  data: {
    title: string;
    score: number;
    url: string;
    permalink: string;
    subreddit: string;
  };
}

interface HackerNewsItem {
  id: number;
  title: string;
  score: number;
  url?: string;
  by: string;
}

// Fetch trending topics from Reddit
async function fetchRedditTrends(subreddits: string[] = ['technology', 'programming', 'startups']): Promise<Trend[]> {
  const trends: Trend[] = [];

  for (const subreddit of subreddits) {
    try {
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=5`, {
        headers: {
          'User-Agent': 'SOCI-TrendEngine/1.0',
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const posts = data.data?.children || [];

      posts.forEach((post: RedditPost, index: number) => {
        const postData = post.data;
        trends.push({
          id: `reddit-${subreddit}-${index}`,
          topic: postData.title,
          volume: postData.score * 100, // Approximate based on score
          sentiment: postData.score > 500 ? 'positive' : postData.score > 100 ? 'neutral' : 'neutral',
          relevance: Math.min(95, 70 + Math.floor(postData.score / 100)),
          source: `r/${subreddit}`,
          sourceUrl: `https://reddit.com${postData.permalink}`,
          timestamp: new Date().toISOString(),
        });
      });
    } catch (error) {
      console.warn(`Failed to fetch Reddit trends for r/${subreddit}:`, error);
    }
  }

  return trends;
}

// Fetch trending topics from Hacker News
async function fetchHackerNewsTrends(): Promise<Trend[]> {
  try {
    // Get top stories
    const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!topStoriesResponse.ok) return [];

    const storyIds = await topStoriesResponse.json();
    const topIds = storyIds.slice(0, 10);

    // Fetch details for each story
    const stories = await Promise.all(
      topIds.map(async (id: number) => {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return response.ok ? response.json() : null;
      })
    );

    return stories
      .filter((story): story is HackerNewsItem => story !== null && story.title)
      .map((story) => ({
        id: `hn-${story.id}`,
        topic: story.title,
        volume: story.score * 150, // HN scores are generally lower
        sentiment: story.score > 200 ? 'positive' : 'neutral',
        relevance: Math.min(92, 65 + Math.floor(story.score / 50)),
        source: 'Hacker News',
        sourceUrl: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        timestamp: new Date().toISOString(),
      }));
  } catch (error) {
    console.warn('Failed to fetch Hacker News trends:', error);
    return [];
  }
}

// Note: Google Trends doesn't have a public JSON API that works with CORS
// In production, this would go through a backend proxy
// For now, we rely on Reddit, HN, and simulated trends

// Generate AI-simulated trends based on current tech topics
function generateSimulatedTrends(): Trend[] {
  const topics = [
    { topic: 'AI Agents and Autonomous Systems', volume: 185000, sentiment: 'positive' as const },
    { topic: 'OpenAI GPT-5 Speculation', volume: 142000, sentiment: 'positive' as const },
    { topic: 'Claude AI New Features', volume: 98000, sentiment: 'positive' as const },
    { topic: 'React 19 Release Updates', volume: 87000, sentiment: 'neutral' as const },
    { topic: 'Rust for Web Development', volume: 76000, sentiment: 'positive' as const },
    { topic: 'Edge Computing Trends', volume: 65000, sentiment: 'neutral' as const },
    { topic: 'Web3 and Blockchain Resurgence', volume: 54000, sentiment: 'neutral' as const },
    { topic: 'Remote Work Tech Stack 2024', volume: 48000, sentiment: 'positive' as const },
  ];

  return topics.map((t, i) => ({
    id: `simulated-${i}`,
    topic: t.topic,
    volume: t.volume + Math.floor(Math.random() * 10000),
    sentiment: t.sentiment,
    relevance: Math.max(60, 95 - i * 5),
    source: 'Trend Analysis',
    sourceUrl: `https://google.com/search?q=${encodeURIComponent(t.topic)}`,
    timestamp: new Date().toISOString(),
  }));
}

export interface FetchTrendsOptions {
  sources?: string[];
  niches?: string[];
  limit?: number;
}

export async function fetchTrends(options: FetchTrendsOptions = {}): Promise<Trend[]> {
  const { sources = ['reddit', 'hackernews'], niches = ['technology', 'startups'], limit = 15 } = options;

  const allTrends: Trend[] = [];

  // Fetch from enabled sources in parallel
  const promises: Promise<Trend[]>[] = [];

  if (sources.includes('reddit')) {
    const subreddits = niches.flatMap(niche => {
      switch (niche.toLowerCase()) {
        case 'technology':
          return ['technology', 'programming', 'webdev'];
        case 'startups':
          return ['startups', 'Entrepreneur', 'smallbusiness'];
        case 'ai':
          return ['MachineLearning', 'artificial', 'ChatGPT'];
        case 'finance':
          return ['finance', 'investing', 'CryptoCurrency'];
        case 'marketing':
          return ['marketing', 'socialmedia', 'SEO'];
        default:
          return [niche];
      }
    });
    promises.push(fetchRedditTrends([...new Set(subreddits)].slice(0, 5)));
  }

  if (sources.includes('hackernews')) {
    promises.push(fetchHackerNewsTrends());
  }

  // Add simulated trends as fallback/supplement
  promises.push(Promise.resolve(generateSimulatedTrends()));

  const results = await Promise.allSettled(promises);

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allTrends.push(...result.value);
    }
  });

  // Sort by relevance and volume, remove duplicates, limit results
  const uniqueTrends = allTrends.reduce((acc, trend) => {
    const exists = acc.some(
      (t) => t.topic.toLowerCase().includes(trend.topic.toLowerCase().slice(0, 20)) ||
             trend.topic.toLowerCase().includes(t.topic.toLowerCase().slice(0, 20))
    );
    if (!exists) acc.push(trend);
    return acc;
  }, [] as Trend[]);

  return uniqueTrends
    .sort((a, b) => b.relevance - a.relevance || b.volume - a.volume)
    .slice(0, limit);
}

// Analyze trend relevance to a specific niche using pattern matching
export function calculateNicheRelevance(trend: Trend, niche: string, topics: string[]): number {
  const trendLower = trend.topic.toLowerCase();
  const nicheLower = niche.toLowerCase();

  let score = trend.relevance;

  // Boost if trend contains niche keywords
  if (trendLower.includes(nicheLower)) {
    score += 15;
  }

  // Boost for each matching topic
  topics.forEach((topic) => {
    if (trendLower.includes(topic.toLowerCase())) {
      score += 10;
    }
  });

  // Bonus for high-volume trends
  if (trend.volume > 100000) score += 5;
  if (trend.volume > 200000) score += 5;

  // Bonus for positive sentiment
  if (trend.sentiment === 'positive') score += 3;

  return Math.min(100, score);
}
