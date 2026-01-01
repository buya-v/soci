import type {
  Trend,
  Post,
  GeneratedContent,
  AnalyticsData,
  ActivityLog,
  Platform,
  Persona,
} from '@/types';

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data generators
const generateId = () => crypto.randomUUID();

const mockTrends: Trend[] = [
  {
    id: generateId(),
    topic: 'AI-Powered Productivity Tools',
    volume: 125000,
    sentiment: 'positive',
    relevance: 92,
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com',
    timestamp: new Date().toISOString(),
  },
  {
    id: generateId(),
    topic: 'Remote Work Evolution 2025',
    volume: 89000,
    sentiment: 'neutral',
    relevance: 85,
    source: 'Forbes',
    sourceUrl: 'https://forbes.com',
    timestamp: new Date().toISOString(),
  },
  {
    id: generateId(),
    topic: 'Sustainable Tech Innovations',
    volume: 67000,
    sentiment: 'positive',
    relevance: 78,
    source: 'Wired',
    sourceUrl: 'https://wired.com',
    timestamp: new Date().toISOString(),
  },
  {
    id: generateId(),
    topic: 'Creator Economy Growth',
    volume: 54000,
    sentiment: 'positive',
    relevance: 71,
    source: 'Business Insider',
    sourceUrl: 'https://businessinsider.com',
    timestamp: new Date().toISOString(),
  },
  {
    id: generateId(),
    topic: 'Web3 and Decentralization',
    volume: 42000,
    sentiment: 'neutral',
    relevance: 65,
    source: 'CoinDesk',
    sourceUrl: 'https://coindesk.com',
    timestamp: new Date().toISOString(),
  },
];

const mockAnalytics: AnalyticsData = {
  followers: 24583,
  followersChange: 12.5,
  engagement: 8.4,
  engagementChange: 5.2,
  reach: 142800,
  reachChange: -2.1,
  audienceGrowth: [
    { name: 'Mon', value: 4200 },
    { name: 'Tue', value: 4350 },
    { name: 'Wed', value: 4580 },
    { name: 'Thu', value: 4420 },
    { name: 'Fri', value: 4890 },
    { name: 'Sat', value: 5200 },
    { name: 'Sun', value: 5450 },
  ],
  engagementByDay: [
    { name: 'Mon', value: 72 },
    { name: 'Tue', value: 85 },
    { name: 'Wed', value: 68 },
    { name: 'Thu', value: 91 },
    { name: 'Fri', value: 78 },
    { name: 'Sat', value: 95 },
    { name: 'Sun', value: 88 },
  ],
};

// API Service
export const api = {
  // Trends
  async getTrends(): Promise<Trend[]> {
    await delay(1000);
    // Simulate some randomness in the data
    return mockTrends.map((trend) => ({
      ...trend,
      volume: trend.volume + Math.floor(Math.random() * 5000) - 2500,
      relevance: Math.min(100, Math.max(0, trend.relevance + Math.floor(Math.random() * 10) - 5)),
    }));
  },

  async refreshTrends(): Promise<Trend[]> {
    await delay(2000);
    return this.getTrends();
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    await delay(800);
    return {
      ...mockAnalytics,
      followers: mockAnalytics.followers + Math.floor(Math.random() * 100),
      engagement: Number((mockAnalytics.engagement + Math.random() * 0.5).toFixed(1)),
    };
  },

  // Content Generation
  async generateContent(params: {
    topic: string;
    tone: Persona['tone'];
    platform: Platform;
  }): Promise<GeneratedContent> {
    await delay(2500);

    const captions: Record<Persona['tone'], string> = {
      professional: `Exploring the future of ${params.topic}. The possibilities are endless when we embrace innovation and push boundaries. What's your perspective on this evolution?`,
      casual: `Been thinking a lot about ${params.topic} lately... and wow, things are getting interesting! 🚀 What do you all think?`,
      witty: `Plot twist: ${params.topic} is actually the main character of 2025. Didn't see that coming, did you? 😏`,
      inspirational: `Every great innovation starts with a single step. ${params.topic} is our next frontier. Together, we'll shape tomorrow. ✨`,
    };

    const hashtags = [
      params.topic.toLowerCase().replace(/\s+/g, ''),
      'innovation',
      'future',
      'tech',
      'growth',
    ];

    return {
      id: generateId(),
      caption: captions[params.tone],
      hashtags,
      imageUrl: `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600`,
      suggestedTime: new Date(Date.now() + 3600000), // 1 hour from now
    };
  },

  // Posts
  async getPosts(): Promise<Post[]> {
    await delay(500);
    return [];
  },

  async createPost(post: Omit<Post, 'id'>): Promise<Post> {
    await delay(1000);
    return {
      ...post,
      id: generateId(),
    };
  },

  async schedulePost(postId: string, scheduledAt: Date): Promise<Post> {
    await delay(800);
    return {
      id: postId,
      content: '',
      hashtags: [],
      platform: 'instagram',
      status: 'scheduled',
      scheduledAt,
    };
  },

  async publishPost(postId: string): Promise<Post> {
    await delay(1500);
    return {
      id: postId,
      content: '',
      hashtags: [],
      platform: 'instagram',
      status: 'published',
      publishedAt: new Date(),
    };
  },

  // Activity
  async getActivities(): Promise<ActivityLog[]> {
    await delay(500);
    return [
      {
        id: generateId(),
        action: 'Post Published',
        description: 'AI-generated content on Twitter',
        timestamp: new Date().toISOString(),
        status: 'success',
        platform: 'twitter',
      },
      {
        id: generateId(),
        action: 'Trend Detected',
        description: 'New viral topic in your niche',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'pending',
      },
      {
        id: generateId(),
        action: 'Engagement Spike',
        description: '+340% on LinkedIn post',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'success',
        platform: 'linkedin',
      },
      {
        id: generateId(),
        action: 'Content Scheduled',
        description: '3 posts queued for tomorrow',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        status: 'success',
      },
    ];
  },

  // Video Generation (placeholder)
  async generateVideo(_params: {
    prompt: string;
    aspectRatio: string;
    resolution: string;
  }): Promise<{ id: string; url: string }> {
    await delay(8000);
    return {
      id: generateId(),
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    };
  },

  // Platform OAuth (placeholder)
  async connectPlatform(platform: Platform): Promise<{ authUrl: string }> {
    await delay(500);
    return {
      authUrl: `https://api.${platform}.com/oauth/authorize?client_id=demo`,
    };
  },

  async disconnectPlatform(_platform: Platform): Promise<void> {
    await delay(500);
  },
};
