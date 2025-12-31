import { create } from 'zustand';
import { ActivityLog, Persona, GeneratedPost } from '../types';
import { v4 as uuidv4 } from 'uuid'; // We'll simulate UUID since we can't install packages, usually we'd import v4. For this example we use a helper.

const generateId = () => Math.random().toString(36).substring(2, 9);

interface SociState {
  isAiActive: boolean;
  persona: Persona;
  logs: ActivityLog[];
  posts: GeneratedPost[];
  
  toggleAi: () => void;
  setPersona: (persona: Persona) => void;
  addLog: (message: string, type: ActivityLog['type']) => void;
  addPost: (post: Omit<GeneratedPost, 'id'>) => void;
}

export const useSociStore = create<SociState>((set) => ({
  isAiActive: false,
  persona: {
    tone: 'Professional yet Witty',
    niche: 'AI & Tech',
    forbiddenKeywords: ['crypto', 'nft'],
    targetAudience: 'Software Engineers'
  },
  logs: [
    { id: '1', timestamp: new Date(Date.now() - 1000 * 60 * 5), message: 'System initialized successfully', type: 'info' },
    { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 2), message: 'Connected to X API (v2)', type: 'success' },
  ],
  posts: [],

  toggleAi: () => set((state) => {
    const newState = !state.isAiActive;
    const logMessage = newState ? 'Autonomous Mode ENABLED. Scanning for trends...' : 'Autonomous Mode PAUSED.';
    const logType = newState ? 'success' : 'warning';
    
    // Side effect handled in component for interval, but we log here
    return { 
      isAiActive: newState,
      logs: [
        { id: generateId(), timestamp: new Date(), message: logMessage, type: logType },
        ...state.logs
      ]
    };
  }),

  setPersona: (persona) => set({ persona }),
  
  addLog: (message, type) => set((state) => ({
    logs: [{ id: generateId(), timestamp: new Date(), message, type }, ...state.logs]
  })),

  addPost: (post) => set((state) => ({
    posts: [{ ...post, id: generateId() }, ...state.posts]
  }))
}));