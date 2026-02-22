import { login as loginAPI } from '@/utils/auth';
import type { AuthSlice, SliceCreator } from '../types';

export const createAuthSlice: SliceCreator<AuthSlice> = (set) => ({
  isAuthenticated: false,
  login: async (password: string) => {
    // Development bypass for local testing
    if (import.meta.env.DEV && password === 'dev') {
      set({ isAuthenticated: true });
      return true;
    }
    // Use server-side bcrypt authentication
    const result = await loginAPI(password);
    if (result.success) {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false }),
});
