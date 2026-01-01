import type { Platform, Post } from '@/types';

// Schedule optimization types
export interface OptimalSlot {
  date: Date;
  hour: number;
  platform: Platform;
  score: number; // 0-100
  reason: string;
  isRecommended: boolean;
}

export interface DaySchedule {
  date: Date;
  slots: OptimalSlot[];
  platformBest: Record<Platform, OptimalSlot | null>;
}

export interface WeekSchedule {
  startDate: Date;
  endDate: Date;
  days: DaySchedule[];
  topSlots: OptimalSlot[];
}

// Platform-specific optimal posting times based on engagement research
const platformOptimalHours: Record<Platform, { weekday: number[]; weekend: number[] }> = {
  instagram: {
    weekday: [6, 11, 13, 19, 20, 21], // Early morning, lunch, evening peaks
    weekend: [9, 10, 11, 17, 18, 19],
  },
  twitter: {
    weekday: [8, 9, 12, 17, 18], // Morning commute, lunch, end of workday
    weekend: [9, 12, 17],
  },
  linkedin: {
    weekday: [7, 8, 12, 17, 18], // Professional hours
    weekend: [], // LinkedIn activity drops significantly on weekends
  },
  tiktok: {
    weekday: [7, 9, 12, 15, 19, 21, 22], // Multiple peaks throughout day
    weekend: [9, 10, 11, 14, 15, 19, 20, 21],
  },
  facebook: {
    weekday: [9, 11, 13, 15, 19, 20], // Morning, lunch, afternoon, evening
    weekend: [10, 11, 12, 13, 14, 19, 20],
  },
};

// Day quality scores (0 = Sunday, 6 = Saturday)
const dayQualityScores: Record<Platform, Record<number, number>> = {
  instagram: { 0: 70, 1: 85, 2: 90, 3: 95, 4: 85, 5: 80, 6: 75 },
  twitter: { 0: 60, 1: 90, 2: 95, 3: 90, 4: 85, 5: 80, 6: 65 },
  linkedin: { 0: 20, 1: 95, 2: 100, 3: 95, 4: 90, 5: 70, 6: 25 },
  tiktok: { 0: 85, 1: 80, 2: 85, 3: 90, 4: 95, 5: 90, 6: 88 },
  facebook: { 0: 80, 1: 85, 2: 90, 3: 95, 4: 90, 5: 85, 6: 82 },
};

// Hour quality modifiers
const hourQualityModifiers: Record<number, number> = {
  0: 10, 1: 5, 2: 5, 3: 5, 4: 10, 5: 20,
  6: 40, 7: 60, 8: 75, 9: 80, 10: 70, 11: 85,
  12: 90, 13: 85, 14: 70, 15: 75, 16: 70, 17: 85,
  18: 90, 19: 95, 20: 90, 21: 80, 22: 60, 23: 30,
};

// Platform-specific reasons for time slots
const slotReasons: Record<Platform, Record<number, string>> = {
  instagram: {
    6: 'Early risers checking feeds',
    11: 'Mid-morning scroll break',
    13: 'Lunch break browsing',
    19: 'Evening wind-down time',
    20: 'Peak evening activity',
    21: 'Late evening engagement',
    9: 'Weekend morning leisure',
    10: 'Late morning relaxation',
    17: 'Pre-dinner scrolling',
    18: 'Evening entertainment',
  },
  twitter: {
    8: 'Morning news check',
    9: 'Work commute conversations',
    12: 'Lunch break discussions',
    17: 'End of workday catch-up',
    18: 'Evening trending topics',
  },
  linkedin: {
    7: 'Early professional networking',
    8: 'Pre-work industry updates',
    12: 'Lunch networking',
    17: 'End of business day review',
    18: 'Professional wind-down',
  },
  tiktok: {
    7: 'Morning entertainment fix',
    9: 'Mid-morning break',
    12: 'Lunch break videos',
    15: 'Afternoon entertainment',
    19: 'Prime evening viewing',
    21: 'Night owl content',
    22: 'Late night viral hour',
  },
  facebook: {
    9: 'Morning coffee scrolling',
    11: 'Late morning check-in',
    13: 'Lunch break sharing',
    15: 'Afternoon engagement',
    19: 'Family time browsing',
    20: 'Evening community activity',
  },
};

// Calculate slot score for a specific time and platform
function calculateSlotScore(date: Date, hour: number, platform: Platform): number {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Get optimal hours for this platform and day type
  const optimalHours = isWeekend
    ? platformOptimalHours[platform].weekend
    : platformOptimalHours[platform].weekday;

  // Base score from day quality
  const dayScore = dayQualityScores[platform][dayOfWeek];

  // Hour modifier
  const hourModifier = hourQualityModifiers[hour];

  // Bonus if it's an optimal hour for this platform
  const isOptimalHour = optimalHours.includes(hour);
  const optimalBonus = isOptimalHour ? 15 : 0;

  // Calculate final score (weighted average + bonus)
  const score = Math.min(100, Math.round((dayScore * 0.4) + (hourModifier * 0.5) + optimalBonus));

  return score;
}

// Get reason for a time slot
function getSlotReason(hour: number, platform: Platform, score: number): string {
  const platformReasons = slotReasons[platform];
  if (platformReasons[hour]) {
    return platformReasons[hour];
  }

  if (score >= 85) return 'High engagement window';
  if (score >= 70) return 'Good visibility period';
  if (score >= 50) return 'Moderate activity time';
  return 'Lower activity period';
}

// Generate optimal slots for a specific day
export function getOptimalSlotsForDay(date: Date, platforms: Platform[]): DaySchedule {
  const slots: OptimalSlot[] = [];
  const platformBest: Record<Platform, OptimalSlot | null> = {
    twitter: null,
    linkedin: null,
    instagram: null,
    tiktok: null,
    facebook: null,
  };

  // Generate slots for each platform and hour
  platforms.forEach((platform) => {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const optimalHours = isWeekend
      ? platformOptimalHours[platform].weekend
      : platformOptimalHours[platform].weekday;

    // Only consider optimal hours for each platform
    optimalHours.forEach((hour) => {
      const score = calculateSlotScore(date, hour, platform);
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);

      const slot: OptimalSlot = {
        date: slotDate,
        hour,
        platform,
        score,
        reason: getSlotReason(hour, platform, score),
        isRecommended: score >= 80,
      };

      slots.push(slot);

      // Track best slot per platform
      if (!platformBest[platform] || slot.score > platformBest[platform]!.score) {
        platformBest[platform] = slot;
      }
    });
  });

  // Sort slots by score
  slots.sort((a, b) => b.score - a.score);

  return {
    date,
    slots,
    platformBest,
  };
}

// Generate week schedule with optimal times
export function getWeekSchedule(
  startDate: Date,
  platforms: Platform[] = ['instagram', 'twitter', 'linkedin', 'tiktok', 'facebook']
): WeekSchedule {
  const days: DaySchedule[] = [];
  const allSlots: OptimalSlot[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const daySchedule = getOptimalSlotsForDay(date, platforms);
    days.push(daySchedule);
    allSlots.push(...daySchedule.slots);
  }

  // Get top 10 slots across the week
  const topSlots = allSlots
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return {
    startDate,
    endDate,
    days,
    topSlots,
  };
}

// Find next best posting time for a specific platform
export function getNextBestTime(platform: Platform, fromDate: Date = new Date()): OptimalSlot {
  const now = fromDate;
  const currentHour = now.getHours();

  // Check remaining hours today
  for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + daysAhead);
    checkDate.setHours(0, 0, 0, 0);

    const dayOfWeek = checkDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const optimalHours = isWeekend
      ? platformOptimalHours[platform].weekend
      : platformOptimalHours[platform].weekday;

    for (const hour of optimalHours) {
      // Skip past hours on the current day
      if (daysAhead === 0 && hour <= currentHour) continue;

      const slotDate = new Date(checkDate);
      slotDate.setHours(hour, 0, 0, 0);

      const score = calculateSlotScore(slotDate, hour, platform);

      // Return first slot with good score
      if (score >= 70) {
        return {
          date: slotDate,
          hour,
          platform,
          score,
          reason: getSlotReason(hour, platform, score),
          isRecommended: score >= 80,
        };
      }
    }
  }

  // Fallback: return tomorrow's first optimal hour
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowDay = tomorrow.getDay();
  const isWeekend = tomorrowDay === 0 || tomorrowDay === 6;
  const optimalHours = isWeekend
    ? platformOptimalHours[platform].weekend
    : platformOptimalHours[platform].weekday;
  const firstHour = optimalHours[0] || 9;

  tomorrow.setHours(firstHour, 0, 0, 0);
  const score = calculateSlotScore(tomorrow, firstHour, platform);

  return {
    date: tomorrow,
    hour: firstHour,
    platform,
    score,
    reason: getSlotReason(firstHour, platform, score),
    isRecommended: score >= 80,
  };
}

// Suggest optimal schedule for multiple posts
export function suggestPostingSchedule(
  posts: Post[],
  startDate: Date = new Date()
): { post: Post; suggestedSlot: OptimalSlot }[] {
  const schedule: { post: Post; suggestedSlot: OptimalSlot }[] = [];
  const usedSlots = new Set<string>();

  // Group posts by platform
  const postsByPlatform = posts.reduce((acc, post) => {
    if (!acc[post.platform]) acc[post.platform] = [];
    acc[post.platform].push(post);
    return acc;
  }, {} as Record<Platform, Post[]>);

  // Get week schedule
  const weekSchedule = getWeekSchedule(startDate);

  Object.entries(postsByPlatform).forEach(([platform, platformPosts]) => {
    const platformSlots = weekSchedule.days
      .flatMap(d => d.slots)
      .filter(s => s.platform === platform)
      .sort((a, b) => b.score - a.score);

    platformPosts.forEach((post) => {
      // Find the best available slot
      const availableSlot = platformSlots.find(slot => {
        const slotKey = `${slot.platform}-${slot.date.toISOString()}`;
        return !usedSlots.has(slotKey);
      });

      if (availableSlot) {
        const slotKey = `${availableSlot.platform}-${availableSlot.date.toISOString()}`;
        usedSlots.add(slotKey);
        schedule.push({ post, suggestedSlot: availableSlot });
      }
    });
  });

  // Sort by suggested time
  schedule.sort((a, b) => a.suggestedSlot.date.getTime() - b.suggestedSlot.date.getTime());

  return schedule;
}

// Get optimal times for the hour indicators in calendar week view
export function getHourlyOptimalTimes(date: Date, platforms: Platform[]): Map<number, OptimalSlot[]> {
  const hourlySlots = new Map<number, OptimalSlot[]>();

  // Initialize all hours
  for (let hour = 0; hour < 24; hour++) {
    hourlySlots.set(hour, []);
  }

  const daySchedule = getOptimalSlotsForDay(date, platforms);

  daySchedule.slots.forEach(slot => {
    const existing = hourlySlots.get(slot.hour) || [];
    existing.push(slot);
    hourlySlots.set(slot.hour, existing);
  });

  return hourlySlots;
}

// Platform emoji/icon helper
export const platformEmojis: Record<Platform, string> = {
  instagram: '📸',
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵',
  facebook: '👥',
};

// Format time slot for display
export function formatSlotTime(slot: OptimalSlot): string {
  const hour = slot.hour;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${period}`;
}

// Get score color class
export function getScoreColorClass(score: number): string {
  if (score >= 85) return 'text-success';
  if (score >= 70) return 'text-primary';
  if (score >= 50) return 'text-warning';
  return 'text-gray-500';
}

// Get score background class
export function getScoreBgClass(score: number): string {
  if (score >= 85) return 'bg-success/20';
  if (score >= 70) return 'bg-primary/20';
  if (score >= 50) return 'bg-warning/20';
  return 'bg-gray-500/20';
}
