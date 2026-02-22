import type {
  Persona,
  AutomationSettings,
  PlatformCredential,
  BudgetConfig,
} from '@/types';
import type { ApiKeys } from './types';

export const defaultPersona: Persona = {
  id: 'default',
  name: 'Default Persona',
  niche: 'Technology & Innovation',
  targetAudience: 'Entrepreneurs, startup founders, tech enthusiasts',
  tone: 'professional',
  topics: ['AI', 'startups', 'productivity', 'innovation'],
  maxDailyPosts: 5,
  isActive: true,
  defaultLanguage: 'en',
  platformLanguages: {},
};

export const defaultAutomationSettings: AutomationSettings = {
  autoPostDiscovery: true,
  aiImageSynthesis: true,
  smartScheduling: false,
  autoEngagement: false,
};

export const defaultPlatformCredentials: PlatformCredential[] = [
  { platform: 'instagram', isConnected: false },
  { platform: 'twitter', isConnected: false },
  { platform: 'linkedin', isConnected: false },
  { platform: 'tiktok', isConnected: false },
];

export const defaultApiKeys: ApiKeys = {
  anthropic: '',
  openai: '',
  gemini: '',
};

export const defaultBudgetConfig: BudgetConfig = {
  monthlyBudget: 0,
  currency: 'USD',
  allocations: [
    { category: 'content_boost', percentage: 30, amount: 0, priority: 'high' },
    { category: 'ad_campaigns', percentage: 25, amount: 0, priority: 'high' },
    { category: 'influencer_collab', percentage: 15, amount: 0, priority: 'medium' },
    { category: 'tools_software', percentage: 10, amount: 0, priority: 'medium' },
    { category: 'content_creation', percentage: 10, amount: 0, priority: 'medium' },
    { category: 'analytics_insights', percentage: 5, amount: 0, priority: 'low' },
    { category: 'reserve', percentage: 5, amount: 0, priority: 'low' },
  ],
  optimizationMode: 'balanced',
  autoOptimize: true,
};
