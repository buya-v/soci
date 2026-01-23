import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import type { Platform, Persona, Post } from '@/types';

// Helper to extract error message from various error formats
function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    if (typeof err.message === 'string') return err.message;
    if (typeof err.error === 'string') return err.error;
  }
  return fallback;
}

// Query Keys
export const queryKeys = {
  trends: ['trends'] as const,
  analytics: ['analytics'] as const,
  posts: ['posts'] as const,
  activities: ['activities'] as const,
};

// Trends
export function useTrends() {
  return useQuery({
    queryKey: queryKeys.trends,
    queryFn: api.getTrends,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useRefreshTrends() {
  const queryClient = useQueryClient();
  const addActivity = useAppStore((state) => state.addActivity);

  return useMutation({
    mutationFn: api.refreshTrends,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.trends, data);
      addActivity({
        id: crypto.randomUUID(),
        action: 'Trends Refreshed',
        description: `Found ${data.length} trending topics`,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    },
  });
}

// Analytics
export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: api.getAnalytics,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2,
  });
}

// Activities
export function useActivities() {
  return useQuery({
    queryKey: queryKeys.activities,
    queryFn: api.getActivities,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Content Generation
export function useGenerateContent() {
  const addPost = useAppStore((state) => state.addPost);
  const addActivity = useAppStore((state) => state.addActivity);
  const addNotification = useAppStore((state) => state.addNotification);
  const addError = useAppStore((state) => state.addError);

  return useMutation({
    mutationFn: (params: { topic: string; tone: Persona['tone']; platform: Platform }) =>
      api.generateContent(params),
    onSuccess: (data, variables) => {
      const newPost: Post = {
        id: data.id,
        content: data.caption,
        caption: data.caption,
        hashtags: data.hashtags,
        platform: variables.platform,
        status: 'draft',
        imageUrl: data.imageUrl,
      };
      addPost(newPost);
      addActivity({
        id: crypto.randomUUID(),
        action: 'Content Generated',
        description: `New ${variables.tone} post for ${variables.platform}`,
        timestamp: new Date().toISOString(),
        status: 'success',
        platform: variables.platform,
      });
      addNotification({
        type: 'success',
        title: 'Content Generated',
        message: 'Your AI-powered content is ready!',
        duration: 5000,
      });
    },
    onError: (error, variables) => {
      const message = getErrorMessage(error, 'Content generation failed');
      addError({
        message: `Content generation failed for ${variables.platform}: ${message}`,
        source: 'useGenerateContent',
      });
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: message.includes('API') ? message : 'Unable to generate content. Please try again.',
        duration: 5000,
      });
    },
  });
}

// Posts
export function usePosts() {
  return useQuery({
    queryKey: queryKeys.posts,
    queryFn: api.getPosts,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const addActivity = useAppStore((state) => state.addActivity);

  return useMutation({
    mutationFn: (post: Omit<Post, 'id'>) => api.createPost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      addActivity({
        id: crypto.randomUUID(),
        action: 'Post Created',
        description: `New ${data.platform} post created`,
        timestamp: new Date().toISOString(),
        status: 'success',
        platform: data.platform,
      });
    },
  });
}

export function useSchedulePost() {
  const queryClient = useQueryClient();
  const addActivity = useAppStore((state) => state.addActivity);
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation({
    mutationFn: ({ postId, scheduledAt }: { postId: string; scheduledAt: Date }) =>
      api.schedulePost(postId, scheduledAt),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      addActivity({
        id: crypto.randomUUID(),
        action: 'Post Scheduled',
        description: `Scheduled for ${data.scheduledAt?.toLocaleString()}`,
        timestamp: new Date().toISOString(),
        status: 'success',
        platform: data.platform,
      });
      addNotification({
        type: 'success',
        title: 'Post Scheduled',
        message: `Your post will be published at ${data.scheduledAt?.toLocaleString()}`,
        duration: 5000,
      });
    },
  });
}

export function usePublishPost() {
  const queryClient = useQueryClient();
  const addActivity = useAppStore((state) => state.addActivity);
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation({
    mutationFn: (postId: string) => api.publishPost(postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      addActivity({
        id: crypto.randomUUID(),
        action: 'Post Published',
        description: `Successfully published to ${data.platform}`,
        timestamp: new Date().toISOString(),
        status: 'success',
        platform: data.platform,
      });
      addNotification({
        type: 'success',
        title: 'Post Published!',
        message: 'Your content is now live.',
        duration: 5000,
      });
    },
  });
}

// Video Generation
export function useGenerateVideo() {
  const addActivity = useAppStore((state) => state.addActivity);
  const addNotification = useAppStore((state) => state.addNotification);
  const addError = useAppStore((state) => state.addError);

  return useMutation({
    mutationFn: (params: { prompt: string; aspectRatio: string; resolution: string }) =>
      api.generateVideo(params),
    onSuccess: () => {
      addActivity({
        id: crypto.randomUUID(),
        action: 'Video Generated',
        description: 'AI video synthesis complete',
        timestamp: new Date().toISOString(),
        status: 'success',
      });
      addNotification({
        type: 'success',
        title: 'Video Ready',
        message: 'Your AI-generated video is ready to download.',
        duration: 5000,
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Video generation failed');
      addError({
        message: `Video generation failed: ${message}`,
        source: 'useGenerateVideo',
      });
      addNotification({
        type: 'error',
        title: 'Video Generation Failed',
        message: message.includes('API') ? message : 'Unable to generate video. Please try again.',
        duration: 5000,
      });
    },
  });
}

// Platform Connections
export function useConnectPlatform() {
  const updatePlatformCredential = useAppStore((state) => state.updatePlatformCredential);
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation({
    mutationFn: (platform: Platform) => api.connectPlatform(platform),
    onSuccess: (_data, platform) => {
      // In real app, this would redirect to OAuth
      updatePlatformCredential(platform, { isConnected: true });
      addNotification({
        type: 'success',
        title: 'Platform Connected',
        message: `Successfully connected to ${platform}`,
        duration: 5000,
      });
    },
  });
}

export function useDisconnectPlatform() {
  const updatePlatformCredential = useAppStore((state) => state.updatePlatformCredential);
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation({
    mutationFn: (platform: Platform) => api.disconnectPlatform(platform),
    onSuccess: (_, platform) => {
      updatePlatformCredential(platform, { isConnected: false, username: undefined });
      addNotification({
        type: 'info',
        title: 'Platform Disconnected',
        message: `${platform} has been disconnected`,
        duration: 5000,
      });
    },
  });
}
