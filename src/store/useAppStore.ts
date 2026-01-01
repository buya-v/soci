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
} from '@/types';

export interface ApiKeys {
  anthropic: string;
  openai: string;
}

export type Theme = 'dark' | 'light' | 'system';

interface AppState {
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
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'soci-storage-v2',
      partialize: (state) => ({
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
      }),
    }
  )
);
