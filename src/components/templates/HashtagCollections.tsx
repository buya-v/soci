import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Check,
  X,
  Palette,
  BarChart2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import type { HashtagCollection, Platform } from '@/types';

const colorOptions = [
  { id: 'blue', bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
  { id: 'purple', bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  { id: 'pink', bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400' },
  { id: 'green', bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' },
  { id: 'orange', bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
  { id: 'teal', bg: 'bg-teal-500/20', border: 'border-teal-500/30', text: 'text-teal-400' },
  { id: 'red', bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
  { id: 'yellow', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
];

const platformOptions: { id: Platform | 'all'; label: string }[] = [
  { id: 'all', label: 'All Platforms' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
];

interface CollectionModalProps {
  collection?: HashtagCollection;
  onClose: () => void;
  onSave: (collection: HashtagCollection) => void;
}

function CollectionModal({ collection, onClose, onSave }: CollectionModalProps) {
  const [name, setName] = useState(collection?.name || '');
  const [description, setDescription] = useState(collection?.description || '');
  const [hashtags, setHashtags] = useState<string[]>(collection?.hashtags || []);
  const [platform, setPlatform] = useState<Platform | 'all'>(collection?.platform || 'all');
  const [color, setColor] = useState(collection?.color || 'blue');
  const [newHashtag, setNewHashtag] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState('');

  const handleAddHashtag = () => {
    const clean = newHashtag.replace(/^#/, '').trim().toLowerCase();
    if (clean && !hashtags.includes(clean)) {
      setHashtags([...hashtags, clean]);
    }
    setNewHashtag('');
  };

  const handleBulkAdd = () => {
    const tags = bulkInput
      .split(/[\s,#]+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t && !hashtags.includes(t));
    setHashtags([...hashtags, ...tags]);
    setBulkInput('');
    setBulkMode(false);
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((h) => h !== tag));
  };

  const handleSave = () => {
    if (!name.trim() || hashtags.length === 0) return;

    const now = new Date().toISOString();
    const newCollection: HashtagCollection = {
      id: collection?.id || crypto.randomUUID(),
      name: name.trim(),
      description: description.trim() || undefined,
      hashtags,
      platform,
      color,
      createdAt: collection?.createdAt || now,
      usageCount: collection?.usageCount || 0,
    };

    onSave(newCollection);
    onClose();
  };

  const colorStyle = colorOptions.find((c) => c.id === color) || colorOptions[0];

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
        className="glass-panel rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {collection ? 'Edit Collection' : 'Create Collection'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tech Trending, Marketing, Lifestyle"
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="When to use this collection"
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
            />
          </div>

          {/* Color & Platform */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Palette size={14} className="inline mr-1" />
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={`w-8 h-8 rounded-lg ${c.bg} border-2 transition-all ${
                      color === c.id ? c.border + ' scale-110' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform | 'all')}
                className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white appearance-none cursor-pointer focus:border-primary transition-colors"
              >
                {platformOptions.map((p) => (
                  <option key={p.id} value={p.id} className="bg-gray-900">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Hashtags ({hashtags.length}) *
              </label>
              <button
                onClick={() => setBulkMode(!bulkMode)}
                className="text-xs text-primary hover:text-primary-light transition-colors"
              >
                {bulkMode ? 'Single mode' : 'Bulk add'}
              </button>
            </div>

            {bulkMode ? (
              <div className="space-y-2">
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Paste hashtags separated by commas, spaces, or new lines..."
                  rows={4}
                  className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors resize-none"
                />
                <Button variant="secondary" size="sm" onClick={handleBulkAdd}>
                  Add All
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag()}
                  placeholder="Type hashtag and press Enter..."
                  className="flex-1 bg-white/5 border border-glass-border rounded-xl py-2 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
                />
                <Button variant="secondary" size="sm" onClick={handleAddHashtag}>
                  <Plus size={16} />
                </Button>
              </div>
            )}

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-white/5 rounded-xl max-h-40 overflow-y-auto">
                {hashtags.map((tag) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${colorStyle.bg} ${colorStyle.text} border ${colorStyle.border}`}
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveHashtag(tag)}
                      className="ml-1 hover:opacity-70 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-glass-border">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSave}
            disabled={!name.trim() || hashtags.length === 0}
          >
            {collection ? 'Save Changes' : 'Create Collection'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function HashtagCollections() {
  const {
    hashtagCollections,
    addHashtagCollection,
    updateHashtagCollection,
    deleteHashtagCollection,
    incrementHashtagCollectionUsage,
    addNotification,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<HashtagCollection | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter collections
  const filteredCollections = useMemo(() => {
    if (!searchQuery) return hashtagCollections;
    const query = searchQuery.toLowerCase();
    return hashtagCollections.filter(
      (col) =>
        col.name.toLowerCase().includes(query) ||
        col.description?.toLowerCase().includes(query) ||
        col.hashtags.some((h) => h.includes(query))
    );
  }, [hashtagCollections, searchQuery]);

  const handleCopy = async (collection: HashtagCollection) => {
    const text = collection.hashtags.map((h) => `#${h}`).join(' ');
    await navigator.clipboard.writeText(text);
    setCopiedId(collection.id);
    incrementHashtagCollectionUsage(collection.id);
    setTimeout(() => setCopiedId(null), 2000);
    addNotification({
      type: 'success',
      title: 'Copied!',
      message: `${collection.hashtags.length} hashtags copied to clipboard`,
    });
  };

  const handleSaveCollection = (collection: HashtagCollection) => {
    if (editingCollection) {
      updateHashtagCollection(collection.id, collection);
      addNotification({
        type: 'success',
        title: 'Collection Updated',
        message: `"${collection.name}" has been updated`,
      });
    } else {
      addHashtagCollection(collection);
      addNotification({
        type: 'success',
        title: 'Collection Created',
        message: `"${collection.name}" with ${collection.hashtags.length} hashtags`,
      });
    }
    setEditingCollection(null);
    setShowCreateModal(false);
  };

  const handleDeleteCollection = (collection: HashtagCollection) => {
    if (confirm(`Delete "${collection.name}"? This action cannot be undone.`)) {
      deleteHashtagCollection(collection.id);
      addNotification({
        type: 'info',
        title: 'Collection Deleted',
        message: `"${collection.name}" has been removed`,
      });
    }
  };

  const getColorStyle = (colorId: string) => {
    return colorOptions.find((c) => c.id === colorId) || colorOptions[0];
  };

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
          <h1 className="text-3xl font-bold gradient-text mb-2">Hashtag Collections</h1>
          <p className="text-gray-400">
            Organize and quickly apply your favorite hashtag groups
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          New Collection
        </Button>
      </div>

      {/* Search */}
      <GlassCard className="p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections or hashtags..."
            className="w-full bg-white/5 border border-glass-border rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
          />
        </div>
      </GlassCard>

      {/* Collections Grid */}
      {filteredCollections.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Hash size={32} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {hashtagCollections.length === 0 ? 'No collections yet' : 'No matching collections'}
          </h3>
          <p className="text-gray-400 mb-4">
            {hashtagCollections.length === 0
              ? 'Create your first hashtag collection to speed up posting'
              : 'Try adjusting your search'}
          </p>
          {hashtagCollections.length === 0 && (
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Create Collection
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCollections.map((collection, index) => {
            const colorStyle = getColorStyle(collection.color);
            const isExpanded = expandedId === collection.id;

            return (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${colorStyle.bg} border ${colorStyle.border} flex items-center justify-center`}
                      >
                        <Hash size={20} className={colorStyle.text} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{collection.name}</h3>
                        <p className="text-xs text-gray-500">
                          {collection.hashtags.length} hashtags
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(collection)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        title="Copy all hashtags"
                      >
                        {copiedId === collection.id ? (
                          <Check size={16} className="text-success" />
                        ) : (
                          <Copy size={16} className="text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingCollection(collection)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        title="Edit collection"
                      >
                        <Edit2 size={16} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(collection)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        title="Delete collection"
                      >
                        <Trash2 size={16} className="text-gray-400 hover:text-critical" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {collection.description && (
                    <p className="text-sm text-gray-400 mb-3">{collection.description}</p>
                  )}

                  {/* Platform Badge */}
                  {collection.platform !== 'all' && (
                    <div className="mb-3">
                      <Badge variant="info" size="sm">
                        {collection.platform}
                      </Badge>
                    </div>
                  )}

                  {/* Hashtags Preview */}
                  <div className="flex flex-wrap gap-1.5">
                    {(isExpanded ? collection.hashtags : collection.hashtags.slice(0, 8)).map(
                      (tag) => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-1 rounded-lg ${colorStyle.bg} ${colorStyle.text}`}
                        >
                          #{tag}
                        </span>
                      )
                    )}
                    {!isExpanded && collection.hashtags.length > 8 && (
                      <button
                        onClick={() => setExpandedId(collection.id)}
                        className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                      >
                        +{collection.hashtags.length - 8} more
                      </button>
                    )}
                    {isExpanded && collection.hashtags.length > 8 && (
                      <button
                        onClick={() => setExpandedId(null)}
                        className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                      >
                        Show less
                      </button>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 mt-3 border-t border-glass-border">
                    <span>
                      Created {new Date(collection.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <BarChart2 size={12} />
                      Used {collection.usageCount}x
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingCollection) && (
          <CollectionModal
            collection={editingCollection || undefined}
            onClose={() => {
              setShowCreateModal(false);
              setEditingCollection(null);
            }}
            onSave={handleSaveCollection}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
