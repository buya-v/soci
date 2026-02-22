import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Platform, Language } from '@/types';
import type { AppState } from './types';

import { createAuthSlice } from './slices/authSlice';
import { createConfigSlice } from './slices/configSlice';
import { createContentSlice } from './slices/contentSlice';
import { createMediaSlice } from './slices/mediaSlice';
import { createAutomationSlice } from './slices/automationSlice';
import { createBudgetSlice } from './slices/budgetSlice';
import { createUISlice } from './slices/uiSlice';

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createConfigSlice(...a),
      ...createContentSlice(...a),
      ...createMediaSlice(...a),
      ...createAutomationSlice(...a),
      ...createBudgetSlice(...a),
      ...createUISlice(...a),
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

// Re-export types for backward compatibility
export type { ApiKeys, Theme, ErrorState, PersistentNotification } from './types';
export { type StoreError as AppError } from './types';
