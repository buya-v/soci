import type { Platform, Post } from '@/types';

// Engagement prediction based on content analysis
export interface EngagementPrediction {
  score: number; // 0-100
  confidence: number; // 0-100
  factors: PredictionFactor[];
  suggestions: string[];
  estimatedReach: number;
  estimatedEngagement: number;
  bestTimeToPost: Date;
  viralPotential: 'low' | 'medium' | 'high';
}

export interface PredictionFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number; // -10 to +10
  description: string;
}

// Platform-specific optimal times (based on general social media research)
const optimalPostingTimes: Record<Platform, { days: number[]; hours: number[] }> = {
  instagram: {
    days: [1, 2, 3, 4, 5], // Mon-Fri
    hours: [11, 13, 19, 20], // 11am, 1pm, 7pm, 8pm
  },
  twitter: {
    days: [1, 2, 3, 4, 5],
    hours: [9, 12, 17, 18], // 9am, 12pm, 5pm, 6pm
  },
  linkedin: {
    days: [1, 2, 3, 4], // Mon-Thu
    hours: [7, 8, 12, 17], // 7am, 8am, 12pm, 5pm
  },
  tiktok: {
    days: [1, 2, 3, 4, 5, 6, 0], // All week
    hours: [7, 9, 12, 15, 19], // Morning and afternoon peaks
  },
};

// Character limits that perform well
const optimalCharacterRanges: Record<Platform, { min: number; max: number; ideal: number }> = {
  instagram: { min: 138, max: 150, ideal: 138 },
  twitter: { min: 71, max: 100, ideal: 71 },
  linkedin: { min: 150, max: 300, ideal: 200 },
  tiktok: { min: 20, max: 100, ideal: 50 },
};

// Hashtag recommendations per platform
const hashtagCounts: Record<Platform, { min: number; max: number; ideal: number }> = {
  instagram: { min: 5, max: 30, ideal: 11 },
  twitter: { min: 1, max: 3, ideal: 2 },
  linkedin: { min: 3, max: 5, ideal: 3 },
  tiktok: { min: 3, max: 5, ideal: 4 },
};

// Engagement trigger words
const engagementTriggers = [
  'you', 'your', 'free', 'new', 'now', 'today',
  'discover', 'learn', 'secret', 'proven', 'exclusive',
  'limited', 'save', 'easy', 'simple', 'quick',
];

const questionWords = ['how', 'what', 'why', 'when', 'where', 'who', 'which', 'can', 'do', 'does'];
const ctaWords = ['click', 'share', 'comment', 'follow', 'subscribe', 'join', 'get', 'try', 'start'];
const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

// Analyze content and predict engagement
export function predictEngagement(
  content: string,
  hashtags: string[],
  platform: Platform,
  scheduledTime?: Date
): EngagementPrediction {
  const factors: PredictionFactor[] = [];
  let score = 50; // Start at baseline

  // 1. Content length analysis
  const charRange = optimalCharacterRanges[platform];
  const contentLength = content.length;

  if (contentLength >= charRange.min && contentLength <= charRange.max) {
    score += 10;
    factors.push({
      name: 'Optimal Length',
      impact: 'positive',
      weight: 10,
      description: `Content length (${contentLength} chars) is in the optimal range for ${platform}`,
    });
  } else if (contentLength < charRange.min) {
    score -= 5;
    factors.push({
      name: 'Short Content',
      impact: 'negative',
      weight: -5,
      description: `Content is shorter than recommended (${charRange.min}+ chars work better)`,
    });
  } else if (contentLength > charRange.max * 2) {
    score -= 8;
    factors.push({
      name: 'Long Content',
      impact: 'negative',
      weight: -8,
      description: `Content may be too long for ${platform}. Consider shortening.`,
    });
  }

  // 2. Hashtag analysis
  const hashtagRange = hashtagCounts[platform];
  const hashtagCount = hashtags.length;

  if (hashtagCount >= hashtagRange.min && hashtagCount <= hashtagRange.max) {
    score += 8;
    factors.push({
      name: 'Good Hashtag Count',
      impact: 'positive',
      weight: 8,
      description: `Using ${hashtagCount} hashtags (optimal: ${hashtagRange.ideal})`,
    });
  } else if (hashtagCount === 0) {
    score -= 10;
    factors.push({
      name: 'No Hashtags',
      impact: 'negative',
      weight: -10,
      description: 'Posts with hashtags get significantly more reach',
    });
  } else if (hashtagCount > hashtagRange.max) {
    score -= 5;
    factors.push({
      name: 'Too Many Hashtags',
      impact: 'negative',
      weight: -5,
      description: `${hashtagCount} hashtags may look spammy. Try ${hashtagRange.ideal} for ${platform}`,
    });
  }

  // 3. Engagement trigger words
  const lowerContent = content.toLowerCase();
  const triggerCount = engagementTriggers.filter(word =>
    lowerContent.includes(word)
  ).length;

  if (triggerCount >= 3) {
    score += 8;
    factors.push({
      name: 'Engaging Language',
      impact: 'positive',
      weight: 8,
      description: 'Content uses power words that drive engagement',
    });
  } else if (triggerCount >= 1) {
    score += 4;
    factors.push({
      name: 'Some Engaging Words',
      impact: 'positive',
      weight: 4,
      description: 'Content includes some engagement triggers',
    });
  }

  // 4. Question check (questions drive comments)
  const hasQuestion = content.includes('?') ||
    questionWords.some(word => lowerContent.startsWith(word) || lowerContent.includes(` ${word} `));

  if (hasQuestion) {
    score += 7;
    factors.push({
      name: 'Includes Question',
      impact: 'positive',
      weight: 7,
      description: 'Questions encourage comments and discussion',
    });
  }

  // 5. Call to action check
  const hasCTA = ctaWords.some(word => lowerContent.includes(word));

  if (hasCTA) {
    score += 6;
    factors.push({
      name: 'Clear CTA',
      impact: 'positive',
      weight: 6,
      description: 'Has a call-to-action that encourages engagement',
    });
  } else {
    factors.push({
      name: 'Missing CTA',
      impact: 'neutral',
      weight: 0,
      description: 'Consider adding a call-to-action to boost engagement',
    });
  }

  // 6. Emoji usage (platform specific)
  const emojiMatches = content.match(emojiPattern);
  const emojiCount = emojiMatches ? emojiMatches.length : 0;

  if (platform === 'linkedin') {
    if (emojiCount <= 2) {
      score += 3;
      factors.push({
        name: 'Professional Emoji Use',
        impact: 'positive',
        weight: 3,
        description: 'Minimal emoji use is appropriate for LinkedIn',
      });
    } else if (emojiCount > 5) {
      score -= 5;
      factors.push({
        name: 'Too Many Emojis',
        impact: 'negative',
        weight: -5,
        description: 'LinkedIn posts perform better with fewer emojis',
      });
    }
  } else {
    if (emojiCount >= 1 && emojiCount <= 5) {
      score += 5;
      factors.push({
        name: 'Good Emoji Use',
        impact: 'positive',
        weight: 5,
        description: 'Emojis help posts stand out and express emotion',
      });
    } else if (emojiCount === 0) {
      factors.push({
        name: 'No Emojis',
        impact: 'neutral',
        weight: 0,
        description: 'Adding 1-3 emojis could increase engagement',
      });
    }
  }

  // 7. First line hook analysis
  const firstLine = content.split('\n')[0];
  if (firstLine.length <= 80 && (firstLine.includes('!') || firstLine.includes('?') || firstLine.endsWith('...'))) {
    score += 5;
    factors.push({
      name: 'Strong Hook',
      impact: 'positive',
      weight: 5,
      description: 'Opening line is attention-grabbing',
    });
  }

  // 8. Timing analysis
  const postTime = scheduledTime || new Date();
  const optimalTimes = optimalPostingTimes[platform];
  const postHour = postTime.getHours();
  const postDay = postTime.getDay();

  const isOptimalHour = optimalTimes.hours.includes(postHour);
  const isOptimalDay = optimalTimes.days.includes(postDay);

  if (isOptimalHour && isOptimalDay) {
    score += 10;
    factors.push({
      name: 'Optimal Posting Time',
      impact: 'positive',
      weight: 10,
      description: `Scheduled for peak engagement time on ${platform}`,
    });
  } else if (isOptimalHour || isOptimalDay) {
    score += 5;
    factors.push({
      name: 'Good Posting Time',
      impact: 'positive',
      weight: 5,
      description: 'Posting time is partially optimized',
    });
  } else {
    factors.push({
      name: 'Suboptimal Time',
      impact: 'neutral',
      weight: 0,
      description: 'Consider scheduling for better engagement times',
    });
  }

  // Calculate viral potential
  let viralPotential: 'low' | 'medium' | 'high' = 'low';
  if (score >= 80) viralPotential = 'high';
  else if (score >= 60) viralPotential = 'medium';

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Generate suggestions
  const suggestions = generateSuggestions(factors, platform);

  // Calculate best time to post
  const bestTimeToPost = calculateBestPostTime(platform);

  // Estimate reach and engagement (simplified model)
  const baseReach = platform === 'tiktok' ? 5000 : platform === 'instagram' ? 2000 : 1000;
  const estimatedReach = Math.round(baseReach * (score / 100) * (1 + Math.random() * 0.3));
  const estimatedEngagement = Math.round(estimatedReach * (score / 100) * 0.05);

  return {
    score,
    confidence: calculateConfidence(factors),
    factors,
    suggestions,
    estimatedReach,
    estimatedEngagement,
    bestTimeToPost,
    viralPotential,
  };
}

function generateSuggestions(factors: PredictionFactor[], platform: Platform): string[] {
  const suggestions: string[] = [];

  const negativeFactors = factors.filter(f => f.impact === 'negative');
  const neutralFactors = factors.filter(f => f.impact === 'neutral');

  // Add suggestions based on issues
  negativeFactors.forEach(factor => {
    switch (factor.name) {
      case 'No Hashtags':
        suggestions.push(`Add ${hashtagCounts[platform].ideal} relevant hashtags to increase discoverability`);
        break;
      case 'Too Many Hashtags':
        suggestions.push(`Reduce hashtags to ${hashtagCounts[platform].ideal} for better performance`);
        break;
      case 'Short Content':
        suggestions.push('Expand your content with more context or storytelling');
        break;
      case 'Long Content':
        suggestions.push('Trim content to the most impactful points');
        break;
      case 'Too Many Emojis':
        suggestions.push('Remove some emojis for a more professional tone');
        break;
    }
  });

  neutralFactors.forEach(factor => {
    switch (factor.name) {
      case 'Missing CTA':
        suggestions.push('Add a call-to-action like "Double tap if you agree" or "Share your thoughts"');
        break;
      case 'No Emojis':
        if (platform !== 'linkedin') {
          suggestions.push('Add 1-3 relevant emojis to make your post more eye-catching');
        }
        break;
      case 'Suboptimal Time':
        const times = optimalPostingTimes[platform];
        suggestions.push(`Try posting at ${times.hours[0]}:00 or ${times.hours[1]}:00 for better reach`);
        break;
    }
  });

  // Always add a positive suggestion
  if (suggestions.length === 0) {
    suggestions.push('Your content is well-optimized! Consider A/B testing different hooks.');
  }

  return suggestions.slice(0, 4); // Max 4 suggestions
}

function calculateConfidence(factors: PredictionFactor[]): number {
  // More factors = higher confidence in prediction
  const factorCount = factors.length;
  const positiveWeight = factors.filter(f => f.impact === 'positive').length;

  let confidence = 60 + (factorCount * 3) + (positiveWeight * 2);
  return Math.min(95, confidence);
}

function calculateBestPostTime(platform: Platform): Date {
  const now = new Date();
  const optimal = optimalPostingTimes[platform];

  // Find next optimal hour
  let targetDate = new Date(now);
  let found = false;

  for (let dayOffset = 0; dayOffset < 7 && !found; dayOffset++) {
    targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + dayOffset);

    if (optimal.days.includes(targetDate.getDay())) {
      for (const hour of optimal.hours) {
        targetDate.setHours(hour, 0, 0, 0);
        if (targetDate > now) {
          found = true;
          break;
        }
      }
    }
  }

  return targetDate;
}

// Get trending hashtag suggestions based on content
export function suggestHashtags(content: string, platform: Platform, existingHashtags: string[]): string[] {
  // Common high-performing hashtags by platform
  const platformHashtags: Record<Platform, string[]> = {
    instagram: [
      'instagood', 'photooftheday', 'love', 'beautiful', 'happy',
      'instadaily', 'picoftheday', 'photography', 'art', 'nature',
      'travel', 'style', 'fashion', 'food', 'fitness',
      'motivation', 'inspiration', 'business', 'entrepreneur', 'success',
    ],
    twitter: [
      'trending', 'viral', 'news', 'tech', 'ai',
      'innovation', 'startup', 'growth', 'tips', 'howto',
    ],
    linkedin: [
      'leadership', 'innovation', 'career', 'business', 'networking',
      'growth', 'success', 'entrepreneurship', 'mindset', 'learning',
    ],
    tiktok: [
      'fyp', 'foryou', 'viral', 'trending', 'foryoupage',
      'tiktok', 'funny', 'duet', 'trend', 'viral',
    ],
  };

  // Content-based keyword extraction (simple version)
  const contentWords = content.toLowerCase().split(/\s+/);
  const keywordHashtags: string[] = [];

  // Check for common topics in content
  const topicKeywords: Record<string, string[]> = {
    tech: ['technology', 'ai', 'coding', 'developer', 'programming', 'software'],
    business: ['business', 'entrepreneur', 'startup', 'company', 'marketing'],
    fitness: ['fitness', 'workout', 'gym', 'health', 'exercise', 'training'],
    food: ['food', 'recipe', 'cooking', 'delicious', 'meal', 'restaurant'],
    travel: ['travel', 'vacation', 'adventure', 'explore', 'destination'],
    lifestyle: ['lifestyle', 'daily', 'routine', 'life', 'living'],
  };

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(kw => contentWords.includes(kw) || content.toLowerCase().includes(kw))) {
      keywordHashtags.push(topic);
    }
  });

  // Combine platform hashtags with content-based ones
  const suggestions = [
    ...keywordHashtags,
    ...platformHashtags[platform],
  ].filter(tag => !existingHashtags.includes(tag));

  // Return unique suggestions
  return [...new Set(suggestions)].slice(0, 10);
}

// Analyze a post for improvement
export function analyzePost(post: Post): {
  prediction: EngagementPrediction;
  improvements: string[];
  competitiveScore: number;
} {
  const prediction = predictEngagement(
    post.content || post.caption || '',
    post.hashtags,
    post.platform,
    post.scheduledAt
  );

  const improvements: string[] = [];

  // Add specific improvements based on prediction
  if (prediction.score < 60) {
    improvements.push('Consider rewriting with a stronger hook');
  }
  if (prediction.viralPotential === 'low') {
    improvements.push('Add trending hashtags to increase visibility');
  }

  // Competitive score (how it compares to average posts)
  const competitiveScore = Math.min(100, prediction.score + Math.random() * 10);

  return {
    prediction,
    improvements: [...improvements, ...prediction.suggestions],
    competitiveScore,
  };
}
