import type { ConfigSlice, SliceCreator } from '../types';
import { defaultPersona, defaultApiKeys } from '../defaults';

export const createConfigSlice: SliceCreator<ConfigSlice> = (set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),

  apiKeys: defaultApiKeys,
  setApiKey: (provider, key) =>
    set((state) => ({
      apiKeys: { ...state.apiKeys, [provider]: key },
    })),
  clearApiKeys: () => set({ apiKeys: defaultApiKeys }),

  user: null,
  persona: defaultPersona,
  setUser: (user) => set({ user }),
  setPersona: (persona) => set({ persona }),
  updatePersona: (updates) =>
    set((state) => ({
      persona: state.persona ? { ...state.persona, ...updates } : null,
    })),

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
});
