import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  X,
  Edit2,
  Trash2,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  getHours,
} from 'date-fns';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import type { Post, Platform } from '@/types';
import {
  getOptimalSlotsForDay,
  getNextBestTime,
  formatSlotTime,
  type OptimalSlot,
} from '@/services/scheduleOptimizer';

const platformColors: Record<Platform, string> = {
  twitter: 'bg-blue-500',
  linkedin: 'bg-blue-700',
  instagram: 'bg-pink-500',
  tiktok: 'bg-gray-700',
};

const platformLabels: Record<Platform, string> = {
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

interface ScheduleModalProps {
  post: Post;
  onClose: () => void;
  onSchedule: (date: Date, time: string) => void;
  onDelete: () => void;
}

function ScheduleModal({ post, onClose, onSchedule, onDelete }: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState(
    post.scheduledFor ? new Date(post.scheduledFor) : new Date()
  );
  const [selectedTime, setSelectedTime] = useState(
    post.scheduledFor ? format(new Date(post.scheduledFor), 'HH:mm') : '09:00'
  );

  // Get optimal slot suggestion
  const suggestedSlot = useMemo(() => {
    return getNextBestTime(post.platform);
  }, [post.platform]);

  // Get optimal slots for selected date
  const dayOptimalSlots = useMemo(() => {
    return getOptimalSlotsForDay(selectedDate, [post.platform]).slots.slice(0, 4);
  }, [selectedDate, post.platform]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  const handleSchedule = () => {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(hours, minutes, 0, 0);
    onSchedule(scheduledDate, selectedTime);
  };

  const handleUseSuggested = () => {
    setSelectedDate(suggestedSlot.date);
    setSelectedTime(`${suggestedSlot.hour.toString().padStart(2, '0')}:00`);
  };

  const handleSelectOptimalSlot = (slot: OptimalSlot) => {
    setSelectedTime(`${slot.hour.toString().padStart(2, '0')}:00`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Schedule Post</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Post Preview */}
        <div className="p-4 bg-white/5 rounded-xl mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-3 h-3 rounded-full ${platformColors[post.platform]}`} />
            <span className="text-sm font-medium text-white capitalize">
              {platformLabels[post.platform]}
            </span>
          </div>
          <p className="text-sm text-gray-400 line-clamp-2">
            {post.content || post.caption}
          </p>
        </div>

        {/* AI Suggested Best Time */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent-purple/10 rounded-xl border border-primary/20 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-medium text-white">AI Suggested Time</span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
              suggestedSlot.score >= 85 ? 'bg-success/20 text-success' :
              suggestedSlot.score >= 70 ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'
            }`}>
              {suggestedSlot.score}% match
            </span>
          </div>
          <p className="text-lg font-bold text-white mb-1">
            {format(suggestedSlot.date, 'EEEE, MMM d')} at {formatSlotTime(suggestedSlot)}
          </p>
          <p className="text-xs text-gray-400 mb-3">{suggestedSlot.reason}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUseSuggested}
            className="w-full border-primary/30 hover:border-primary"
          >
            <Zap size={14} className="mr-1" />
            Use This Time
          </Button>
        </div>

        {/* Date Selection */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Date</label>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white focus:border-primary transition-colors"
          />
        </div>

        {/* Optimal Time Slots for Selected Date */}
        {dayOptimalSlots.length > 0 && (
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">Optimal times for this day</label>
            <div className="flex flex-wrap gap-2">
              {dayOptimalSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOptimalSlot(slot)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${
                    selectedTime === `${slot.hour.toString().padStart(2, '0')}:00`
                      ? 'bg-primary text-white'
                      : slot.score >= 80
                        ? 'bg-success/20 text-success hover:bg-success/30 border border-success/30'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {slot.score >= 80 && <Sparkles size={12} />}
                  {formatSlotTime(slot)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Selection */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block">Custom time</label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white focus:border-primary transition-colors"
          >
            {timeSlots.map((slot) => (
              <option key={slot} value={slot} className="bg-surface">
                {slot}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onDelete}
            className="text-critical hover:bg-critical/10"
          >
            <Trash2 size={16} />
            Delete
          </Button>
          <Button variant="primary" onClick={handleSchedule} className="flex-1">
            <Clock size={16} />
            Schedule
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Week View Component
function WeekView({
  currentDate,
  scheduledPosts,
  onSelectPost,
  platformColors,
  showOptimalTimes = true,
}: {
  currentDate: Date;
  scheduledPosts: Post[];
  onSelectPost: (post: Post) => void;
  platformColors: Record<Platform, string>;
  showOptimalTimes?: boolean;
}) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Time slots from 6 AM to 11 PM
  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6);

  // Get optimal slots for each day
  const optimalSlotsPerDay = useMemo(() => {
    if (!showOptimalTimes) return new Map();
    const map = new Map<string, Map<number, OptimalSlot[]>>();

    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const daySchedule = getOptimalSlotsForDay(day, ['instagram', 'twitter', 'linkedin', 'tiktok']);
      const hourMap = new Map<number, OptimalSlot[]>();

      daySchedule.slots.forEach(slot => {
        const existing = hourMap.get(slot.hour) || [];
        existing.push(slot);
        hourMap.set(slot.hour, existing);
      });

      map.set(dayKey, hourMap);
    });

    return map;
  }, [weekDays, showOptimalTimes]);

  // Get posts for a specific day and hour
  const getPostsForTimeSlot = (day: Date, hour: number) => {
    return scheduledPosts.filter((post) => {
      if (!post.scheduledFor) return false;
      const postDate = parseISO(post.scheduledFor);
      return isSameDay(postDate, day) && getHours(postDate) === hour;
    });
  };

  // Check if a slot is optimal
  const getOptimalIndicator = (day: Date, hour: number) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayMap = optimalSlotsPerDay.get(dayKey);
    if (!dayMap) return null;

    const slots = dayMap.get(hour);
    if (!slots || slots.length === 0) return null;

    const bestScore = Math.max(...slots.map((s: OptimalSlot) => s.score));
    if (bestScore >= 85) return 'peak';
    if (bestScore >= 70) return 'high';
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Week header */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-glass-border">
          <div className="p-2" /> {/* Empty corner */}
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`p-3 text-center border-l border-glass-border ${
                isToday(day) ? 'bg-primary/10' : ''
              }`}
            >
              <p className="text-xs text-gray-500">{format(day, 'EEE')}</p>
              <p className={`text-lg font-semibold ${isToday(day) ? 'text-primary' : 'text-white'}`}>
                {format(day, 'd')}
              </p>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map((hour) => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-glass-border">
              <div className="p-2 text-xs text-gray-500 text-right pr-3 border-r border-glass-border">
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
              {weekDays.map((day, dayIndex) => {
                const posts = getPostsForTimeSlot(day, hour);
                const optimalLevel = showOptimalTimes ? getOptimalIndicator(day, hour) : null;

                return (
                  <div
                    key={dayIndex}
                    className={`min-h-[50px] p-1 border-l border-glass-border relative ${
                      isToday(day) ? 'bg-primary/5' : ''
                    } ${
                      optimalLevel === 'peak' ? 'bg-success/5' :
                      optimalLevel === 'high' ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Optimal time indicator */}
                    {optimalLevel && posts.length === 0 && (
                      <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                        optimalLevel === 'peak' ? 'bg-success animate-pulse' : 'bg-primary/50'
                      }`} title={optimalLevel === 'peak' ? 'Peak engagement time' : 'High engagement time'} />
                    )}
                    {posts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => onSelectPost(post)}
                        className={`w-full text-left px-2 py-1 rounded text-[10px] text-white truncate hover:opacity-80 transition-opacity mb-1 ${platformColors[post.platform]}`}
                      >
                        <span className="font-medium">
                          {post.scheduledFor && format(parseISO(post.scheduledFor), 'h:mm a')}
                        </span>
                        <span className="opacity-70 ml-1 hidden sm:inline">
                          - {(post.content || post.caption || '').slice(0, 20)}...
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        {showOptimalTimes && (
          <div className="flex items-center gap-4 mt-3 px-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Peak engagement</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary/50" />
              <span>High engagement</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarView() {
  const { posts, updatePost, deletePost, addNotification, addPersistentNotification, setActiveView } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Get scheduled posts
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled' && p.scheduledFor);

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get the display title based on view mode
  const getDisplayTitle = () => {
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      if (isSameMonth(weekStart, weekEnd)) {
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`;
      }
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
  };

  // Get posts for a specific day
  const getPostsForDay = (day: Date) => {
    return scheduledPosts.filter((post) => {
      if (!post.scheduledFor) return false;
      return isSameDay(parseISO(post.scheduledFor), day);
    });
  };

  const handleSchedule = (date: Date, _time: string) => {
    if (!selectedPost) return;

    updatePost(selectedPost.id, {
      status: 'scheduled',
      scheduledFor: date.toISOString(),
    });

    addNotification({
      type: 'success',
      title: 'Post Scheduled',
      message: `Post scheduled for ${format(date, 'MMM d, yyyy')} at ${format(date, 'h:mm a')}`,
    });

    addPersistentNotification({
      type: 'info',
      title: 'Post Scheduled',
      message: `Your ${platformLabels[selectedPost.platform]} post is scheduled for ${format(date, 'MMM d')} at ${format(date, 'h:mm a')}`,
      category: 'schedule',
    });

    setSelectedPost(null);
  };

  const handleDelete = () => {
    if (!selectedPost) return;

    deletePost(selectedPost.id);
    addNotification({
      type: 'info',
      title: 'Post Deleted',
      message: 'The scheduled post has been deleted',
    });
    setSelectedPost(null);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Content Calendar</h1>
          <p className="text-gray-400">Schedule and manage your posts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setActiveView('content')}>
            <Plus size={16} />
            Create Post
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <h2 className="text-lg font-semibold text-white min-w-[220px] text-center">
              {getDisplayTitle()}
            </h2>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              Today
            </button>
            <div className="flex bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'week' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'month' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Calendar Grid */}
      <GlassCard className="p-4 lg:p-6">
        {viewMode === 'week' ? (
          <WeekView
            currentDate={currentDate}
            scheduledPosts={scheduledPosts}
            onSelectPost={setSelectedPost}
            platformColors={platformColors}
          />
        ) : (
          <>
            {/* Week Days Header */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayPosts = getPostsForDay(day);
                const isCurrentMonthDay = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 rounded-lg border transition-colors ${
                      isCurrentMonthDay
                        ? 'border-glass-border hover:border-primary/30'
                        : 'border-transparent opacity-40'
                    } ${isCurrentDay ? 'bg-primary/5 border-primary/30' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentDay ? 'text-primary' : isCurrentMonthDay ? 'text-white' : 'text-gray-600'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayPosts.slice(0, 3).map((post) => (
                        <button
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] text-white truncate hover:opacity-80 transition-opacity ${platformColors[post.platform]}`}
                        >
                          {post.scheduledFor && format(parseISO(post.scheduledFor), 'h:mm a')}
                        </button>
                      ))}
                      {dayPosts.length > 3 && (
                        <p className="text-[10px] text-gray-500 px-2">
                          +{dayPosts.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </GlassCard>

      {/* Upcoming Posts */}
      <GlassCard className="p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Posts</h3>
        {scheduledPosts.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">No scheduled posts</p>
            <Button variant="primary" size="sm" onClick={() => setActiveView('drafts')}>
              Schedule from Drafts
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledPosts
              .sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime())
              .slice(0, 5)
              .map((post) => (
                <button
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-lg ${platformColors[post.platform]} flex items-center justify-center`}>
                    <Clock size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {post.content || post.caption}
                    </p>
                    <p className="text-xs text-gray-500">
                      {platformLabels[post.platform]} • {post.scheduledFor && format(parseISO(post.scheduledFor), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Edit2 size={16} className="text-gray-500" />
                </button>
              ))}
          </div>
        )}
      </GlassCard>

      {/* Schedule Modal */}
      <AnimatePresence>
        {selectedPost && (
          <ScheduleModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onSchedule={handleSchedule}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
