import type { ViewType } from './types';

export const VIEW_TO_PATH: Record<ViewType, string> = {
  dashboard: '/',
  trends: '/trends',
  content: '/content',
  templates: '/templates',
  hashtags: '/hashtags',
  media: '/media',
  drafts: '/drafts',
  published: '/published',
  calendar: '/calendar',
  video: '/video',
  automation: '/automation',
  budget: '/budget',
  plans: '/plans',
};

export const PATH_TO_VIEW: Record<string, ViewType> = Object.fromEntries(
  Object.entries(VIEW_TO_PATH).map(([view, path]) => [path, view as ViewType])
) as Record<string, ViewType>;
