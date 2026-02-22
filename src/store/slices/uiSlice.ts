import type { StoreError, UISlice, SliceCreator } from '../types';
import { isDuplicateError } from '../utils/errorDedup';

export const createUISlice: SliceCreator<UISlice> = (set) => ({
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
      ].slice(0, 50),
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

  // Error State
  errorState: {
    errors: [],
    lastError: null,
    isRecoveryMode: false,
  },
  addError: (error) =>
    set((state) => {
      const now = Date.now();
      if (isDuplicateError(state.errorState.errors, error.message, now)) {
        console.warn('[SOCI-ERR] Duplicate error suppressed:', error.message);
        return {};
      }

      const newError: StoreError = {
        id: crypto.randomUUID(),
        message: error.message,
        stack: error.stack,
        source: error.source,
        timestamp: new Date().toISOString(),
        resolved: false,
      };

      console.error('[SOCI-ERR]', newError.message, error.stack || '');

      return {
        errorState: {
          ...state.errorState,
          errors: [newError, ...state.errorState.errors].slice(0, 20),
          lastError: newError,
        },
      };
    }),
  clearErrors: () =>
    set((state) => ({
      errorState: {
        ...state.errorState,
        errors: [],
        lastError: null,
      },
    })),
  resolveError: (id) =>
    set((state) => ({
      errorState: {
        ...state.errorState,
        errors: state.errorState.errors.map((e) =>
          e.id === id ? { ...e, resolved: true } : e
        ),
      },
    })),
  setRecoveryMode: (active) =>
    set((state) => ({
      errorState: {
        ...state.errorState,
        isRecoveryMode: active,
      },
    })),
});
