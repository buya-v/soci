import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserState, Trend, Post } from '../types';
import { v4 as uuidv4 } from 'uuid'; // Simulated UUID

// Simulation helper
const generateUUID = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

const INITIAL_TRENDS: Trend[] = [
  {
    id: '1',
    topic: 'Generative AI Ethics',
    volume: '2.4M',
    confidence: 94,
    category: 'Tech',
    hashtags: ['#AI', '#TechEthics', '#FutureOfWork']
  },
  {
    id: '2',
    topic: 'Sustainable Minimalist Design',
    volume: '850K',
    confidence: 88,
    category: 'Design',
    hashtags: ['#Sustainability', '#DesignThinking', '#EcoFriendly']
  },
  {
    id: '3',
    topic: 'Remote Work Wellness',
    volume: '1.2M',
    confidence: 91,
    category: 'Lifestyle',
    hashtags: ['#WfhLife', '#MentalHealth', '#Productivity']
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: '101',
    content: 'The intersection of AI and ethics is not a roadblock, but a necessary checkpoint for sustainable innovation. 🤖✨',
    platform: 'linkedin',
    status: 'published',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    predictedEngagement: 'High'
  }
];

export const useSociStore = create<UserState>()(
  persist(
    (set) => ({
      user: {
        name: 'Alex Creator',
        role: 'Thought Leader',
        avatar: 'AC'
      },
      trends: INITIAL_TRENDS,
      posts: INITIAL_POSTS,
      isLoading: false,
      activeView: 'dashboard',
      
      setActiveView: (view) => set({ activeView: view }),
      
      generatePost: (trend) => {
        set({ isLoading: true });
        // Simulate AI Latency
        setTimeout(() => {
          const newPost: Post = {
            id: generateUUID(),
            content: `Exploring ${trend.topic} and what it means for our future. It's time to rethink our approach. ${trend.hashtags.join(' ')}`,
            platform: 'twitter',
            status: 'draft',
            timestamp: new Date().toISOString(),
            predictedEngagement: 'Medium'
          };
          set((state) => ({
            posts: [newPost, ...state.posts],
            isLoading: false,
            activeView: 'composer'
          }));
        }, 1500);
      },

      addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

      refreshTrends: async () => {
        set({ isLoading: true });
        // Simulate Network Call
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Shuffle confidence scores to simulate updates
        set((state) => ({
          trends: state.trends.map(t => ({
            ...t,
            confidence: Math.floor(Math.random() * (99 - 70) + 70)
          })),
          isLoading: false
        }));
      }
    }),
    {
      name: 'soci-storage-v1',
      partialize: (state) => ({ posts: state.posts, user: state.user }), // Don't persist UI state
    }
  )
);