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
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import type { Post, Platform } from '@/types';

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
        className="glass-panel rounded-2xl p-6 max-w-md w-full"
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
        <div className="p-4 bg-white/5 rounded-xl mb-6">
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

        {/* Time Selection */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block">Time</label>
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

        {/* Optimal Times Suggestion */}
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 mb-6">
          <p className="text-xs text-primary">
            Optimal times for {platformLabels[post.platform]}:
            {post.platform === 'twitter' && ' 9:00 AM, 12:00 PM, 5:00 PM'}
            {post.platform === 'linkedin' && ' 7:00 AM, 12:00 PM, 5:00 PM'}
            {post.platform === 'instagram' && ' 11:00 AM, 2:00 PM, 7:00 PM'}
            {post.platform === 'tiktok' && ' 7:00 PM, 8:00 PM, 9:00 PM'}
          </p>
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

export function CalendarView() {
  const { posts, updatePost, deletePost, addNotification, addPersistentNotification, setActiveView } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Get scheduled posts
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled' && p.scheduledFor);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

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
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <h2 className="text-lg font-semibold text-white min-w-[180px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(new Date())}
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
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 rounded-lg border transition-colors ${
                  isCurrentMonth
                    ? 'border-glass-border hover:border-primary/30'
                    : 'border-transparent opacity-40'
                } ${isCurrentDay ? 'bg-primary/5 border-primary/30' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentDay ? 'text-primary' : isCurrentMonth ? 'text-white' : 'text-gray-600'
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
