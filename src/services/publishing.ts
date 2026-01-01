import type { Platform, Post } from '@/types';

export interface PlatformConfig {
  id: Platform;
  name: string;
  maxLength: number;
  hashtagLimit: number;
  supportsImages: boolean;
  supportsVideo: boolean;
  supportsLinks: boolean;
  optimalTimes: string[];
  audienceActive: string;
}

export const platformConfigs: Record<Platform, PlatformConfig> = {
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    maxLength: 280,
    hashtagLimit: 3,
    supportsImages: true,
    supportsVideo: true,
    supportsLinks: true,
    optimalTimes: ['9:00 AM', '12:00 PM', '5:00 PM'],
    audienceActive: 'Weekdays, business hours',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    maxLength: 3000,
    hashtagLimit: 5,
    supportsImages: true,
    supportsVideo: true,
    supportsLinks: true,
    optimalTimes: ['7:00 AM', '12:00 PM', '5:00 PM'],
    audienceActive: 'Weekdays, especially Tue-Thu',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    maxLength: 2200,
    hashtagLimit: 30,
    supportsImages: true,
    supportsVideo: true,
    supportsLinks: false,
    optimalTimes: ['11:00 AM', '2:00 PM', '7:00 PM'],
    audienceActive: 'Evenings and weekends',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    maxLength: 300,
    hashtagLimit: 5,
    supportsImages: false,
    supportsVideo: true,
    supportsLinks: false,
    optimalTimes: ['7:00 PM', '8:00 PM', '9:00 PM'],
    audienceActive: 'Evenings, especially weekends',
  },
};

export interface PublishingPreview {
  platform: Platform;
  content: string;
  truncated: boolean;
  characterCount: number;
  maxCharacters: number;
  hashtags: string[];
  hashtagsIncluded: number;
  warnings: string[];
  optimizations: string[];
}

// Prepare content for a specific platform
export function prepareForPlatform(
  content: string,
  hashtags: string[],
  platform: Platform
): PublishingPreview {
  const config = platformConfigs[platform];
  const warnings: string[] = [];
  const optimizations: string[] = [];

  // Truncate content if needed
  let truncated = false;
  let preparedContent = content;

  if (content.length > config.maxLength) {
    preparedContent = content.slice(0, config.maxLength - 3) + '...';
    truncated = true;
    warnings.push(`Content truncated to ${config.maxLength} characters`);
  }

  // Handle hashtags
  const hashtagsToInclude = hashtags.slice(0, config.hashtagLimit);
  if (hashtags.length > config.hashtagLimit) {
    warnings.push(`Only ${config.hashtagLimit} hashtags will be included (${hashtags.length} provided)`);
  }

  // Platform-specific optimizations
  switch (platform) {
    case 'twitter':
      if (content.length > 200) {
        optimizations.push('Consider using a thread for longer content');
      }
      if (!content.includes('?') && !content.includes('!')) {
        optimizations.push('Adding a question or call-to-action may boost engagement');
      }
      break;

    case 'linkedin':
      if (!content.includes('\n')) {
        optimizations.push('Use line breaks for better readability');
      }
      if (content.length < 100) {
        optimizations.push('Longer posts (500-1000 chars) perform better on LinkedIn');
      }
      break;

    case 'instagram':
      if (hashtags.length < 10) {
        optimizations.push('Consider using more hashtags (10-20 recommended)');
      }
      if (!config.supportsLinks && content.includes('http')) {
        warnings.push('Links in captions are not clickable on Instagram');
        optimizations.push('Use "link in bio" instead of direct URLs');
      }
      break;

    case 'tiktok':
      if (content.length > 150) {
        optimizations.push('Shorter captions work better on TikTok');
      }
      break;
  }

  return {
    platform,
    content: preparedContent,
    truncated,
    characterCount: preparedContent.length,
    maxCharacters: config.maxLength,
    hashtags: hashtagsToInclude,
    hashtagsIncluded: hashtagsToInclude.length,
    warnings,
    optimizations,
  };
}

// Prepare content for all platforms
export function prepareForAllPlatforms(
  content: string,
  hashtags: string[]
): PublishingPreview[] {
  return Object.keys(platformConfigs).map((platform) =>
    prepareForPlatform(content, hashtags, platform as Platform)
  );
}

// Get optimal posting time for a platform
export function getOptimalPostTime(platform: Platform): Date {
  const config = platformConfigs[platform];
  const now = new Date();

  // Parse the first optimal time
  const optimalTimeStr = config.optimalTimes[0];
  const [time, period] = optimalTimeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  let hour = hours;
  if (period === 'PM' && hours !== 12) hour += 12;
  if (period === 'AM' && hours === 12) hour = 0;

  const optimalDate = new Date(now);
  optimalDate.setHours(hour, minutes, 0, 0);

  // If the time has passed today, schedule for tomorrow
  if (optimalDate <= now) {
    optimalDate.setDate(optimalDate.getDate() + 1);
  }

  return optimalDate;
}

// Format content with hashtags for a platform
export function formatWithHashtags(
  content: string,
  hashtags: string[],
  platform: Platform
): string {
  const config = platformConfigs[platform];
  const limitedHashtags = hashtags.slice(0, config.hashtagLimit);
  const hashtagString = limitedHashtags.map(h => `#${h.replace(/^#/, '')}`).join(' ');

  switch (platform) {
    case 'twitter':
      // Inline hashtags or at the end
      return `${content}\n\n${hashtagString}`.trim();

    case 'linkedin':
      // Hashtags at the end, separated
      return `${content}\n\n${hashtagString}`.trim();

    case 'instagram':
      // Multiple line breaks before hashtags
      return `${content}\n\n.\n.\n.\n\n${hashtagString}`.trim();

    case 'tiktok':
      // Hashtags inline with content
      return `${content} ${hashtagString}`.trim();

    default:
      return `${content} ${hashtagString}`.trim();
  }
}

export interface PublishResult {
  success: boolean;
  platform: Platform;
  postId?: string;
  url?: string;
  error?: string;
}

// Simulate publishing (in production, this would call actual APIs)
export async function publishToplatform(
  _post: Post,
  platform: Platform
): Promise<PublishResult> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Simulate success/failure (90% success rate for demo)
  const success = Math.random() > 0.1;

  if (success) {
    return {
      success: true,
      platform,
      postId: `${platform}-${Date.now()}`,
      url: `https://${platform}.com/post/${Date.now()}`,
    };
  } else {
    return {
      success: false,
      platform,
      error: 'API rate limit exceeded. Please try again later.',
    };
  }
}

// Cross-post to multiple platforms
export async function crossPost(
  post: Post,
  platforms: Platform[]
): Promise<PublishResult[]> {
  const results = await Promise.all(
    platforms.map(platform => publishToplatform(post, platform))
  );
  return results;
}
