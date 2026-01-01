// User and authentication types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
}

// Persona configuration
export interface Persona {
  id: string;
  name: string;
  niche: string;
  targetAudience: string;
  tone: 'professional' | 'casual' | 'witty' | 'inspirational';
  topics: string[];
  maxDailyPosts: number;
  isActive: boolean;
}

// Trend types
export interface Trend {
  id: string;
  topic: string;
  volume: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevance: number; // 0-100
  source?: string;
  sourceUrl?: string;
  timestamp: string; // ISO date string for JSON serialization
}

export interface TrendSource {
  title: string;
  url: string;
}

// Post types
export interface Post {
  id: string;
  content: string;
  caption?: string;
  hashtags: string[];
  platform: Platform;
  status: PostStatus;
  scheduledAt?: Date;
  scheduledFor?: string; // ISO date string
  publishedAt?: Date;
  engagement?: PostEngagement;
  imageUrl?: string;
  trendId?: string;
}

export type Platform = 'twitter' | 'linkedin' | 'instagram' | 'tiktok';
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface PostEngagement {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
}

// Analytics types
export interface Metric {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  unit?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface AnalyticsData {
  followers: number;
  followersChange: number;
  engagement: number;
  engagementChange: number;
  reach: number;
  reachChange: number;
  audienceGrowth: ChartDataPoint[];
  engagementByDay: ChartDataPoint[];
}

// Activity log types
export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string; // ISO date string for JSON serialization
  status: 'success' | 'pending' | 'failed';
  platform?: Platform;
}

// Automation settings
export interface AutomationSettings {
  autoPostDiscovery: boolean;
  aiImageSynthesis: boolean;
  smartScheduling: boolean;
  autoEngagement: boolean;
}

// Platform credentials
export interface PlatformCredential {
  platform: Platform;
  isConnected: boolean;
  username?: string;
  lastSync?: Date;
}

// Video generation types
export interface VideoGenerationParams {
  prompt: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  resolution: '720p' | '1080p';
  sourceImage?: string;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  createdAt: Date;
}

// Content generation types
export interface ContentGenerationParams {
  trend: Trend;
  tone: Persona['tone'];
  platform: Platform;
  includeHashtags: boolean;
  includeImage: boolean;
}

export interface GeneratedContent {
  id: string;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  suggestedTime?: Date;
}

// Navigation
export type ViewType = 'dashboard' | 'trends' | 'content' | 'templates' | 'hashtags' | 'media' | 'drafts' | 'calendar' | 'video' | 'automation';

// App state
export interface AppState {
  user: User | null;
  persona: Persona | null;
  activeView: ViewType;
  isLoading: boolean;
  error: AppError | null;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: string;
}

// Content Template types
export interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  hashtags: string[];
  platform: Platform | 'all';
  category: TemplateCategory;
  variables: TemplateVariable[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export type TemplateCategory =
  | 'promotional'
  | 'educational'
  | 'engagement'
  | 'announcement'
  | 'storytelling'
  | 'behind-the-scenes'
  | 'user-generated'
  | 'trending';

export interface TemplateVariable {
  name: string;
  defaultValue?: string;
}

// Hashtag Collection types
export interface HashtagCollection {
  id: string;
  name: string;
  description?: string;
  hashtags: string[];
  color: string;
  platform: Platform | 'all';
  createdAt: string;
  usageCount: number;
}

// Media Library types
export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnailUrl?: string;
  size: number;
  dimensions?: { width: number; height: number };
  tags: string[];
  folderId?: string;
  createdAt: string;
  usageCount: number;
}

export interface MediaFolder {
  id: string;
  name: string;
  color: string;
  itemCount: number;
  createdAt: string;
}
