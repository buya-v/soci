import { safeList } from "../utils/resilience";

export interface Trend {
  id: string;
  topic: string;
  volume: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevance: number;
}

export interface Post {
  id: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published';
  engagement: number;
  platform: 'twitter' | 'linkedin' | 'instagram';
  timestamp: string;
}

export interface UserProfile {
  name: string;
  handle: string;
  persona: 'Professional' | 'Witty' | 'Visionary';
  apiKeySet: boolean;
}

// MOCK DATA STORE
export const MOCK_TRENDS: Trend[] = [
  { id: 't1', topic: '#AIRevolution', volume: '2.4M', sentiment: 'positive', relevance: 98 },
  { id: 't2', topic: 'Remote Work 2.0', volume: '850K', sentiment: 'neutral', relevance: 85 },
  { id: 't3', topic: 'Sustainable Tech', volume: '1.2M', sentiment: 'positive', relevance: 72 },
  { id: 't4', topic: 'Web3 Gaming', volume: '400K', sentiment: 'negative', relevance: 45 },
];

export const MOCK_POSTS: Post[] = [
  { 
    id: 'p1', 
    content: 'Just analyzed the latest #AI trends. The shift towards autonomous agents is not just coming, it is here. 🤖✨ #TechTrends',
    status: 'published',
    engagement: 1240,
    platform: 'twitter',
    timestamp: '2h ago'
  },
  { 
    id: 'p2', 
    content: 'Maximize your productivity by letting algorithms handle the mundane. Focus on creation, not administration.',
    status: 'scheduled',
    engagement: 0,
    platform: 'linkedin',
    timestamp: 'In 3 hours'
  }
];

export const MOCK_USER: UserProfile = {
  name: 'Alex Innovator',
  handle: '@alex_builds',
  persona: 'Visionary',
  apiKeySet: true
};

export const getSafeTrends = () => safeList(MOCK_TRENDS);
export const getSafePosts = () => safeList(MOCK_POSTS);