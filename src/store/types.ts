import type { StateCreator } from 'zustand';
import type {
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

// --- Store-specific types ---

export interface ApiKeys {
  anthropic: string;
  openai: string;
  gemini: string;
}

export type Theme = 'dark' | 'light' | 'system';

export interface DraftInProgress {
  caption: string;
  hashtags: string[];
  platform: string;
  topic: string;
  imageUrl?: string;
  savedAt: string;
}

export interface Notification {
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

// Renamed from AppError to avoid conflict with @/types AppError (different shape)
export interface StoreError {
  id: string;
  message: string;
  stack?: string;
  timestamp: string;
  source?: string;
  resolved: boolean;
}

export interface ErrorState {
  errors: StoreError[];
  lastError: StoreError | null;
  isRecoveryMode: boolean;
}

// --- Slice interfaces ---

export interface AuthSlice {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

export interface ConfigSlice {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  apiKeys: ApiKeys;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  clearApiKeys: () => void;
  user: User | null;
  persona: Persona | null;
  setUser: (user: User | null) => void;
  setPersona: (persona: Persona) => void;
  updatePersona: (updates: Partial<Persona>) => void;
  setDefaultLanguage: (language: Language) => void;
  setPlatformLanguage: (platform: Platform, language: Language | null) => void;
}

export interface ContentSlice {
  trends: Trend[];
  setTrends: (trends: Trend[]) => void;
  addTrend: (trend: Trend) => void;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  templates: ContentTemplate[];
  addTemplate: (template: ContentTemplate) => void;
  updateTemplate: (id: string, updates: Partial<ContentTemplate>) => void;
  deleteTemplate: (id: string) => void;
  incrementTemplateUsage: (id: string) => void;
  hashtagCollections: HashtagCollection[];
  addHashtagCollection: (collection: HashtagCollection) => void;
  updateHashtagCollection: (id: string, updates: Partial<HashtagCollection>) => void;
  deleteHashtagCollection: (id: string) => void;
  incrementHashtagCollectionUsage: (id: string) => void;
  draftInProgress: DraftInProgress | null;
  saveDraftInProgress: (draft: DraftInProgress) => void;
  clearDraftInProgress: () => void;
  recentlyUsedTemplates: string[];
  recentlyUsedHashtagCollections: string[];
  addRecentlyUsedTemplate: (id: string) => void;
  addRecentlyUsedHashtagCollection: (id: string) => void;
}

export interface MediaSlice {
  mediaItems: MediaItem[];
  mediaFolders: MediaFolder[];
  addMediaItem: (item: MediaItem) => void;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;
  deleteMediaItem: (id: string) => void;
  addMediaFolder: (folder: MediaFolder) => void;
  updateMediaFolder: (id: string, updates: Partial<MediaFolder>) => void;
  deleteMediaFolder: (id: string) => void;
}

export interface AutomationSlice {
  automationSettings: AutomationSettings;
  updateAutomationSettings: (settings: Partial<AutomationSettings>) => void;
  platformCredentials: PlatformCredential[];
  updatePlatformCredential: (platform: string, updates: Partial<PlatformCredential>) => void;
  activities: ActivityLog[];
  addActivity: (activity: ActivityLog) => void;
  clearActivities: () => void;
  isAutonomousModeActive: boolean;
  emergencyStopTriggeredAt: string | null;
  triggerEmergencyStop: () => void;
  resumeAutonomousMode: () => void;
}

export interface BudgetSlice {
  budgetConfig: BudgetConfig;
  budgetSpends: BudgetSpend[];
  setBudgetConfig: (config: Partial<BudgetConfig>) => void;
  setMonthlyBudget: (amount: number) => void;
  updateAllocation: (category: BudgetCategory, percentage: number) => void;
  addBudgetSpend: (spend: BudgetSpend) => void;
  deleteBudgetSpend: (id: string) => void;
  optimizeBudget: (mode: BudgetConfig['optimizationMode']) => void;
}

export interface UISlice {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  persistentNotifications: PersistentNotification[];
  addPersistentNotification: (notification: Omit<PersistentNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  errorState: ErrorState;
  addError: (error: Omit<StoreError, 'id' | 'timestamp' | 'resolved'>) => void;
  clearErrors: () => void;
  resolveError: (id: string) => void;
  setRecoveryMode: (active: boolean) => void;
}

// --- Composite type ---

export type AppState = AuthSlice &
  ConfigSlice &
  ContentSlice &
  MediaSlice &
  AutomationSlice &
  BudgetSlice &
  UISlice;

// --- Slice creator helper type ---

export type SliceCreator<T> = StateCreator<AppState, [], [], T>;
