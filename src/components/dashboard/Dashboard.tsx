import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Calendar,
  Zap,
  Clock,
  Download,
  FileSpreadsheet,
  FileType,
  Database,
  ChevronDown,
} from 'lucide-react';
import {
  exportPostsToCSV,
  exportAnalyticsToCSV,
  exportActivityToCSV,
  exportAnalyticsToPDF,
  exportAllDataToJSON,
} from '@/services/export';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { SkeletonStatCard, SkeletonChart, SkeletonActivityItem } from '@/components/ui/Skeleton';
import { useAnalytics, useActivities } from '@/hooks/useApi';
import { useAppStore } from '@/store/useAppStore';
import { formatDistanceToNow } from 'date-fns';
import type { ActivityLog, Platform, Post, AnalyticsData } from '@/types';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

function StatCard({ title, value, change, icon, isLoading }: StatCardProps) {
  if (isLoading) {
    return <SkeletonStatCard />;
  }

  const isPositive = change >= 0;

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-success' : 'text-critical'}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-2xl lg:text-3xl font-bold text-white">{value}</p>
    </GlassCard>
  );
}

function ActivityItem({ log }: { log: ActivityLog }) {
  const timeAgo = formatDistanceToNow(new Date(log.timestamp), { addSuffix: true });

  return (
    <div className="flex items-center gap-4 py-3 border-b border-glass-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{log.action}</p>
        <p className="text-xs text-gray-500 truncate">{log.description}</p>
        <p className="text-xs text-gray-600 mt-0.5">{timeAgo}</p>
      </div>
      <span className={`
        px-2 py-1 rounded-md text-[10px] font-bold uppercase shrink-0
        ${log.status === 'success' ? 'bg-success/10 text-success' : ''}
        ${log.status === 'pending' ? 'bg-info/10 text-info' : ''}
        ${log.status === 'failed' ? 'bg-critical/10 text-critical' : ''}
      `}>
        {log.status}
      </span>
    </div>
  );
}

// Platform colors for charts
const platformColors: Record<Platform, string> = {
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  instagram: '#E4405F',
  tiktok: '#000000',
};

const platformLabels: Record<Platform, string> = {
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

// Quick action card component
function QuickActionCard({
  icon,
  title,
  description,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl border border-glass-border bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all text-left group"
    >
      <div className={`p-2 rounded-lg ${color} w-fit mb-3`}>{icon}</div>
      <p className="text-sm font-medium text-white group-hover:text-primary-light transition-colors">
        {title}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </button>
  );
}

// Export dropdown component
function ExportDropdown({
  analytics,
  posts,
  activities,
}: {
  analytics: AnalyticsData | undefined;
  posts: Post[];
  activities: ActivityLog[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { addNotification } = useAppStore();

  const handleExport = (type: 'csv' | 'pdf' | 'json' | 'posts' | 'activity') => {
    try {
      switch (type) {
        case 'csv':
          if (analytics) {
            exportAnalyticsToCSV(analytics);
            addNotification({
              type: 'success',
              title: 'Export Complete',
              message: 'Analytics exported to CSV',
            });
          }
          break;
        case 'pdf':
          if (analytics) {
            exportAnalyticsToPDF(analytics, posts);
            addNotification({
              type: 'success',
              title: 'Report Generated',
              message: 'PDF report opened in new window',
            });
          }
          break;
        case 'posts':
          exportPostsToCSV(posts);
          addNotification({
            type: 'success',
            title: 'Export Complete',
            message: 'Posts exported to CSV',
          });
          break;
        case 'activity':
          exportActivityToCSV(activities);
          addNotification({
            type: 'success',
            title: 'Export Complete',
            message: 'Activity log exported to CSV',
          });
          break;
        case 'json':
          exportAllDataToJSON({ posts, activities, analytics: analytics || undefined });
          addNotification({
            type: 'success',
            title: 'Backup Complete',
            message: 'All data exported to JSON',
          });
          break;
      }
    } catch {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'There was an error exporting your data',
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-surface border border-glass-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="px-3 py-2 text-xs text-gray-500 uppercase font-semibold">Analytics</p>
                <button
                  onClick={() => handleExport('csv')}
                  disabled={!analytics}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet size={16} className="text-success" />
                  Export Analytics CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={!analytics}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileType size={16} className="text-critical" />
                  Generate PDF Report
                </button>
              </div>

              <div className="border-t border-glass-border p-2">
                <p className="px-3 py-2 text-xs text-gray-500 uppercase font-semibold">Content</p>
                <button
                  onClick={() => handleExport('posts')}
                  disabled={posts.length === 0}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText size={16} className="text-primary" />
                  Export Posts CSV
                </button>
                <button
                  onClick={() => handleExport('activity')}
                  disabled={activities.length === 0}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Clock size={16} className="text-accent-purple" />
                  Export Activity Log
                </button>
              </div>

              <div className="border-t border-glass-border p-2">
                <p className="px-3 py-2 text-xs text-gray-500 uppercase font-semibold">Backup</p>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Database size={16} className="text-info" />
                  Export All Data (JSON)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: serverActivities, isLoading: activitiesLoading } = useActivities();
  const { activities: storeActivities, posts, setActiveView } = useAppStore();

  // Merge store activities with server activities
  const activities = [...storeActivities, ...(serverActivities || [])].slice(0, 10);

  // Calculate post stats
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;

  // Generate platform breakdown data from posts
  const platformBreakdown = Object.entries(
    posts.reduce(
      (acc, post) => {
        acc[post.platform] = (acc[post.platform] || 0) + 1;
        return acc;
      },
      {} as Record<Platform, number>
    )
  ).map(([platform, count]) => ({
    name: platformLabels[platform as Platform],
    value: count,
    color: platformColors[platform as Platform],
  }));

  // Add defaults if no posts
  const chartData =
    platformBreakdown.length > 0
      ? platformBreakdown
      : [
          { name: 'Twitter/X', value: 35, color: '#1DA1F2' },
          { name: 'LinkedIn', value: 25, color: '#0A66C2' },
          { name: 'Instagram', value: 30, color: '#E4405F' },
          { name: 'TikTok', value: 10, color: '#000000' },
        ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text mb-2">Growth Hub</h1>
          <p className="text-gray-400 text-sm lg:text-base">Your autonomous social media command center</p>
        </div>
        <ExportDropdown analytics={analytics} posts={posts} activities={activities} />
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickActionCard
            icon={<Zap size={18} className="text-primary" />}
            title="Scan Trends"
            description="Find viral topics"
            onClick={() => setActiveView('trends')}
            color="bg-primary/10"
          />
          <QuickActionCard
            icon={<FileText size={18} className="text-accent-purple" />}
            title="Create Content"
            description="AI-powered posts"
            onClick={() => setActiveView('content')}
            color="bg-accent-purple/10"
          />
          <QuickActionCard
            icon={<Calendar size={18} className="text-accent-pink" />}
            title="View Queue"
            description={`${draftCount} drafts, ${scheduledCount} scheduled`}
            onClick={() => setActiveView('drafts')}
            color="bg-accent-pink/10"
          />
          <QuickActionCard
            icon={<Clock size={18} className="text-success" />}
            title="Automation"
            description="Configure settings"
            onClick={() => setActiveView('automation')}
            color="bg-success/10"
          />
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Followers"
          value={analytics ? formatNumber(analytics.followers) : '—'}
          change={analytics?.followersChange ?? 0}
          icon={<Users size={24} className="text-primary" />}
          isLoading={analyticsLoading}
        />
        <StatCard
          title="Engagement Rate"
          value={analytics ? `${analytics.engagement}%` : '—'}
          change={analytics?.engagementChange ?? 0}
          icon={<TrendingUp size={24} className="text-accent-purple" />}
          isLoading={analyticsLoading}
        />
        <StatCard
          title="Weekly Reach"
          value={analytics ? formatNumber(analytics.reach) : '—'}
          change={analytics?.reachChange ?? 0}
          icon={<Eye size={24} className="text-accent-pink" />}
          isLoading={analyticsLoading}
        />
        <StatCard
          title="Posts Created"
          value={posts.length.toString()}
          change={publishedCount > 0 ? Math.round((publishedCount / posts.length) * 100) : 0}
          icon={<FileText size={24} className="text-success" />}
          isLoading={false}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Audience Growth Chart */}
        {analyticsLoading ? (
          <SkeletonChart />
        ) : (
          <GlassCard className="p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Audience Growth</h3>
            <div className="h-48 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.audienceGrowth || []}>
                  <defs>
                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorFollowers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}

        {/* Engagement Score Chart */}
        {analyticsLoading ? (
          <SkeletonChart />
        ) : (
          <GlassCard className="p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Engagement Score</h3>
            <div className="h-48 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.engagementByDay || []}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#colorBar)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Platform Breakdown & Content Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Platform Distribution */}
        <GlassCard className="p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {chartData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Content Pipeline */}
        <GlassCard className="p-4 lg:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Content Pipeline</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('drafts')}
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-500/20 flex items-center justify-center">
                <FileText size={20} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-white">{draftCount}</p>
              <p className="text-xs text-gray-500">Drafts</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock size={20} className="text-primary" />
              </div>
              <p className="text-2xl font-bold text-white">{scheduledCount}</p>
              <p className="text-xs text-gray-500">Scheduled</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-success" />
              </div>
              <p className="text-2xl font-bold text-white">{publishedCount}</p>
              <p className="text-xs text-gray-500">Published</p>
            </div>
          </div>
          {posts.length === 0 ? (
            <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 text-center">
              <p className="text-sm text-gray-400">No content yet</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={() => setActiveView('content')}
              >
                <Zap size={14} className="mr-1" />
                Create Your First Post
              </Button>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Pipeline Progress</span>
                <span className="text-xs text-primary">
                  {posts.length > 0
                    ? `${Math.round((publishedCount / posts.length) * 100)}% published`
                    : '0%'}
                </span>
              </div>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div
                    className="bg-success"
                    style={{
                      width: `${posts.length > 0 ? (publishedCount / posts.length) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-primary"
                    style={{
                      width: `${posts.length > 0 ? (scheduledCount / posts.length) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-gray-500"
                    style={{
                      width: `${posts.length > 0 ? (draftCount / posts.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Activity Log */}
      <GlassCard className="p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Autonomous Activity</h3>
        <div className="divide-y divide-glass-border">
          {activitiesLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonActivityItem key={i} />)
          ) : activities.length > 0 ? (
            activities.map((log) => <ActivityItem key={log.id} log={log} />)
          ) : (
            <p className="text-gray-500 text-center py-8">No activity yet. Start by scanning trends or creating content!</p>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
