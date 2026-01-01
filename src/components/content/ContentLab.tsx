import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Image as ImageIcon,
  Hash,
  Calendar,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  RefreshCw,
  Copy,
  Layers,
  X,
  Plus,
  Check,
  Repeat2,
  ThumbsUp,
  Share2,
  Music2,
  Play,
  Undo2,
  Redo2,
  BookTemplate,
  ChevronDown,
} from 'lucide-react';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import {
  generateContent,
  generateContentVariations,
  generateImage,
  isAnthropicConfigured,
  isOpenAIConfigured,
  initAnthropicClient,
  initOpenAIClient,
  type ContentVariation,
} from '@/services/ai';
import { predictEngagement, suggestHashtags, type EngagementPrediction } from '@/services/predictions';
import { PerformancePrediction } from './PerformancePrediction';
import type { Platform, Persona, ContentTemplate, HashtagCollection } from '@/types';

const toneOptions: Persona['tone'][] = ['professional', 'casual', 'witty', 'inspirational'];
const platformOptions: { id: Platform; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
];

const platformCharLimits: Record<Platform, { caption: number; hashtags: number }> = {
  instagram: { caption: 2200, hashtags: 30 },
  twitter: { caption: 280, hashtags: 5 },
  linkedin: { caption: 3000, hashtags: 5 },
  tiktok: { caption: 150, hashtags: 10 },
};

interface GeneratedPost {
  caption: string;
  hashtags: string[];
  hook?: string;
  callToAction?: string;
  imageUrl?: string;
}

// Platform-specific mockup components
interface MockupProps {
  post: GeneratedPost | null;
  username?: string;
}

function InstagramMockup({ post, username = 'soci_ai' }: MockupProps) {
  return (
    <div className="bg-black rounded-[2rem] p-3 max-w-[320px] mx-auto border-4 border-gray-800">
      <div className="bg-surface rounded-[1.5rem] overflow-hidden">
        {/* Instagram Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 p-0.5">
              <div className="w-full h-full rounded-full bg-surface" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{username}</p>
              <p className="text-[10px] text-gray-500">Sponsored</p>
            </div>
          </div>
          <MoreHorizontal size={20} className="text-gray-400" />
        </div>

        {/* Image Area */}
        <div className="aspect-square bg-gray-900 flex items-center justify-center relative">
          {post?.imageUrl ? (
            <img src={post.imageUrl} alt="Generated content" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-gray-600">
              <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Image preview</p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Heart size={24} className="text-white hover:text-red-500 cursor-pointer transition-colors" />
            <MessageCircle size={24} className="text-white" />
            <Send size={24} className="text-white" />
          </div>
          <Bookmark size={24} className="text-white" />
        </div>

        {/* Engagement */}
        <div className="px-4 pb-2">
          <p className="text-sm font-semibold text-white">1,234 likes</p>
        </div>

        {/* Caption */}
        <div className="px-4 pb-4 max-h-32 overflow-y-auto">
          {post ? (
            <>
              <p className="text-sm text-white">
                <span className="font-semibold">{username}</span>{' '}
                {post.caption.length > 150 ? `${post.caption.slice(0, 150)}...` : post.caption}
              </p>
              <p className="text-sm text-primary mt-2">
                {post.hashtags.slice(0, 10).map(h => `#${h}`).join(' ')}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">Your caption will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TwitterMockup({ post, username = 'soci_ai' }: MockupProps) {
  const charCount = post ? post.caption.length + post.hashtags.join(' ').length + post.hashtags.length : 0;
  const isOverLimit = charCount > 280;

  return (
    <div className="bg-black rounded-[2rem] p-3 max-w-[320px] mx-auto border-4 border-gray-800">
      <div className="bg-surface rounded-[1.5rem] overflow-hidden">
        {/* Twitter Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-bg" />
            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-bold text-white">{username}</p>
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500">@{username}</p>
            </div>
          </div>
          <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        {/* Tweet Content */}
        <div className="px-4 py-3">
          {post ? (
            <>
              <p className="text-sm text-white whitespace-pre-wrap">
                {post.caption}
              </p>
              <p className="text-sm text-blue-400 mt-2">
                {post.hashtags.slice(0, 3).map(h => `#${h}`).join(' ')}
              </p>
              {isOverLimit && (
                <p className="text-xs text-red-400 mt-2">
                  {charCount}/280 - Over character limit
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">Your tweet will appear here...</p>
          )}
        </div>

        {/* Image */}
        {post?.imageUrl && (
          <div className="mx-4 mb-3 rounded-xl overflow-hidden">
            <img src={post.imageUrl} alt="Tweet media" className="w-full aspect-video object-cover" />
          </div>
        )}

        {/* Stats */}
        <div className="px-4 py-2 text-xs text-gray-500 border-t border-glass-border">
          <span>2:30 PM · Jan 1, 2026</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-8 py-3 border-t border-glass-border">
          <MessageCircle size={18} className="text-gray-500" />
          <Repeat2 size={18} className="text-gray-500" />
          <Heart size={18} className="text-gray-500" />
          <Share2 size={18} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
}

function LinkedInMockup({ post, username = 'SOCI AI' }: MockupProps) {
  return (
    <div className="bg-black rounded-[2rem] p-3 max-w-[320px] mx-auto border-4 border-gray-800">
      <div className="bg-surface rounded-[1.5rem] overflow-hidden">
        {/* LinkedIn Header */}
        <div className="flex items-start gap-3 px-4 py-3 border-b border-glass-border">
          <div className="w-12 h-12 rounded-full gradient-bg shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{username}</p>
            <p className="text-xs text-gray-500 truncate">Content Creator | AI Enthusiast</p>
            <p className="text-xs text-gray-600">1h · <span className="inline-flex items-center"><Globe size={10} className="mr-1" /> Public</span></p>
          </div>
          <MoreHorizontal size={20} className="text-gray-400 shrink-0" />
        </div>

        {/* Post Content */}
        <div className="px-4 py-3">
          {post ? (
            <>
              <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                {post.caption.length > 200 ? `${post.caption.slice(0, 200)}...` : post.caption}
              </p>
              {post.caption.length > 200 && (
                <button className="text-sm text-gray-400 hover:text-primary mt-1">...see more</button>
              )}
              <p className="text-sm text-blue-400 mt-3">
                {post.hashtags.slice(0, 5).map(h => `#${h}`).join(' ')}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">Your LinkedIn post will appear here...</p>
          )}
        </div>

        {/* Image */}
        {post?.imageUrl && (
          <div className="w-full aspect-video bg-gray-900">
            <img src={post.imageUrl} alt="Post media" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Engagement Stats */}
        <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-t border-glass-border">
          <div className="flex items-center gap-1">
            <span className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">👍</span>
              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px]">❤️</span>
              <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[8px]">👏</span>
            </span>
            <span>128</span>
          </div>
          <span>24 comments · 12 reposts</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-2 py-2 border-t border-glass-border">
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
            <ThumbsUp size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">Like</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
            <MessageCircle size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">Comment</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
            <Repeat2 size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">Repost</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
            <Send size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Globe icon for LinkedIn
function Globe({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function TikTokMockup({ post, username = 'soci_ai' }: MockupProps) {
  return (
    <div className="bg-black rounded-[2rem] p-3 max-w-[320px] mx-auto border-4 border-gray-800">
      <div className="bg-black rounded-[1.5rem] overflow-hidden relative" style={{ aspectRatio: '9/16' }}>
        {/* Video Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
          {post?.imageUrl ? (
            <img src={post.imageUrl} alt="Video thumbnail" className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="text-center text-gray-600">
              <Play size={64} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm opacity-50">Video preview</p>
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full gradient-bg border-2 border-white" />
            <div className="w-5 h-5 rounded-full bg-red-500 -mt-2 flex items-center justify-center">
              <Plus size={12} className="text-white" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Heart size={28} className="text-white" />
            <span className="text-xs text-white">12.3K</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle size={28} className="text-white" />
            <span className="text-xs text-white">342</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Bookmark size={28} className="text-white" />
            <span className="text-xs text-white">1.2K</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Share2 size={28} className="text-white" />
            <span className="text-xs text-white">Share</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-600 animate-spin-slow flex items-center justify-center">
            <Music2 size={14} className="text-white" />
          </div>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-4 left-3 right-16">
          <p className="text-sm font-semibold text-white mb-1">@{username}</p>
          {post ? (
            <>
              <p className="text-xs text-white mb-2 line-clamp-2">
                {post.caption.length > 100 ? `${post.caption.slice(0, 100)}...` : post.caption}
              </p>
              <p className="text-xs text-white opacity-80">
                {post.hashtags.slice(0, 3).map(h => `#${h}`).join(' ')}
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-400 italic">Your caption will appear here...</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <Music2 size={12} className="text-white" />
            <div className="overflow-hidden">
              <p className="text-xs text-white whitespace-nowrap animate-marquee">
                Original Sound - {username}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContentLab() {
  const {
    apiKeys,
    addNotification,
    addActivity,
    persona,
    setActiveView,
    addPost,
    templates,
    hashtagCollections,
    incrementTemplateUsage,
    incrementHashtagCollectionUsage,
  } = useAppStore();
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<Persona['tone']>('professional');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [variations, setVariations] = useState<ContentVariation[]>([]);
  const [showVariations, setShowVariations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingHashtags, setEditingHashtags] = useState(false);
  const [newHashtag, setNewHashtag] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [prediction, setPrediction] = useState<EngagementPrediction | null>(null);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [showTemplatesPicker, setShowTemplatesPicker] = useState(false);
  const [showHashtagsPicker, setShowHashtagsPicker] = useState(false);

  // Undo/redo for caption editing
  const {
    state: captionHistory,
    setState: setCaptionHistory,
    undo: undoCaption,
    redo: redoCaption,
    canUndo,
    canRedo,
    reset: resetCaptionHistory,
  } = useUndoRedo<string>('');

  // Sync caption with generatedPost
  const updateCaption = useCallback((newCaption: string) => {
    setCaptionHistory(newCaption);
    if (generatedPost) {
      setGeneratedPost({ ...generatedPost, caption: newCaption });
    }
  }, [generatedPost, setCaptionHistory]);

  // Handle undo with syncing to generatedPost
  const handleUndo = useCallback(() => {
    undoCaption();
  }, [undoCaption]);

  const handleRedo = useCallback(() => {
    redoCaption();
  }, [redoCaption]);

  // Sync undo/redo state back to generatedPost
  useEffect(() => {
    if (generatedPost && captionHistory !== generatedPost.caption) {
      setGeneratedPost(prev => prev ? { ...prev, caption: captionHistory } : null);
    }
  }, [captionHistory]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditingCaption) return;

      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (canUndo) {
          e.preventDefault();
          handleUndo();
        }
      }

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y for redo
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
      ) {
        if (canRedo) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditingCaption, canUndo, canRedo, handleUndo, handleRedo]);

  // Update predictions when content changes
  useEffect(() => {
    if (generatedPost) {
      const newPrediction = predictEngagement(
        generatedPost.caption,
        generatedPost.hashtags,
        platform
      );
      setPrediction(newPrediction);
    } else {
      setPrediction(null);
    }
  }, [generatedPost?.caption, generatedPost?.hashtags, platform]);

  // Generate hashtag suggestions
  const handleGetHashtagSuggestions = useCallback(() => {
    if (generatedPost) {
      const suggestions = suggestHashtags(
        generatedPost.caption,
        platform,
        generatedPost.hashtags
      );
      setSuggestedHashtags(suggestions);
      setShowHashtagSuggestions(true);
    }
  }, [generatedPost, platform]);

  // Add suggested hashtag
  const handleAddSuggestedHashtag = useCallback((tag: string) => {
    if (generatedPost && !generatedPost.hashtags.includes(tag)) {
      setGeneratedPost({
        ...generatedPost,
        hashtags: [...generatedPost.hashtags, tag],
      });
      setSuggestedHashtags(prev => prev.filter(t => t !== tag));
    }
  }, [generatedPost]);

  // Initialize clients with stored API keys
  useEffect(() => {
    if (apiKeys.anthropic) {
      initAnthropicClient(apiKeys.anthropic);
    }
    if (apiKeys.openai) {
      initOpenAIClient(apiKeys.openai);
    }
  }, [apiKeys.anthropic, apiKeys.openai]);

  const anthropicReady = isAnthropicConfigured();
  const openaiReady = isOpenAIConfigured();

  // Filter templates by platform
  const availableTemplates = templates.filter(
    (t) => t.platform === 'all' || t.platform === platform
  );

  // Filter hashtag collections by platform
  const availableHashtagCollections = hashtagCollections.filter(
    (c) => c.platform === 'all' || c.platform === platform
  );

  // Apply a template
  const handleApplyTemplate = (template: ContentTemplate) => {
    const content = template.content;
    setGeneratedPost({
      caption: content,
      hashtags: [...template.hashtags],
    });
    resetCaptionHistory(content);
    incrementTemplateUsage(template.id);
    setShowTemplatesPicker(false);
    addNotification({
      type: 'success',
      title: 'Template Applied',
      message: `"${template.name}" loaded. Edit variables as needed.`,
    });
  };

  // Apply hashtag collection
  const handleApplyHashtagCollection = (collection: HashtagCollection) => {
    if (generatedPost) {
      const newHashtags = [...new Set([...generatedPost.hashtags, ...collection.hashtags])];
      setGeneratedPost({
        ...generatedPost,
        hashtags: newHashtags,
      });
    } else {
      setGeneratedPost({
        caption: '',
        hashtags: [...collection.hashtags],
      });
      resetCaptionHistory('');
    }
    incrementHashtagCollectionUsage(collection.id);
    setShowHashtagsPicker(false);
    addNotification({
      type: 'success',
      title: 'Hashtags Added',
      message: `Added ${collection.hashtags.length} hashtags from "${collection.name}"`,
    });
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    if (!anthropicReady) {
      setError('Please configure your Anthropic API key in Automation Hub to generate content.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateContent({
        topic,
        platform,
        tone,
        niche: persona?.niche,
        targetAudience: persona?.targetAudience,
        includeHashtags: true,
      });

      setGeneratedPost({
        caption: result.caption,
        hashtags: result.hashtags,
        hook: result.hook,
        callToAction: result.callToAction,
      });

      // Reset undo/redo history with new caption
      resetCaptionHistory(result.caption);

      addActivity({
        id: crypto.randomUUID(),
        action: 'Content Generated',
        description: `Created ${platform} post about "${topic}"`,
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      addNotification({
        type: 'success',
        title: 'Content Generated',
        message: `Your ${platform} post is ready!`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate content';
      setError(message);
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedPost) return;

    if (!openaiReady) {
      setError('Please configure your OpenAI API key in Automation Hub to generate images.');
      return;
    }

    setIsGeneratingImage(true);
    setError(null);

    try {
      const imageUrl = await generateImage({
        prompt: `${topic}: ${generatedPost.caption.slice(0, 100)}`,
        style: 'vivid',
        size: platform === 'tiktok' ? '1024x1792' : platform === 'instagram' ? '1024x1024' : '1792x1024',
      });

      setGeneratedPost(prev => prev ? { ...prev, imageUrl } : null);

      addActivity({
        id: crypto.randomUUID(),
        action: 'Image Generated',
        description: `Created image for "${topic}" post`,
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      addNotification({
        type: 'success',
        title: 'Image Generated',
        message: 'Your AI image is ready!',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate image';
      setError(message);
      addNotification({
        type: 'error',
        title: 'Image Generation Failed',
        message,
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGoToSettings = () => {
    setActiveView('automation');
  };

  const handleGenerateVariations = async () => {
    if (!topic.trim() || !anthropicReady) return;

    setIsGeneratingVariations(true);
    setError(null);

    try {
      const result = await generateContentVariations({
        topic,
        platform,
        tone,
        niche: persona?.niche,
        targetAudience: persona?.targetAudience,
      }, 3);

      setVariations(result);
      setShowVariations(true);

      addNotification({
        type: 'success',
        title: 'Variations Generated',
        message: `Created ${result.length} content variations`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate variations';
      setError(message);
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  const handleSelectVariation = (variation: ContentVariation) => {
    setGeneratedPost({
      caption: variation.caption,
      hashtags: variation.hashtags,
    });
    resetCaptionHistory(variation.caption);
    setShowVariations(false);
    addNotification({
      type: 'info',
      title: 'Variation Selected',
      message: variation.angle,
    });
  };

  const handleRemoveHashtag = (index: number) => {
    if (!generatedPost) return;
    const newHashtags = generatedPost.hashtags.filter((_, i) => i !== index);
    setGeneratedPost({ ...generatedPost, hashtags: newHashtags });
  };

  const handleAddHashtag = () => {
    if (!generatedPost || !newHashtag.trim()) return;
    const cleanHashtag = newHashtag.replace(/^#/, '').trim();
    if (cleanHashtag && !generatedPost.hashtags.includes(cleanHashtag)) {
      setGeneratedPost({
        ...generatedPost,
        hashtags: [...generatedPost.hashtags, cleanHashtag],
      });
    }
    setNewHashtag('');
  };

  const handleCopyContent = async () => {
    if (!generatedPost) return;
    const content = `${generatedPost.caption}\n\n${generatedPost.hashtags.map(h => `#${h}`).join(' ')}`;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addNotification({
      type: 'success',
      title: 'Copied!',
      message: 'Content copied to clipboard',
    });
  };

  const handleSchedulePost = () => {
    if (!generatedPost) return;
    addPost({
      id: crypto.randomUUID(),
      content: generatedPost.caption,
      caption: generatedPost.caption,
      hashtags: generatedPost.hashtags,
      platform,
      status: 'draft',
      imageUrl: generatedPost.imageUrl,
    });
    addNotification({
      type: 'success',
      title: 'Post Saved',
      message: 'Post added to your drafts',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Content Lab</h1>
          <p className="text-gray-400">Generate AI-powered content for your audience</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            anthropicReady ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          }`}>
            <span className={`w-2 h-2 rounded-full ${anthropicReady ? 'bg-success' : 'bg-warning'}`} />
            Claude {anthropicReady ? 'Ready' : 'Not Configured'}
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            openaiReady ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          }`}>
            <span className={`w-2 h-2 rounded-full ${openaiReady ? 'bg-success' : 'bg-warning'}`} />
            DALL-E {openaiReady ? 'Ready' : 'Not Configured'}
          </div>
        </div>
      </div>

      {/* API Key Warning */}
      {(!anthropicReady || !openaiReady) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="text-warning shrink-0" size={20} />
            <p className="text-sm text-warning">
              {!anthropicReady && !openaiReady
                ? 'Configure your API keys in Automation Hub to enable AI generation.'
                : !anthropicReady
                ? 'Add Anthropic API key for content generation.'
                : 'Add OpenAI API key for image generation.'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleGoToSettings}>
            Configure
          </Button>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-critical/10 border border-critical/20 rounded-xl flex items-center gap-3"
        >
          <AlertCircle className="text-critical shrink-0" size={20} />
          <p className="text-sm text-critical">{error}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Controls */}
        <div className="space-y-6">
          {/* Topic Input */}
          <GlassCard className="p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Content Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., AI productivity tools, remote work tips..."
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
            />
          </GlassCard>

          {/* Quick Actions - Templates & Hashtags */}
          <div className="flex gap-3">
            {/* Templates Dropdown */}
            <div className="relative flex-1">
              <Button
                variant="secondary"
                className="w-full justify-between"
                onClick={() => {
                  setShowTemplatesPicker(!showTemplatesPicker);
                  setShowHashtagsPicker(false);
                }}
                disabled={availableTemplates.length === 0}
              >
                <span className="flex items-center gap-2">
                  <BookTemplate size={16} />
                  Use Template
                </span>
                <ChevronDown size={16} className={`transition-transform ${showTemplatesPicker ? 'rotate-180' : ''}`} />
              </Button>
              <AnimatePresence>
                {showTemplatesPicker && availableTemplates.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl border border-glass-border overflow-hidden z-20 max-h-64 overflow-y-auto"
                  >
                    {availableTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleApplyTemplate(template)}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-glass-border last:border-0"
                      >
                        <div className="font-medium text-white text-sm">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-gray-500 mt-0.5 truncate">{template.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
                            {template.category}
                          </span>
                          {template.variables.length > 0 && (
                            <span className="text-[10px] text-purple-400">
                              {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {availableTemplates.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No templates for {platform}. <button onClick={() => setActiveView('templates')} className="text-primary hover:underline">Create one</button>
                </p>
              )}
            </div>

            {/* Hashtags Dropdown */}
            <div className="relative flex-1">
              <Button
                variant="secondary"
                className="w-full justify-between"
                onClick={() => {
                  setShowHashtagsPicker(!showHashtagsPicker);
                  setShowTemplatesPicker(false);
                }}
                disabled={availableHashtagCollections.length === 0}
              >
                <span className="flex items-center gap-2">
                  <Hash size={16} />
                  Add Hashtags
                </span>
                <ChevronDown size={16} className={`transition-transform ${showHashtagsPicker ? 'rotate-180' : ''}`} />
              </Button>
              <AnimatePresence>
                {showHashtagsPicker && availableHashtagCollections.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl border border-glass-border overflow-hidden z-20 max-h-64 overflow-y-auto"
                  >
                    {availableHashtagCollections.map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() => handleApplyHashtagCollection(collection)}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-glass-border last:border-0"
                      >
                        <div className="font-medium text-white text-sm">{collection.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {collection.hashtags.length} hashtags
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {collection.hashtags.slice(0, 4).map((tag) => (
                            <span key={tag} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                          {collection.hashtags.length > 4 && (
                            <span className="text-[10px] text-gray-500">+{collection.hashtags.length - 4}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {availableHashtagCollections.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No collections for {platform}. <button onClick={() => setActiveView('hashtags')} className="text-primary hover:underline">Create one</button>
                </p>
              )}
            </div>
          </div>

          {/* Tone Selection */}
          <GlassCard className="p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Content Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {toneOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`
                    py-2.5 px-4 rounded-xl text-sm font-medium capitalize transition-all
                    ${tone === t
                      ? 'bg-primary/20 text-primary-light border border-primary/30'
                      : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                    }
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Platform Selection */}
          <GlassCard className="p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Target Platform
            </label>
            <div className="grid grid-cols-2 gap-2">
              {platformOptions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`
                    py-2.5 px-4 rounded-xl text-sm font-medium transition-all
                    ${platform === p.id
                      ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                      : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                    }
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating || isGeneratingImage || isGeneratingVariations}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating with Claude...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Content
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleGenerateImage}
              disabled={!generatedPost || isGenerating || isGeneratingImage || isGeneratingVariations}
              title={!openaiReady ? 'Configure OpenAI API key first' : 'Generate AI image'}
            >
              {isGeneratingImage ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ImageIcon size={18} />
              )}
            </Button>
          </div>

          {/* Secondary Actions */}
          {generatedPost && (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating || isGeneratingImage || isGeneratingVariations}
                className="flex-1"
              >
                <RefreshCw size={16} />
                Regenerate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateVariations}
                disabled={isGenerating || isGeneratingImage || isGeneratingVariations}
                className="flex-1"
              >
                {isGeneratingVariations ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Layers size={16} />
                )}
                Variations
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyContent}
                className="flex-1"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          )}
        </div>

        {/* Social Media Preview */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Preview</h3>
              <span className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded-lg capitalize">
                {platform} mockup
              </span>
            </div>

            {/* Platform-specific Mockup */}
            <AnimatePresence mode="wait">
              <motion.div
                key={platform}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {platform === 'instagram' && <InstagramMockup post={generatedPost} />}
                {platform === 'twitter' && <TwitterMockup post={generatedPost} />}
                {platform === 'linkedin' && <LinkedInMockup post={generatedPost} />}
                {platform === 'tiktok' && <TikTokMockup post={generatedPost} />}
              </motion.div>
            </AnimatePresence>

            {/* Platform Tips */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400">
                {platform === 'instagram' && 'Tip: Use up to 30 hashtags and keep captions under 2,200 characters.'}
                {platform === 'twitter' && 'Tip: Keep tweets under 280 characters. Use 1-3 hashtags for best engagement.'}
                {platform === 'linkedin' && 'Tip: Longer posts (500-1000 chars) perform better. Use 3-5 relevant hashtags.'}
                {platform === 'tiktok' && 'Tip: Keep captions short (under 150 chars). First 3 seconds are crucial for hooks.'}
              </p>
            </div>
          </GlassCard>

          {/* Editable Caption */}
          {generatedPost && (
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <MessageCircle size={16} />
                  Caption
                </h4>
                <div className="flex items-center gap-2">
                  {/* Undo/Redo buttons */}
                  <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className={`p-1.5 rounded-lg transition-colors ${
                      canUndo
                        ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                    title="Undo (Cmd+Z)"
                  >
                    <Undo2 size={16} />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className={`p-1.5 rounded-lg transition-colors ${
                      canRedo
                        ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                    title="Redo (Cmd+Shift+Z)"
                  >
                    <Redo2 size={16} />
                  </button>
                  {(() => {
                    const limit = platformCharLimits[platform].caption;
                    const current = generatedPost.caption.length;
                    const percentage = (current / limit) * 100;
                    const isWarning = percentage >= 80 && percentage < 100;
                    const isOver = percentage >= 100;
                    return (
                      <span className={`text-xs font-medium ${isOver ? 'text-critical' : isWarning ? 'text-warning' : 'text-gray-500'}`}>
                        {current.toLocaleString()}/{limit.toLocaleString()}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <textarea
                value={generatedPost.caption}
                onChange={(e) => updateCaption(e.target.value)}
                onFocus={() => setIsEditingCaption(true)}
                onBlur={() => setIsEditingCaption(false)}
                rows={4}
                className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-white placeholder-gray-500 transition-colors resize-none text-sm ${
                  generatedPost.caption.length > platformCharLimits[platform].caption
                    ? 'border-critical/50 focus:border-critical'
                    : 'border-glass-border focus:border-primary'
                }`}
                placeholder="Your caption will appear here..."
              />
              {generatedPost.caption.length > platformCharLimits[platform].caption && (
                <p className="text-xs text-critical mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Caption exceeds {platform} limit by {(generatedPost.caption.length - platformCharLimits[platform].caption).toLocaleString()} characters
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Tip: Use Cmd+Z to undo and Cmd+Shift+Z to redo while editing
              </p>
            </GlassCard>
          )}

          {/* Editable Hashtags */}
          {generatedPost && (
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Hash size={16} />
                  Hashtags
                  {(() => {
                    const limit = platformCharLimits[platform].hashtags;
                    const current = generatedPost.hashtags.length;
                    const isOver = current > limit;
                    return (
                      <span className={`text-xs font-medium ${isOver ? 'text-critical' : 'text-gray-500'}`}>
                        ({current}/{limit})
                      </span>
                    );
                  })()}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingHashtags(!editingHashtags)}
                >
                  {editingHashtags ? 'Done' : 'Edit'}
                </Button>
              </div>
              {generatedPost.hashtags.length > platformCharLimits[platform].hashtags && (
                <p className="text-xs text-critical mb-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Too many hashtags for {platform}. Remove {generatedPost.hashtags.length - platformCharLimits[platform].hashtags} to optimize.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {generatedPost.hashtags.map((tag, index) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                      inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm
                      ${editingHashtags
                        ? 'bg-primary/20 text-primary-light border border-primary/30'
                        : 'bg-white/5 text-gray-300 border border-glass-border'
                      }
                    `}
                  >
                    #{tag}
                    {editingHashtags && (
                      <button
                        onClick={() => handleRemoveHashtag(index)}
                        className="ml-1 hover:text-critical transition-colors"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </motion.span>
                ))}
                {editingHashtags && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newHashtag}
                      onChange={(e) => setNewHashtag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag()}
                      placeholder="Add hashtag..."
                      className="bg-white/5 border border-glass-border rounded-full px-3 py-1 text-sm text-white placeholder-gray-500 w-32 focus:border-primary transition-colors"
                    />
                    <button
                      onClick={handleAddHashtag}
                      className="p-1 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {/* Performance Prediction */}
          {generatedPost && prediction && (
            <PerformancePrediction
              prediction={prediction}
              platform={platform}
              onSuggestHashtags={handleGetHashtagSuggestions}
            />
          )}

          {/* Quick Actions */}
          {generatedPost && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Button variant="primary" className="flex-1" onClick={handleSchedulePost}>
                <Calendar size={16} />
                Save to Drafts
              </Button>
            </motion.div>
          )}

          {/* Hashtag Suggestions Modal */}
          <AnimatePresence>
            {showHashtagSuggestions && suggestedHashtags.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                onClick={() => setShowHashtagSuggestions(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="glass-panel rounded-2xl p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Hash size={18} className="text-primary" />
                      Suggested Hashtags
                    </h3>
                    <button
                      onClick={() => setShowHashtagSuggestions(false)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Click to add these trending hashtags to your post
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedHashtags.map((tag) => (
                      <motion.button
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddSuggestedHashtag(tag)}
                        className="px-3 py-1.5 rounded-full text-sm bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
                      >
                        #{tag}
                      </motion.button>
                    ))}
                  </div>
                  {suggestedHashtags.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      All suggested hashtags have been added!
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-glass-border">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setShowHashtagSuggestions(false)}
                    >
                      Done
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Variations Modal */}
          <AnimatePresence>
            {showVariations && variations.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                onClick={() => setShowVariations(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="glass-panel rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Content Variations</h3>
                    <button
                      onClick={() => setShowVariations(false)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {variations.map((variation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-panel rounded-xl p-4 border border-glass-border hover:border-primary/30 transition-all cursor-pointer"
                        onClick={() => handleSelectVariation(variation)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                            {variation.angle}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">{variation.caption}</p>
                        <div className="flex flex-wrap gap-1">
                          {variation.hashtags.slice(0, 5).map((tag) => (
                            <span key={tag} className="text-xs text-primary">#{tag}</span>
                          ))}
                          {variation.hashtags.length > 5 && (
                            <span className="text-xs text-gray-500">+{variation.hashtags.length - 5} more</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
