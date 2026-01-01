import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Check,
  X,
  Filter,
  Sparkles,
  Tag,
  Clock,
  BarChart2,
  ChevronDown,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import type { ContentTemplate, TemplateCategory, Platform } from '@/types';

const categoryOptions: { id: TemplateCategory; label: string; color: string }[] = [
  { id: 'promotional', label: 'Promotional', color: 'text-pink-400' },
  { id: 'educational', label: 'Educational', color: 'text-blue-400' },
  { id: 'engagement', label: 'Engagement', color: 'text-green-400' },
  { id: 'storytelling', label: 'Storytelling', color: 'text-purple-400' },
  { id: 'announcement', label: 'Announcement', color: 'text-orange-400' },
  { id: 'behind-the-scenes', label: 'Behind the Scenes', color: 'text-yellow-400' },
  { id: 'user-generated', label: 'User Generated', color: 'text-teal-400' },
  { id: 'trending', label: 'Trending', color: 'text-red-400' },
];

const platformOptions: { id: Platform | 'all'; label: string }[] = [
  { id: 'all', label: 'All Platforms' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
];

interface TemplateModalProps {
  template?: ContentTemplate;
  onClose: () => void;
  onSave: (template: ContentTemplate) => void;
}

function TemplateModal({ template, onClose, onSave }: TemplateModalProps) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [content, setContent] = useState(template?.content || '');
  const [hashtags, setHashtags] = useState<string[]>(template?.hashtags || []);
  const [platform, setPlatform] = useState<Platform | 'all'>(template?.platform || 'all');
  const [category, setCategory] = useState<TemplateCategory>(template?.category || 'promotional');
  const [newHashtag, setNewHashtag] = useState('');

  const handleAddHashtag = () => {
    const clean = newHashtag.replace(/^#/, '').trim();
    if (clean && !hashtags.includes(clean)) {
      setHashtags([...hashtags, clean]);
    }
    setNewHashtag('');
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((h) => h !== tag));
  };

  const handleSave = () => {
    if (!name.trim() || !content.trim()) return;

    const now = new Date().toISOString();
    const newTemplate: ContentTemplate = {
      id: template?.id || crypto.randomUUID(),
      name: name.trim(),
      description: description.trim() || undefined,
      content: content.trim(),
      hashtags,
      platform,
      category,
      variables: extractVariables(content),
      createdAt: template?.createdAt || now,
      updatedAt: now,
      usageCount: template?.usageCount || 0,
    };

    onSave(newTemplate);
    onClose();
  };

  // Extract {{variable}} patterns from content
  const extractVariables = (text: string) => {
    const matches = text.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches)].map((match) => ({
      name: match.replace(/\{\{|\}\}/g, ''),
      defaultValue: '',
    }));
  };

  const detectedVariables = extractVariables(content);

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
        className="glass-panel rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {template ? 'Edit Template' : 'Create Template'}
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
              Template Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Launch Announcement"
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
              placeholder="Brief description of when to use this template"
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
            />
          </div>

          {/* Category & Platform */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                  className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white appearance-none cursor-pointer focus:border-primary transition-colors"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-gray-900">
                      {cat.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platform
              </label>
              <div className="relative">
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
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template Content *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Use {'{{variable}}'} syntax for dynamic placeholders (e.g., {'{{product_name}}'})
            </p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Example:\n\nIntroducing {{product_name}}!\n\n{{key_benefit}} that will transform your {{use_case}}.\n\nGet yours today and experience the difference.`}
              rows={6}
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors resize-none font-mono text-sm"
            />
            {detectedVariables.length > 0 && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Detected variables:</span>
                {detectedVariables.map((v) => (
                  <span
                    key={v.name}
                    className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded"
                  >
                    {v.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Default Hashtags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-white/5 text-gray-300 border border-glass-border"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveHashtag(tag)}
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
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag()}
                placeholder="Add hashtag..."
                className="flex-1 bg-white/5 border border-glass-border rounded-xl py-2 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors text-sm"
              />
              <Button variant="secondary" size="sm" onClick={handleAddHashtag}>
                <Plus size={16} />
                Add
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
            disabled={!name.trim() || !content.trim()}
          >
            {template ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function TemplatesLibrary() {
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    incrementTemplateUsage,
    addNotification,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<TemplateCategory | 'all'>('all');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContentTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          template.name.toLowerCase().includes(query) ||
          template.content.toLowerCase().includes(query) ||
          template.description?.toLowerCase().includes(query) ||
          template.hashtags.some((h) => h.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filterCategory !== 'all' && template.category !== filterCategory) {
        return false;
      }

      // Platform filter
      if (filterPlatform !== 'all' && template.platform !== 'all' && template.platform !== filterPlatform) {
        return false;
      }

      return true;
    });
  }, [templates, searchQuery, filterCategory, filterPlatform]);

  const handleCopy = async (template: ContentTemplate) => {
    await navigator.clipboard.writeText(template.content);
    setCopiedId(template.id);
    incrementTemplateUsage(template.id);
    setTimeout(() => setCopiedId(null), 2000);
    addNotification({
      type: 'success',
      title: 'Copied!',
      message: `Template "${template.name}" copied to clipboard`,
    });
  };

  const handleSaveTemplate = (template: ContentTemplate) => {
    if (editingTemplate) {
      updateTemplate(template.id, template);
      addNotification({
        type: 'success',
        title: 'Template Updated',
        message: `"${template.name}" has been updated`,
      });
    } else {
      addTemplate(template);
      addNotification({
        type: 'success',
        title: 'Template Created',
        message: `"${template.name}" has been added to your library`,
      });
    }
    setEditingTemplate(null);
    setShowCreateModal(false);
  };

  const handleDeleteTemplate = (template: ContentTemplate) => {
    if (confirm(`Delete "${template.name}"? This action cannot be undone.`)) {
      deleteTemplate(template.id);
      addNotification({
        type: 'info',
        title: 'Template Deleted',
        message: `"${template.name}" has been removed`,
      });
    }
  };

  const getCategoryColor = (cat: TemplateCategory) => {
    return categoryOptions.find((c) => c.id === cat)?.color || 'text-gray-400';
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
          <h1 className="text-3xl font-bold gradient-text mb-2">Content Templates</h1>
          <p className="text-gray-400">
            Save and reuse your best-performing content templates
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          New Template
        </Button>
      </div>

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
              placeholder="Search templates..."
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filters
            {(filterCategory !== 'all' || filterPlatform !== 'all') && (
              <span className="ml-1 w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-4 border-t border-glass-border">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filterCategory === 'all'
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                      }`}
                    >
                      All
                    </button>
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          filterCategory === cat.id
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Platform
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {platformOptions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setFilterPlatform(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          filterPlatform === p.id
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {templates.length === 0 ? 'No templates yet' : 'No matching templates'}
          </h3>
          <p className="text-gray-400 mb-4">
            {templates.length === 0
              ? 'Create your first template to speed up content creation'
              : 'Try adjusting your search or filters'}
          </p>
          {templates.length === 0 && (
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Create Template
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-4 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{template.name}</h3>
                    {template.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {template.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleCopy(template)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedId === template.id ? (
                        <Check size={16} className="text-success" />
                      ) : (
                        <Copy size={16} className="text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                      title="Edit template"
                    >
                      <Edit2 size={16} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                      title="Delete template"
                    >
                      <Trash2 size={16} className="text-gray-400 hover:text-critical" />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default" size="sm">
                    <Tag size={10} className={getCategoryColor(template.category)} />
                    {categoryOptions.find((c) => c.id === template.category)?.label}
                  </Badge>
                  {template.platform !== 'all' && (
                    <Badge variant="info" size="sm">
                      {template.platform}
                    </Badge>
                  )}
                </div>

                {/* Content Preview */}
                <div className="flex-1 bg-white/5 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-300 line-clamp-4 font-mono">
                    {template.content}
                  </p>
                </div>

                {/* Hashtags */}
                {template.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.hashtags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {template.hashtags.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{template.hashtags.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Variables */}
                {template.variables.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={12} className="text-purple-400" />
                    <span className="text-xs text-gray-500">
                      {template.variables.length} variable
                      {template.variables.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-glass-border">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart2 size={12} />
                    Used {template.usageCount}x
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingTemplate) && (
          <TemplateModal
            template={editingTemplate || undefined}
            onClose={() => {
              setShowCreateModal(false);
              setEditingTemplate(null);
            }}
            onSave={handleSaveTemplate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
