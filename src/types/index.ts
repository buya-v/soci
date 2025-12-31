import { z } from 'zod';

// Zod Schemas for defensive validation
export const TrendSchema = z.object({
  id: z.string(),
  topic: z.string(),
  volume: z.string(),
  confidence: z.number().min(0).max(100),
  category: z.string(),
  hashtags: z.array(z.string())
});

export const PostSchema = z.object({
  id: z.string(),
  content: z.string(),
  platform: z.enum(['twitter', 'linkedin', 'instagram']),
  status: z.enum(['draft', 'scheduled', 'published']),
  timestamp: z.string(),
  predictedEngagement: z.string()
});

export type Trend = z.infer<typeof TrendSchema>;
export type Post = z.infer<typeof PostSchema>;

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export interface UserState {
  user: {
    name: string;
    role: string;
    avatar: string;
  };
  trends: Trend[];
  posts: Post[];
  isLoading: boolean;
  activeView: 'dashboard' | 'trends' | 'composer' | 'settings';
  setActiveView: (view: 'dashboard' | 'trends' | 'composer' | 'settings') => void;
  generatePost: (trend: Trend) => void;
  addPost: (post: Post) => void;
  refreshTrends: () => Promise<void>;
}