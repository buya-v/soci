import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Search,
  Filter,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  BarChart2,
  Clock,
  X,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import type { Post, Platform } from '@/types';

const platformIcons: Record<Platform, string> = {
  twitter: 'X',
  linkedin: 'in',
  instagram: 'IG',
  tiktok: 'TT',
  facebook: 'FB',
};

const platformColors: Record<Platform, string> = {
  twitter: 'bg-gray-800 text-white',
  linkedin: 'bg-blue-600 text-white',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  tiktok: 'bg-black text-white',
  facebook: 'bg-blue-500 text-white',
};

interface PublishedCardProps {
  post: Post;
}

function PublishedCard({ post }: PublishedCardProps) {
  const platform = platformColors[post.platform];
  const platformLabel = platformIcons[post.platform];
  const engagement = post.engagement || { likes: 0, comments: 0, shares: 0, reach: 0 };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel rounded-xl p-5 border border-glass-border hover:border-success/30 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${platform}`}>
            {platformLabel}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-success/20 text-success">
            Published
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock size={12} />
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        {post.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden bg-white/5 aspect-video flex items-center justify-center">
            <img
              src={post.imageUrl}
              alt="Post preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <p className="text-sm text-gray-300 line-clamp-3 mb-2">
          {post.content || post.caption}
        </p>
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
            {post.hashtags.length > 5 && (
              <span className="text-[10px] text-gray-500">
                +{post.hashtags.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-white/5 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-pink-400 mb-1">
            <Heart size={14} />
          </div>
          <p className="text-sm font-bold text-white">{formatNumber(engagement.likes)}</p>
          <p className="text-[10px] text-gray-500">Likes</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
            <MessageCircle size={14} />
          </div>
          <p className="text-sm font-bold text-white">{formatNumber(engagement.comments)}</p>
          <p className="text-[10px] text-gray-500">Comments</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
            <Share2 size={14} />
          </div>
          <p className="text-sm font-bold text-white">{formatNumber(engagement.shares)}</p>
          <p className="text-[10px] text-gray-500">Shares</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
            <Eye size={14} />
          </div>
          <p className="text-sm font-bold text-white">{formatNumber(engagement.reach)}</p>
          <p className="text-[10px] text-gray-500">Reach</p>
        </div>
      </div>
    </motion.div>
  );
}

export function PublishedPosts() {
  const posts = useAppStore((state) => state.posts);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'engagement'>('date');

  // Filter to only published posts
  const publishedPosts = useMemo(() => {
    let filtered = posts.filter((post) => post.status === 'published');

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.content?.toLowerCase().includes(query) ||
          post.caption?.toLowerCase().includes(query) ||
          post.hashtags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter((post) => post.platform === platformFilter);
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      filtered.sort((a, b) => {
        const engA = a.engagement ? a.engagement.likes + a.engagement.comments + a.engagement.shares : 0;
        const engB = b.engagement ? b.engagement.likes + b.engagement.comments + b.engagement.shares : 0;
        return engB - engA;
      });
    }

    return filtered;
  }, [posts, searchQuery, platformFilter, sortBy]);

  // Calculate totals
  const totals = useMemo(() => {
    return publishedPosts.reduce(
      (acc, post) => {
        if (post.engagement) {
          acc.likes += post.engagement.likes;
          acc.comments += post.engagement.comments;
          acc.shares += post.engagement.shares;
          acc.reach += post.engagement.reach;
        }
        return acc;
      },
      { likes: 0, comments: 0, shares: 0, reach: 0 }
    );
  }, [publishedPosts]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const platforms: (Platform | 'all')[] = ['all', 'instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-1">Published Posts</h1>
          <p className="text-sm text-gray-400">
            Track your published content and engagement metrics
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <GlassCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-success mb-2">
            <CheckCircle size={18} />
            <span className="text-xs font-medium">Total Posts</span>
          </div>
          <p className="text-2xl font-bold text-white">{publishedPosts.length}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-pink-400 mb-2">
            <Heart size={18} />
            <span className="text-xs font-medium">Total Likes</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totals.likes)}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
            <MessageCircle size={18} />
            <span className="text-xs font-medium">Total Comments</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totals.comments)}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
            <Share2 size={18} />
            <span className="text-xs font-medium">Total Shares</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totals.shares)}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-purple-400 mb-2">
            <Eye size={18} />
            <span className="text-xs font-medium">Total Reach</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totals.reach)}</p>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search published posts..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-glass-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <div className="flex gap-1">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    platformFilter === p
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  {p === 'all' ? 'All' : platformIcons[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'engagement')}
              className="bg-white/5 border border-glass-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
            >
              <option value="date">Latest First</option>
              <option value="engagement">Top Engagement</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Posts Grid */}
      {publishedPosts.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold text-white mb-2">No Published Posts Yet</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Posts will appear here once they've been published. Create content in the Content Lab and schedule it for publishing.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {publishedPosts.map((post) => (
              <PublishedCard key={post.id} post={post} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
