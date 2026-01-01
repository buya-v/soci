import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  FileText,
  Calendar,
  Edit3,
  Trash2,
  Send,
  Clock,
  Filter,
  Search,
  X,
  Check,
  Share2,
  AlertTriangle,
  Lightbulb,
  GripVertical,
  CheckSquare,
  Square,
  MoreHorizontal,
  Download,
  FileSpreadsheet,
  Database,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import {
  prepareForAllPlatforms,
  platformConfigs,
} from '@/services/publishing';
import { exportPostsToCSV, exportAllDataToJSON } from '@/services/export';
import type { Post, Platform, PostStatus } from '@/types';

const platformIcons: Record<Platform, string> = {
  twitter: 'X',
  linkedin: 'in',
  instagram: 'IG',
  tiktok: 'TT',
};

const platformColors: Record<Platform, string> = {
  twitter: 'bg-gray-800 text-white',
  linkedin: 'bg-blue-600 text-white',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  tiktok: 'bg-black text-white',
};

const statusConfig: Record<PostStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400' },
  scheduled: { label: 'Scheduled', color: 'bg-primary/20 text-primary' },
  published: { label: 'Published', color: 'bg-success/20 text-success' },
  failed: { label: 'Failed', color: 'bg-critical/20 text-critical' },
};

interface DraftCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  onSchedule: (post: Post) => void;
  onPublish: (post: Post) => void;
  onCrossPost: (post: Post) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showDragHandle?: boolean;
}

function DraftCard({ post, onEdit, onDelete, onSchedule, onPublish, onCrossPost, isSelected, onSelect, showDragHandle }: DraftCardProps) {
  const status = statusConfig[post.status];
  const platform = platformColors[post.platform];
  const platformLabel = platformIcons[post.platform];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-panel rounded-xl p-5 border transition-all duration-300 ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-glass-border hover:border-primary/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {showDragHandle && (
            <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 -ml-1">
              <GripVertical size={16} />
            </div>
          )}
          {onSelect && (
            <button
              onClick={() => onSelect(post.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isSelected ? (
                <CheckSquare size={18} className="text-primary" />
              ) : (
                <Square size={18} />
              )}
            </button>
          )}
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${platform}`}>
            {platformLabel}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status.color}`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(post)}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            title="Edit"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="p-2 rounded-lg hover:bg-critical/10 text-gray-400 hover:text-critical transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-3">
        {post.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden bg-white/5 aspect-video flex items-center justify-center">
            <img
              src={post.imageUrl}
              alt="Post preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <p className="text-sm text-gray-300 line-clamp-3">
          {post.content || post.caption}
        </p>
      </div>

      {/* Hashtags */}
      {post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.hashtags.slice(0, 4).map((tag, i) => (
            <span key={i} className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
          {post.hashtags.length > 4 && (
            <span className="text-xs text-gray-500">+{post.hashtags.length - 4} more</span>
          )}
        </div>
      )}

      {/* Scheduled Time */}
      {post.scheduledAt && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Clock size={12} />
          <span>
            {new Date(post.scheduledAt).toLocaleDateString()} at{' '}
            {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-glass-border">
        {post.status === 'draft' && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSchedule(post)}
              className="flex-1"
            >
              <Calendar size={14} className="mr-1" />
              Schedule
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCrossPost(post)}
              title="Preview on all platforms"
            >
              <Share2 size={14} />
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onPublish(post)}
              className="flex-1"
            >
              <Send size={14} className="mr-1" />
              Publish
            </Button>
          </>
        )}
        {post.status === 'scheduled' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCrossPost(post)}
              title="Preview on all platforms"
            >
              <Share2 size={14} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPublish(post)}
              className="flex-1"
            >
              <Send size={14} className="mr-1" />
              Publish Now
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

interface EditModalProps {
  post: Post;
  onClose: () => void;
  onSave: (updates: Partial<Post>) => void;
}

function EditModal({ post, onClose, onSave }: EditModalProps) {
  const [content, setContent] = useState(post.content || post.caption || '');
  const [hashtags, setHashtags] = useState(post.hashtags.join(', '));

  const handleSave = () => {
    onSave({
      content,
      caption: content,
      hashtags: hashtags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean),
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel rounded-2xl p-6 w-full max-w-lg border border-glass-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Edit Draft</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Hashtags</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">Separate hashtags with commas</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              <Check size={16} className="mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ScheduleModalProps {
  post: Post;
  onClose: () => void;
  onSchedule: (date: Date) => void;
}

function ScheduleModal({ post, onClose, onSchedule }: ScheduleModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSchedule = () => {
    if (date && time) {
      const scheduledDate = new Date(`${date}T${time}`);
      onSchedule(scheduledDate);
      onClose();
    }
  };

  // Set default to tomorrow at 9am
  useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setDate(tomorrow.toISOString().split('T')[0]);
    setTime('09:00');
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel rounded-2xl p-6 w-full max-w-md border border-glass-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Schedule Post</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {post.content || post.caption}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white focus:border-primary transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSchedule} className="flex-1" disabled={!date || !time}>
              <Calendar size={16} className="mr-1" />
              Schedule
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface CrossPostModalProps {
  post: Post;
  onClose: () => void;
  onCopyToPlatform: (platform: Platform, content: string, hashtags: string[]) => void;
}

function CrossPostModal({ post, onClose, onCopyToPlatform }: CrossPostModalProps) {
  const previews = prepareForAllPlatforms(post.content || post.caption || '', post.hashtags);
  const [copiedPlatforms, setCopiedPlatforms] = useState<Set<Platform>>(new Set());

  const handleCopyToPlatform = (preview: typeof previews[0]) => {
    if (preview.platform === post.platform) return;
    onCopyToPlatform(preview.platform, preview.content, preview.hashtags);
    setCopiedPlatforms(prev => new Set([...prev, preview.platform]));
  };

  const handleCopyToAll = () => {
    previews.forEach(preview => {
      if (preview.platform !== post.platform) {
        onCopyToPlatform(preview.platform, preview.content, preview.hashtags);
        setCopiedPlatforms(prev => new Set([...prev, preview.platform]));
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel rounded-2xl p-6 w-full max-w-3xl border border-glass-border max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Copy to Other Platforms</h3>
            <p className="text-sm text-gray-400">Preview and copy optimized content to other platforms</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyToAll}
              className="gap-1"
            >
              <Share2 size={14} />
              Copy to All
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {previews.map((preview) => {
            const isOriginal = preview.platform === post.platform;
            const isCopied = copiedPlatforms.has(preview.platform);

            return (
              <div
                key={preview.platform}
                className={`p-4 rounded-xl border ${
                  isOriginal
                    ? 'border-primary/50 bg-primary/5'
                    : isCopied
                    ? 'border-success/50 bg-success/5'
                    : 'border-glass-border bg-white/5'
                }`}
              >
                {/* Platform Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${platformColors[preview.platform]}`}>
                      {platformIcons[preview.platform]}
                    </span>
                    <span className="font-medium text-white">{platformConfigs[preview.platform].name}</span>
                  </div>
                  {isOriginal ? (
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">Original</span>
                  ) : isCopied ? (
                    <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check size={10} />
                      Copied
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToPlatform(preview)}
                      className="text-xs h-6 px-2"
                    >
                      Copy
                    </Button>
                  )}
                </div>

                {/* Character Count */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">
                    {preview.characterCount} / {preview.maxCharacters} characters
                  </span>
                  {preview.truncated && (
                    <span className="text-xs text-warning">Truncated</span>
                  )}
                </div>

                {/* Character Progress Bar */}
                <div className="w-full h-1 bg-white/10 rounded-full mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${
                      preview.characterCount / preview.maxCharacters > 0.9
                        ? 'bg-warning'
                        : 'bg-primary'
                    }`}
                    style={{
                      width: `${Math.min(100, (preview.characterCount / preview.maxCharacters) * 100)}%`,
                    }}
                  />
                </div>

                {/* Content Preview */}
                <p className="text-sm text-gray-300 line-clamp-3 mb-3">{preview.content}</p>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {preview.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                  {preview.hashtags.length < post.hashtags.length && (
                    <span className="text-xs text-gray-500">
                      +{post.hashtags.length - preview.hashtags.length} hidden
                    </span>
                  )}
                </div>

                {/* Warnings */}
                {preview.warnings.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {preview.warnings.map((warning, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-warning">
                        <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optimizations */}
                {preview.optimizations.length > 0 && (
                  <div className="space-y-1">
                    {preview.optimizations.map((opt, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-accent-purple">
                        <Lightbulb size={12} className="mt-0.5 flex-shrink-0" />
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-glass-border flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {copiedPlatforms.size > 0
              ? `${copiedPlatforms.size} platform${copiedPlatforms.size !== 1 ? 's' : ''} copied to drafts`
              : 'Click "Copy" to create drafts for other platforms'}
          </p>
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

type FilterStatus = 'all' | PostStatus;

// Bulk actions dropdown
function BulkActionsDropdown({
  selectedCount,
  onScheduleAll,
  onPublishAll,
  onDeleteAll,
  onClearSelection,
}: {
  selectedCount: number;
  onScheduleAll: () => void;
  onPublishAll: () => void;
  onDeleteAll: () => void;
  onClearSelection: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <CheckSquare size={16} />
        <span>{selectedCount} selected</span>
        <MoreHorizontal size={14} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-48 bg-surface border border-glass-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2">
                <button
                  onClick={() => { onScheduleAll(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Calendar size={16} className="text-primary" />
                  Schedule All
                </button>
                <button
                  onClick={() => { onPublishAll(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Send size={16} className="text-success" />
                  Publish All
                </button>
                <div className="border-t border-glass-border my-1" />
                <button
                  onClick={() => { onDeleteAll(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-critical hover:bg-critical/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  Delete All
                </button>
                <div className="border-t border-glass-border my-1" />
                <button
                  onClick={() => { onClearSelection(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={16} />
                  Clear Selection
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export dropdown
function ExportDropdown({ posts, onNotify }: { posts: Post[]; onNotify: (msg: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportCSV = () => {
    exportPostsToCSV(posts);
    onNotify('Exported posts to CSV');
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    exportAllDataToJSON({ posts, activities: [] });
    onNotify('Exported posts to JSON');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Export</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-48 bg-surface border border-glass-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2">
                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <FileSpreadsheet size={16} className="text-success" />
                  Export as CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Database size={16} className="text-info" />
                  Export as JSON
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DraftsQueue() {
  const { posts, setPosts, addPost, updatePost, deletePost, addNotification, addActivity } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [schedulingPost, setSchedulingPost] = useState<Post | null>(null);
  const [crossPostingPost, setCrossPostingPost] = useState<Post | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkScheduleModal, setBulkScheduleModal] = useState(false);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = (post.content || post.caption || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesPlatform = filterPlatform === 'all' || post.platform === filterPlatform;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // Selection handlers
  const handleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredPosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPosts.map(p => p.id)));
    }
  }, [filteredPosts, selectedIds.size]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Drag and drop reorder handler
  const handleReorder = useCallback((newOrder: Post[]) => {
    // Update the full posts array maintaining the new order
    const orderedIds = new Set(newOrder.map(p => p.id));
    const otherPosts = posts.filter(p => !orderedIds.has(p.id));
    setPosts([...newOrder, ...otherPosts]);
  }, [posts, setPosts]);

  // Bulk action handlers
  const handleBulkSchedule = useCallback(() => {
    setBulkScheduleModal(true);
  }, []);

  const handleBulkScheduleConfirm = useCallback((date: Date) => {
    const selectedPosts = posts.filter(p => selectedIds.has(p.id));
    selectedPosts.forEach(post => {
      updatePost(post.id, {
        status: 'scheduled',
        scheduledAt: date,
        scheduledFor: date.toISOString(),
      });
    });
    addNotification({
      type: 'success',
      title: 'Posts Scheduled',
      message: `${selectedPosts.length} posts scheduled for ${date.toLocaleDateString()}`,
    });
    addActivity({
      id: crypto.randomUUID(),
      action: 'Bulk Schedule',
      description: `Scheduled ${selectedPosts.length} posts`,
      timestamp: new Date().toISOString(),
      status: 'success',
    });
    setSelectedIds(new Set());
    setBulkScheduleModal(false);
  }, [posts, selectedIds, updatePost, addNotification, addActivity]);

  const handleBulkPublish = useCallback(() => {
    const selectedPosts = posts.filter(p => selectedIds.has(p.id));
    selectedPosts.forEach(post => {
      updatePost(post.id, {
        status: 'published',
        publishedAt: new Date(),
      });
    });
    addNotification({
      type: 'success',
      title: 'Posts Published',
      message: `${selectedPosts.length} posts published successfully`,
    });
    addActivity({
      id: crypto.randomUUID(),
      action: 'Bulk Publish',
      description: `Published ${selectedPosts.length} posts`,
      timestamp: new Date().toISOString(),
      status: 'success',
    });
    setSelectedIds(new Set());
  }, [posts, selectedIds, updatePost, addNotification, addActivity]);

  const handleBulkDelete = useCallback(() => {
    const count = selectedIds.size;
    selectedIds.forEach(id => {
      deletePost(id);
    });
    addNotification({
      type: 'info',
      title: 'Posts Deleted',
      message: `${count} posts removed from queue`,
    });
    setSelectedIds(new Set());
  }, [selectedIds, deletePost, addNotification]);

  const draftCount = posts.filter(p => p.status === 'draft').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;

  const handleEdit = (post: Post) => {
    setEditingPost(post);
  };

  const handleSaveEdit = (updates: Partial<Post>) => {
    if (editingPost) {
      updatePost(editingPost.id, updates);
      addNotification({
        type: 'success',
        title: 'Draft Updated',
        message: 'Your changes have been saved',
      });
    }
  };

  const handleDelete = (id: string) => {
    deletePost(id);
    addNotification({
      type: 'info',
      title: 'Post Deleted',
      message: 'The post has been removed from your drafts',
    });
  };

  const handleSchedule = (post: Post) => {
    setSchedulingPost(post);
  };

  const handleCrossPost = (post: Post) => {
    setCrossPostingPost(post);
  };

  const handleCopyToPlatform = useCallback((platform: Platform, content: string, hashtags: string[]) => {
    addPost({
      id: crypto.randomUUID(),
      content,
      caption: content,
      hashtags,
      platform,
      status: 'draft',
      imageUrl: crossPostingPost?.imageUrl,
    });
    addNotification({
      type: 'success',
      title: 'Draft Created',
      message: `Content copied to ${platform} drafts`,
    });
  }, [addPost, addNotification, crossPostingPost]);

  const handleConfirmSchedule = (date: Date) => {
    if (schedulingPost) {
      updatePost(schedulingPost.id, {
        status: 'scheduled',
        scheduledAt: date,
      });
      addNotification({
        type: 'success',
        title: 'Post Scheduled',
        message: `Scheduled for ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      });
      addActivity({
        id: crypto.randomUUID(),
        action: 'Post Scheduled',
        description: `Scheduled post for ${schedulingPost.platform}`,
        timestamp: new Date().toISOString(),
        status: 'success',
        platform: schedulingPost.platform,
      });
    }
  };

  const handlePublish = (post: Post) => {
    updatePost(post.id, {
      status: 'published',
      publishedAt: new Date(),
    });
    addNotification({
      type: 'success',
      title: 'Post Published',
      message: `Successfully published to ${post.platform}`,
    });
    addActivity({
      id: crypto.randomUUID(),
      action: 'Post Published',
      description: `Published post to ${post.platform}`,
      timestamp: new Date().toISOString(),
      status: 'success',
      platform: post.platform,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Content Queue</h1>
          <p className="text-gray-400">Manage your drafts and scheduled posts</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportDropdown
            posts={filteredPosts}
            onNotify={(msg) => addNotification({ type: 'success', title: 'Export Complete', message: msg })}
          />
          <BulkActionsDropdown
            selectedCount={selectedIds.size}
            onScheduleAll={handleBulkSchedule}
            onPublishAll={handleBulkPublish}
            onDeleteAll={handleBulkDelete}
            onClearSelection={handleClearSelection}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FileText size={16} className="text-gray-400" />
            <span className="text-2xl font-bold text-white">{draftCount}</span>
          </div>
          <p className="text-xs text-gray-500">Drafts</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock size={16} className="text-primary" />
            <span className="text-2xl font-bold text-white">{scheduledCount}</span>
          </div>
          <p className="text-xs text-gray-500">Scheduled</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Check size={16} className="text-success" />
            <span className="text-2xl font-bold text-white">{publishedCount}</span>
          </div>
          <p className="text-xs text-gray-500">Published</p>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Select All */}
          {filteredPosts.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              {selectedIds.size === filteredPosts.length ? (
                <CheckSquare size={18} className="text-primary" />
              ) : (
                <Square size={18} />
              )}
              <span className="text-sm">Select All</span>
            </button>
          )}

          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-glass-border rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="bg-white/5 border border-glass-border rounded-xl py-2.5 px-4 text-white focus:border-primary transition-colors"
            >
              <option value="all">All Status</option>
              <option value="draft">Drafts</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Platform Filter */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value as Platform | 'all')}
            className="bg-white/5 border border-glass-border rounded-xl py-2.5 px-4 text-white focus:border-primary transition-colors"
          >
            <option value="all">All Platforms</option>
            <option value="twitter">Twitter / X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
      </GlassCard>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={filteredPosts}
          onReorder={handleReorder}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <Reorder.Item
                key={post.id}
                value={post}
                dragListener={false}
              >
                <DraftCard
                  post={post}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSchedule={handleSchedule}
                  onPublish={handlePublish}
                  onCrossPost={handleCrossPost}
                  isSelected={selectedIds.has(post.id)}
                  onSelect={handleSelect}
                  showDragHandle={true}
                />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      ) : (
        <GlassCard className="p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-2">No posts found</p>
          <p className="text-sm text-gray-500">
            {posts.length === 0
              ? 'Create content in Content Lab to see it here'
              : 'Try adjusting your filters'}
          </p>
        </GlassCard>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPost && (
          <EditModal
            post={editingPost}
            onClose={() => setEditingPost(null)}
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {schedulingPost && (
          <ScheduleModal
            post={schedulingPost}
            onClose={() => setSchedulingPost(null)}
            onSchedule={handleConfirmSchedule}
          />
        )}
      </AnimatePresence>

      {/* Cross-Post Preview Modal */}
      <AnimatePresence>
        {crossPostingPost && (
          <CrossPostModal
            post={crossPostingPost}
            onClose={() => setCrossPostingPost(null)}
            onCopyToPlatform={handleCopyToPlatform}
          />
        )}
      </AnimatePresence>

      {/* Bulk Schedule Modal */}
      <AnimatePresence>
        {bulkScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setBulkScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel rounded-2xl p-6 w-full max-w-md border border-glass-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Schedule {selectedIds.size} Posts</h3>
                <button
                  onClick={() => setBulkScheduleModal(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                All selected posts will be scheduled for the same date and time.
              </p>

              <BulkScheduleForm
                onSchedule={handleBulkScheduleConfirm}
                onCancel={() => setBulkScheduleModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Bulk schedule form component
function BulkScheduleForm({
  onSchedule,
  onCancel,
}: {
  onSchedule: (date: Date) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Set default to tomorrow at 9am
  useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setDate(tomorrow.toISOString().split('T')[0]);
    setTime('09:00');
  });

  const handleSchedule = () => {
    if (date && time) {
      const scheduledDate = new Date(`${date}T${time}`);
      onSchedule(scheduledDate);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white focus:border-primary transition-colors"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSchedule} className="flex-1" disabled={!date || !time}>
          <Calendar size={16} className="mr-1" />
          Schedule All
        </Button>
      </div>
    </div>
  );
}
