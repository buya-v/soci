import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  Film,
  Plus,
  Search,
  FolderPlus,
  Folder,
  Trash2,
  Copy,
  Check,
  X,
  Grid,
  List,
  ExternalLink,
  Edit2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import type { MediaItem, MediaFolder } from '@/types';

const folderColors = [
  { id: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  { id: 'purple', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  { id: 'pink', bg: 'bg-pink-500/20', text: 'text-pink-400' },
  { id: 'green', bg: 'bg-green-500/20', text: 'text-green-400' },
  { id: 'orange', bg: 'bg-orange-500/20', text: 'text-orange-400' },
  { id: 'yellow', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
];

interface MediaModalProps {
  item?: MediaItem;
  onClose: () => void;
  onSave: (item: MediaItem) => void;
  folders: MediaFolder[];
}

function MediaModal({ item, onClose, onSave, folders }: MediaModalProps) {
  const [name, setName] = useState(item?.name || '');
  const [url, setUrl] = useState(item?.url || '');
  const [type, setType] = useState<'image' | 'video' | 'gif'>(item?.type || 'image');
  const [tags, setTags] = useState<string[]>(item?.tags || []);
  const [folderId, setFolderId] = useState<string | undefined>(item?.folderId);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    const clean = newTag.trim().toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = () => {
    if (!name.trim() || !url.trim()) return;

    const now = new Date().toISOString();
    const newItem: MediaItem = {
      id: item?.id || crypto.randomUUID(),
      name: name.trim(),
      type,
      url: url.trim(),
      thumbnailUrl: type === 'image' ? url.trim() : undefined,
      size: item?.size || 0,
      dimensions: item?.dimensions,
      tags,
      folderId,
      createdAt: item?.createdAt || now,
      usageCount: item?.usageCount || 0,
    };

    onSave(newItem);
    onClose();
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
        className="glass-panel rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {item ? 'Edit Media' : 'Add Media'}
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
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Hero Image"
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
            />
          </div>

          {/* Preview */}
          {url && type === 'image' && (
            <div className="aspect-video bg-white/5 rounded-xl overflow-hidden">
              <img
                src={url}
                alt="Preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Type & Folder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'image', icon: ImageIcon },
                  { id: 'video', icon: Video },
                  { id: 'gif', icon: Film },
                ].map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setType(id as 'image' | 'video' | 'gif')}
                    className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                      type === id
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm capitalize">{id}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Folder
              </label>
              <select
                value={folderId || ''}
                onChange={(e) => setFolderId(e.target.value || undefined)}
                className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white appearance-none cursor-pointer focus:border-primary transition-colors"
              >
                <option value="" className="bg-gray-900">
                  No folder
                </option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id} className="bg-gray-900">
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-white/5 text-gray-300 border border-glass-border"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-critical transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="flex-1 bg-white/5 border border-glass-border rounded-xl py-2 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors text-sm"
              />
              <Button variant="secondary" size="sm" onClick={handleAddTag}>
                <Plus size={16} />
              </Button>
            </div>
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
            disabled={!name.trim() || !url.trim()}
          >
            {item ? 'Save Changes' : 'Add Media'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface FolderModalProps {
  folder?: MediaFolder;
  onClose: () => void;
  onSave: (folder: MediaFolder) => void;
}

function FolderModal({ folder, onClose, onSave }: FolderModalProps) {
  const [name, setName] = useState(folder?.name || '');
  const [color, setColor] = useState(folder?.color || 'blue');

  const handleSave = () => {
    if (!name.trim()) return;

    const now = new Date().toISOString();
    const newFolder: MediaFolder = {
      id: folder?.id || crypto.randomUUID(),
      name: name.trim(),
      color,
      itemCount: folder?.itemCount || 0,
      createdAt: folder?.createdAt || now,
    };

    onSave(newFolder);
    onClose();
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
          <h3 className="text-xl font-bold text-white">
            {folder ? 'Edit Folder' : 'Create Folder'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Folder Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Images, Logos"
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {folderColors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`w-10 h-10 rounded-xl ${c.bg} border-2 transition-all flex items-center justify-center ${
                    color === c.id ? 'border-white/50 scale-110' : 'border-transparent'
                  }`}
                >
                  <Folder size={18} className={c.text} />
                </button>
              ))}
            </div>
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
            disabled={!name.trim()}
          >
            {folder ? 'Save Changes' : 'Create Folder'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function MediaLibrary() {
  const {
    mediaItems,
    mediaFolders,
    addMediaItem,
    updateMediaItem,
    deleteMediaItem,
    addMediaFolder,
    updateMediaFolder,
    deleteMediaFolder,
    addNotification,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'gif'>('all');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter media items
  const filteredItems = useMemo(() => {
    return mediaItems.filter((item) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          item.name.toLowerCase().includes(query) ||
          item.tags.some((t) => t.includes(query));
        if (!matches) return false;
      }

      // Folder filter
      if (selectedFolder !== null) {
        if (selectedFolder === 'unfiled' && item.folderId) return false;
        if (selectedFolder !== 'unfiled' && item.folderId !== selectedFolder) return false;
      }

      // Type filter
      if (filterType !== 'all' && item.type !== filterType) return false;

      return true;
    });
  }, [mediaItems, searchQuery, selectedFolder, filterType]);

  // Get folder item counts
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { unfiled: 0 };
    mediaFolders.forEach((f) => (counts[f.id] = 0));
    mediaItems.forEach((item) => {
      if (item.folderId && counts[item.folderId] !== undefined) {
        counts[item.folderId]++;
      } else {
        counts.unfiled++;
      }
    });
    return counts;
  }, [mediaItems, mediaFolders]);

  const handleCopyUrl = async (item: MediaItem) => {
    await navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
    addNotification({
      type: 'success',
      title: 'Copied!',
      message: 'URL copied to clipboard',
    });
  };

  const handleSaveMedia = (item: MediaItem) => {
    if (editingMedia) {
      updateMediaItem(item.id, item);
      addNotification({
        type: 'success',
        title: 'Media Updated',
        message: `"${item.name}" has been updated`,
      });
    } else {
      addMediaItem(item);
      addNotification({
        type: 'success',
        title: 'Media Added',
        message: `"${item.name}" has been added to your library`,
      });
    }
    setEditingMedia(null);
    setShowMediaModal(false);
  };

  const handleSaveFolder = (folder: MediaFolder) => {
    if (editingFolder) {
      updateMediaFolder(folder.id, folder);
      addNotification({
        type: 'success',
        title: 'Folder Updated',
        message: `"${folder.name}" has been updated`,
      });
    } else {
      addMediaFolder(folder);
      addNotification({
        type: 'success',
        title: 'Folder Created',
        message: `"${folder.name}" has been created`,
      });
    }
    setEditingFolder(null);
    setShowFolderModal(false);
  };

  const handleDeleteMedia = (item: MediaItem) => {
    if (confirm(`Delete "${item.name}"? This action cannot be undone.`)) {
      deleteMediaItem(item.id);
      addNotification({
        type: 'info',
        title: 'Media Deleted',
        message: `"${item.name}" has been removed`,
      });
    }
  };

  const handleDeleteFolder = (folder: MediaFolder) => {
    if (confirm(`Delete "${folder.name}"? Media items will be moved to unfiled.`)) {
      deleteMediaFolder(folder.id);
      if (selectedFolder === folder.id) setSelectedFolder(null);
      addNotification({
        type: 'info',
        title: 'Folder Deleted',
        message: `"${folder.name}" has been removed`,
      });
    }
  };

  const getFolderColor = (colorId: string) => {
    return folderColors.find((c) => c.id === colorId) || folderColors[0];
  };

  const getTypeIcon = (type: 'image' | 'video' | 'gif') => {
    switch (type) {
      case 'video':
        return Video;
      case 'gif':
        return Film;
      default:
        return ImageIcon;
    }
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
          <h1 className="text-3xl font-bold gradient-text mb-2">Media Library</h1>
          <p className="text-gray-400">
            Store and organize your images, videos, and GIFs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowFolderModal(true)}>
            <FolderPlus size={18} />
            New Folder
          </Button>
          <Button variant="primary" onClick={() => setShowMediaModal(true)}>
            <Plus size={18} />
            Add Media
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Folders */}
        <div className="lg:w-64 shrink-0">
          <GlassCard className="p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Folders</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  selectedFolder === null
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder size={16} />
                  <span>All Media</span>
                </div>
                <span className="text-xs text-gray-500">{mediaItems.length}</span>
              </button>

              {mediaFolders.map((folder) => {
                const colorStyle = getFolderColor(folder.color);
                return (
                  <div
                    key={folder.id}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      selectedFolder === folder.id
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedFolder(folder.id)}
                      className="flex items-center gap-2 flex-1"
                    >
                      <Folder size={16} className={colorStyle.text} />
                      <span className="truncate">{folder.name}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">
                        {folderCounts[folder.id] || 0}
                      </span>
                      <button
                        onClick={() => setEditingFolder(folder)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                      >
                        <Edit2 size={12} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(folder)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                      >
                        <Trash2 size={12} className="text-gray-400 hover:text-critical" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setSelectedFolder('unfiled')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  selectedFolder === 'unfiled'
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder size={16} className="text-gray-500" />
                  <span>Unfiled</span>
                </div>
                <span className="text-xs text-gray-500">{folderCounts.unfiled}</span>
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Search & Filters */}
          <GlassCard className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search media..."
                  className="w-full bg-white/5 border border-glass-border rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
                />
              </div>

              {/* Type Filter */}
              <div className="flex gap-2">
                {(['all', 'image', 'video', 'gif'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      filterType === type
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                    }`}
                  >
                    {type === 'all' ? 'All' : type.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex border border-glass-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Media Grid/List */}
          {filteredItems.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <ImageIcon size={32} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {mediaItems.length === 0 ? 'No media yet' : 'No matching media'}
              </h3>
              <p className="text-gray-400 mb-4">
                {mediaItems.length === 0
                  ? 'Add your first media item to get started'
                  : 'Try adjusting your search or filters'}
              </p>
              {mediaItems.length === 0 && (
                <Button variant="primary" onClick={() => setShowMediaModal(true)}>
                  <Plus size={18} />
                  Add Media
                </Button>
              )}
            </GlassCard>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item, index) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="group relative"
                  >
                    <GlassCard className="p-0 overflow-hidden" hoverable>
                      {/* Image Preview */}
                      <div className="aspect-square bg-white/5 relative">
                        {item.type === 'image' || item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl || item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TypeIcon size={48} className="text-gray-600" />
                          </div>
                        )}

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2">
                          <Badge variant="default" size="sm">
                            <TypeIcon size={10} />
                            {item.type}
                          </Badge>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleCopyUrl(item)}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            title="Copy URL"
                          >
                            {copiedId === item.id ? (
                              <Check size={16} className="text-success" />
                            ) : (
                              <Copy size={16} className="text-white" />
                            )}
                          </button>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink size={16} className="text-white" />
                          </a>
                          <button
                            onClick={() => setEditingMedia(item)}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} className="text-white" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(item)}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-white" />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-white truncate">
                          {item.name}
                        </h4>
                        {item.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 overflow-hidden">
                            {item.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 2 && (
                              <span className="text-xs text-gray-600">
                                +{item.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item, index) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <GlassCard className="p-3">
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden shrink-0">
                          {item.type === 'image' || item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl || item.url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <TypeIcon size={24} className="text-gray-600" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="default" size="sm">
                              <TypeIcon size={10} />
                              {item.type}
                            </Badge>
                            {item.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyUrl(item)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            title="Copy URL"
                          >
                            {copiedId === item.id ? (
                              <Check size={16} className="text-success" />
                            ) : (
                              <Copy size={16} className="text-gray-400" />
                            )}
                          </button>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            title="Open"
                          >
                            <ExternalLink size={16} className="text-gray-400" />
                          </a>
                          <button
                            onClick={() => setEditingMedia(item)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} className="text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(item)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-gray-400 hover:text-critical" />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(showMediaModal || editingMedia) && (
          <MediaModal
            item={editingMedia || undefined}
            folders={mediaFolders}
            onClose={() => {
              setShowMediaModal(false);
              setEditingMedia(null);
            }}
            onSave={handleSaveMedia}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showFolderModal || editingFolder) && (
          <FolderModal
            folder={editingFolder || undefined}
            onClose={() => {
              setShowFolderModal(false);
              setEditingFolder(null);
            }}
            onSave={handleSaveFolder}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
