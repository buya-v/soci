import type { MediaSlice, SliceCreator } from '../types';

export const createMediaSlice: SliceCreator<MediaSlice> = (set) => ({
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
});
