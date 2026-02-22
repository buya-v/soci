import type { ContentSlice, SliceCreator } from '../types';

export const createContentSlice: SliceCreator<ContentSlice> = (set) => ({
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
      ].slice(0, 5),
    })),
  addRecentlyUsedHashtagCollection: (id) =>
    set((state) => ({
      recentlyUsedHashtagCollections: [
        id,
        ...state.recentlyUsedHashtagCollections.filter((c) => c !== id),
      ].slice(0, 5),
    })),
});
