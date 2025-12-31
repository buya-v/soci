export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface ActivityLog {
  id: string;
  timestamp: Date;
  message: string;
  type: LogLevel;
}

export interface Trend {
  id: string;
  topic: string;
  volume: string;
  sociScore: number;
  category: string;
}

export interface GeneratedPost {
  id: string;
  content: string;
  trendId: string;
  platform: 'twitter' | 'linkedin';
  status: 'draft' | 'scheduled' | 'published';
}

export interface Persona {
  tone: string;
  niche: string;
  forbiddenKeywords: string[];
  targetAudience: string;
}