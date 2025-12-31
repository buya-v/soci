export interface Metric {
  label: string;
  value: number | string;
  trend?: number;
  unit?: string;
}

export interface Trend {
  id: string;
  topic: string;
  volume: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  momentum: number; // 0-100
}

export interface GeneratedPost {
  id: string;
  content: string;
  platform: 'twitter' | 'linkedin' | 'instagram';
  predictedEngagement: number;
  status: 'draft' | 'scheduled' | 'published';
}

export interface AppError {
  code: string;
  message: string;
  traceId?: string;
}