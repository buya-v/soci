
export interface Trend {
  id: string;
  topic: string;
  description: string;
  relevance: number;
  sources: Array<{ title: string; uri: string }>;
  suggestedAction: string;
}

export interface GeneratedPost {
  id: string;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  platform: 'Instagram' | 'Twitter' | 'LinkedIn' | 'TikTok';
  status: 'draft' | 'scheduled' | 'published';
  timestamp: number;
}

export interface AnalyticsData {
  name: string;
  followers: number;
  engagement: number;
  reach: number;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  TRENDS = 'trends',
  CONTENT = 'content',
  VIDEO = 'video',
  AUTOMATION = 'automation',
}

export interface UserNiche {
  category: string;
  targetAudience: string;
  voice: string;
}
