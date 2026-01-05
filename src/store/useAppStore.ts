import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ViewType,
  User,
  Persona,
  Trend,
  Post,
  AutomationSettings,
  PlatformCredential,
  ActivityLog,
  ContentTemplate,
  HashtagCollection,
  MediaItem,
  MediaFolder,
  BudgetConfig,
  BudgetSpend,
  BudgetCategory,
  Language,
  Platform,
} from '@/types';
import { login as loginAPI } from '@/utils/auth';

export interface ApiKeys {
  anthropic: string;
  openai: string;
  gemini: string;
}

export type Theme = 'dark' | 'light' | 'system';

interface AppState {
  // Authentication
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;

  // Navigation
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // API Keys
  apiKeys: ApiKeys;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  clearApiKeys: () => void;

  // User & Persona
  user: User | null;
  persona: Persona | null;
  setUser: (user: User | null) => void;
  setPersona: (persona: Persona) => void;
  updatePersona: (updates: Partial<Persona>) => void;

  // Trends
  trends: Trend[];
  setTrends: (trends: Trend[]) => void;
  addTrend: (trend: Trend) => void;

  // Posts
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;

  // Activity
  activities: ActivityLog[];
  addActivity: (activity: ActivityLog) => void;
  clearActivities: () => void;

  // Automation
  automationSettings: AutomationSettings;
  updateAutomationSettings: (settings: Partial<AutomationSettings>) => void;

  // Platform Connections
  platformCredentials: PlatformCredential[];
  updatePlatformCredential: (platform: string, updates: Partial<PlatformCredential>) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;

  // Persistent Notifications
  persistentNotifications: PersistentNotification[];
  addPersistentNotification: (notification: Omit<PersistentNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;

  // Content Templates
  templates: ContentTemplate[];
  addTemplate: (template: ContentTemplate) => void;
  updateTemplate: (id: string, updates: Partial<ContentTemplate>) => void;
  deleteTemplate: (id: string) => void;
  incrementTemplateUsage: (id: string) => void;

  // Hashtag Collections
  hashtagCollections: HashtagCollection[];
  addHashtagCollection: (collection: HashtagCollection) => void;
  updateHashtagCollection: (id: string, updates: Partial<HashtagCollection>) => void;
  deleteHashtagCollection: (id: string) => void;
  incrementHashtagCollectionUsage: (id: string) => void;

  // Media Library
  mediaItems: MediaItem[];
  mediaFolders: MediaFolder[];
  addMediaItem: (item: MediaItem) => void;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;
  deleteMediaItem: (id: string) => void;
  addMediaFolder: (folder: MediaFolder) => void;
  updateMediaFolder: (id: string, updates: Partial<MediaFolder>) => void;
  deleteMediaFolder: (id: string) => void;

  // Draft Auto-save
  draftInProgress: DraftInProgress | null;
  saveDraftInProgress: (draft: DraftInProgress) => void;
  clearDraftInProgress: () => void;

  // Recently Used
  recentlyUsedTemplates: string[]; // Template IDs
  recentlyUsedHashtagCollections: string[]; // Collection IDs
  addRecentlyUsedTemplate: (id: string) => void;
  addRecentlyUsedHashtagCollection: (id: string) => void;

  // Emergency Stop
  isAutonomousModeActive: boolean;
  emergencyStopTriggeredAt: string | null;
  triggerEmergencyStop: () => void;
  resumeAutonomousMode: () => void;

  // Budget Management
  budgetConfig: BudgetConfig;
  budgetSpends: BudgetSpend[];
  setBudgetConfig: (config: Partial<BudgetConfig>) => void;
  setMonthlyBudget: (amount: number) => void;
  updateAllocation: (category: BudgetCategory, percentage: number) => void;
  addBudgetSpend: (spend: BudgetSpend) => void;
  deleteBudgetSpend: (id: string) => void;
  optimizeBudget: (mode: BudgetConfig['optimizationMode']) => void;

  // Language Settings
  setDefaultLanguage: (language: Language) => void;
  setPlatformLanguage: (platform: Platform, language: Language | null) => void;
}

interface DraftInProgress {
  caption: string;
  hashtags: string[];
  platform: string;
  topic: string;
  imageUrl?: string;
  savedAt: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface PersistentNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'post' | 'trend' | 'schedule' | 'system';
  actionUrl?: string;
}

const defaultPersona: Persona = {
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

const defaultAutomationSettings: AutomationSettings = {
  autoPostDiscovery: true,
  aiImageSynthesis: true,
  smartScheduling: false,
  autoEngagement: false,
};

const defaultPlatformCredentials: PlatformCredential[] = [
  { platform: 'instagram', isConnected: false },
  { platform: 'twitter', isConnected: false },
  { platform: 'linkedin', isConnected: false },
  { platform: 'tiktok', isConnected: false },
];

const defaultApiKeys: ApiKeys = {
  anthropic: '',
  openai: '',
  gemini: '',
};

const defaultBudgetConfig: BudgetConfig = {
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

// Budget optimization strategies
const optimizationStrategies: Record<BudgetConfig['optimizationMode'], Record<BudgetCategory, number>> = {
  balanced: {
    content_boost: 30,
    ad_campaigns: 25,
    influencer_collab: 15,
    tools_software: 10,
    content_creation: 10,
    analytics_insights: 5,
    reserve: 5,
  },
  growth: {
    content_boost: 35,
    ad_campaigns: 30,
    influencer_collab: 20,
    tools_software: 5,
    content_creation: 5,
    analytics_insights: 3,
    reserve: 2,
  },
  engagement: {
    content_boost: 40,
    ad_campaigns: 15,
    influencer_collab: 25,
    tools_software: 5,
    content_creation: 8,
    analytics_insights: 5,
    reserve: 2,
  },
  reach: {
    content_boost: 25,
    ad_campaigns: 40,
    influencer_collab: 20,
    tools_software: 5,
    content_creation: 5,
    analytics_insights: 3,
    reserve: 2,
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Authentication
      isAuthenticated: false,
      login: async (password: string) => {
        // Use server-side bcrypt authentication
        const result = await loginAPI(password);
        if (result.success) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),

      // Navigation
      activeView: 'dashboard',
      setActiveView: (view) => set({ activeView: view }),

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // API Keys
      apiKeys: defaultApiKeys,
      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),
      clearApiKeys: () => set({ apiKeys: defaultApiKeys }),

      // User & Persona
      user: null,
      persona: defaultPersona,
      setUser: (user) => set({ user }),
      setPersona: (persona) => set({ persona }),
      updatePersona: (updates) =>
        set((state) => ({
          persona: state.persona ? { ...state.persona, ...updates } : null,
        })),

      // Trends
      trends: [],
      setTrends: (trends) => set({ trends }),
      addTrend: (trend) =>
        set((state) => ({ trends: [trend, ...state.trends] })),

      // Posts
      posts: [],
      setPosts: (posts) => set({ posts }),
      addPost: (post) =>
        set((state) => ({ posts: [post, ...state.posts] })),
      updatePost: (id, updates) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deletePost: (id) =>
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
        })),

      // Activity
      activities: [],
      addActivity: (activity) =>
        set((state) => ({
          activities: [activity, ...state.activities].slice(0, 50), // Keep last 50
        })),
      clearActivities: () => set({ activities: [] }),

      // Automation
      automationSettings: defaultAutomationSettings,
      updateAutomationSettings: (settings) =>
        set((state) => ({
          automationSettings: { ...state.automationSettings, ...settings },
        })),

      // Platform Connections
      platformCredentials: defaultPlatformCredentials,
      updatePlatformCredential: (platform, updates) =>
        set((state) => ({
          platformCredentials: state.platformCredentials.map((p) =>
            p.platform === platform ? { ...p, ...updates } : p
          ),
        })),

      // UI State
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: crypto.randomUUID() },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      // Persistent Notifications
      persistentNotifications: [],
      addPersistentNotification: (notification) =>
        set((state) => ({
          persistentNotifications: [
            {
              ...notification,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.persistentNotifications,
          ].slice(0, 50), // Keep last 50
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          persistentNotifications: state.persistentNotifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          persistentNotifications: state.persistentNotifications.map((n) => ({
            ...n,
            read: true,
          })),
        })),
      clearAllNotifications: () =>
        set({ persistentNotifications: [] }),

      // Content Templates
      templates: [],
      addTemplate: (template) =>
        set((state) => ({ templates: [template, ...state.templates] })),
      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
      incrementTemplateUsage: (id) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
          ),
        })),

      // Hashtag Collections
      hashtagCollections: [],
      addHashtagCollection: (collection) =>
        set((state) => ({
          hashtagCollections: [collection, ...state.hashtagCollections],
        })),
      updateHashtagCollection: (id, updates) =>
        set((state) => ({
          hashtagCollections: state.hashtagCollections.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteHashtagCollection: (id) =>
        set((state) => ({
          hashtagCollections: state.hashtagCollections.filter((c) => c.id !== id),
        })),
      incrementHashtagCollectionUsage: (id) =>
        set((state) => ({
          hashtagCollections: state.hashtagCollections.map((c) =>
            c.id === id ? { ...c, usageCount: c.usageCount + 1 } : c
          ),
        })),

      // Media Library
      mediaItems: [],
      mediaFolders: [],
      addMediaItem: (item) =>
        set((state) => ({ mediaItems: [item, ...state.mediaItems] })),
      updateMediaItem: (id, updates) =>
        set((state) => ({
          mediaItems: state.mediaItems.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      deleteMediaItem: (id) =>
        set((state) => ({
          mediaItems: state.mediaItems.filter((m) => m.id !== id),
        })),
      addMediaFolder: (folder) =>
        set((state) => ({
          mediaFolders: [folder, ...state.mediaFolders],
        })),
      updateMediaFolder: (id, updates) =>
        set((state) => ({
          mediaFolders: state.mediaFolders.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        })),
      deleteMediaFolder: (id) =>
        set((state) => ({
          mediaFolders: state.mediaFolders.filter((f) => f.id !== id),
          mediaItems: state.mediaItems.map((m) =>
            m.folderId === id ? { ...m, folderId: undefined } : m
          ),
        })),

      // Draft Auto-save
      draftInProgress: null,
      saveDraftInProgress: (draft) => set({ draftInProgress: draft }),
      clearDraftInProgress: () => set({ draftInProgress: null }),

      // Recently Used
      recentlyUsedTemplates: [],
      recentlyUsedHashtagCollections: [],
      addRecentlyUsedTemplate: (id) =>
        set((state) => ({
          recentlyUsedTemplates: [
            id,
            ...state.recentlyUsedTemplates.filter((t) => t !== id),
          ].slice(0, 5), // Keep last 5
        })),
      addRecentlyUsedHashtagCollection: (id) =>
        set((state) => ({
          recentlyUsedHashtagCollections: [
            id,
            ...state.recentlyUsedHashtagCollections.filter((c) => c !== id),
          ].slice(0, 5), // Keep last 5
        })),

      // Emergency Stop
      isAutonomousModeActive: true,
      emergencyStopTriggeredAt: null,
      triggerEmergencyStop: () =>
        set((state) => ({
          isAutonomousModeActive: false,
          emergencyStopTriggeredAt: new Date().toISOString(),
          automationSettings: {
            ...state.automationSettings,
            autoPostDiscovery: false,
            aiImageSynthesis: false,
            smartScheduling: false,
            autoEngagement: false,
          },
        })),
      resumeAutonomousMode: () =>
        set({
          isAutonomousModeActive: true,
          emergencyStopTriggeredAt: null,
        }),

      // Budget Management
      budgetConfig: defaultBudgetConfig,
      budgetSpends: [],
      setBudgetConfig: (config) =>
        set((state) => ({
          budgetConfig: { ...state.budgetConfig, ...config },
        })),
      setMonthlyBudget: (amount) =>
        set((state) => ({
          budgetConfig: {
            ...state.budgetConfig,
            monthlyBudget: amount,
            allocations: state.budgetConfig.allocations.map((alloc) => ({
              ...alloc,
              amount: (alloc.percentage / 100) * amount,
            })),
          },
        })),
      updateAllocation: (category, percentage) =>
        set((state) => {
          const newAllocations = state.budgetConfig.allocations.map((alloc) =>
            alloc.category === category
              ? {
                  ...alloc,
                  percentage,
                  amount: (percentage / 100) * state.budgetConfig.monthlyBudget,
                }
              : alloc
          );
          return {
            budgetConfig: {
              ...state.budgetConfig,
              allocations: newAllocations,
            },
          };
        }),
      addBudgetSpend: (spend) =>
        set((state) => ({
          budgetSpends: [spend, ...state.budgetSpends],
        })),
      deleteBudgetSpend: (id) =>
        set((state) => ({
          budgetSpends: state.budgetSpends.filter((s) => s.id !== id),
        })),
      optimizeBudget: (mode) =>
        set((state) => {
          const strategy = optimizationStrategies[mode];
          const newAllocations = state.budgetConfig.allocations.map((alloc) => ({
            ...alloc,
            percentage: strategy[alloc.category],
            amount: (strategy[alloc.category] / 100) * state.budgetConfig.monthlyBudget,
          }));
          return {
            budgetConfig: {
              ...state.budgetConfig,
              optimizationMode: mode,
              allocations: newAllocations,
            },
          };
        }),

      // Language Settings
      setDefaultLanguage: (language) =>
        set((state) => ({
          persona: state.persona
            ? { ...state.persona, defaultLanguage: language }
            : null,
        })),
      setPlatformLanguage: (platform, language) =>
        set((state) => {
          if (!state.persona) return {};
          const platformLanguages = { ...(state.persona.platformLanguages || {}) };
          if (language === null) {
            delete platformLanguages[platform];
          } else {
            platformLanguages[platform] = language;
          }
          return {
            persona: { ...state.persona, platformLanguages },
          };
        }),
    }),
    {
      name: 'soci-storage-v2',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        persona: state.persona,
        automationSettings: state.automationSettings,
        platformCredentials: state.platformCredentials,
        posts: state.posts,
        apiKeys: state.apiKeys,
        theme: state.theme,
        persistentNotifications: state.persistentNotifications,
        templates: state.templates,
        hashtagCollections: state.hashtagCollections,
        mediaItems: state.mediaItems,
        mediaFolders: state.mediaFolders,
        draftInProgress: state.draftInProgress,
        recentlyUsedTemplates: state.recentlyUsedTemplates,
        recentlyUsedHashtagCollections: state.recentlyUsedHashtagCollections,
        isAutonomousModeActive: state.isAutonomousModeActive,
        emergencyStopTriggeredAt: state.emergencyStopTriggeredAt,
        budgetConfig: state.budgetConfig,
        budgetSpends: state.budgetSpends,
      }),
    }
  )
);

// Helper function to get effective language for a platform
export function getEffectiveLanguage(platform: Platform): Language {
  const state = useAppStore.getState();
  if (!state.persona) return 'en';
  // Check for platform-specific language first
  const platformLang = state.persona.platformLanguages?.[platform];
  if (platformLang) return platformLang;
  // Fall back to default language
  return state.persona.defaultLanguage || 'en';
}
