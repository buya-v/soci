import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  AlertTriangle,
  XCircle,
  Rocket,
  Type,
  Hash,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import type { Platform } from '@/types';

interface PreflightCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  platform: Platform;
  caption: string;
  hashtags: string[];
  hasImage?: boolean;
  hasVideo?: boolean;
}

interface CheckResult {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  icon: React.ElementType;
}

const platformConfig: Record<Platform, {
  name: string;
  captionLimit: number;
  hashtagLimit: number;
  supportsLinks: boolean;
  supportsVideo: boolean;
  recommendedHashtags: { min: number; max: number };
  optimalCaptionLength: { min: number; max: number };
}> = {
  instagram: {
    name: 'Instagram',
    captionLimit: 2200,
    hashtagLimit: 30,
    supportsLinks: false,
    supportsVideo: true,
    recommendedHashtags: { min: 5, max: 15 },
    optimalCaptionLength: { min: 100, max: 300 },
  },
  twitter: {
    name: 'Twitter/X',
    captionLimit: 280,
    hashtagLimit: 5,
    supportsLinks: true,
    supportsVideo: true,
    recommendedHashtags: { min: 1, max: 3 },
    optimalCaptionLength: { min: 70, max: 200 },
  },
  linkedin: {
    name: 'LinkedIn',
    captionLimit: 3000,
    hashtagLimit: 5,
    supportsLinks: true,
    supportsVideo: true,
    recommendedHashtags: { min: 3, max: 5 },
    optimalCaptionLength: { min: 150, max: 600 },
  },
  tiktok: {
    name: 'TikTok',
    captionLimit: 150,
    hashtagLimit: 10,
    supportsLinks: false,
    supportsVideo: true,
    recommendedHashtags: { min: 3, max: 8 },
    optimalCaptionLength: { min: 50, max: 100 },
  },
  facebook: {
    name: 'Facebook',
    captionLimit: 63206,
    hashtagLimit: 10,
    supportsLinks: true,
    supportsVideo: true,
    recommendedHashtags: { min: 1, max: 3 },
    optimalCaptionLength: { min: 80, max: 250 },
  },
};

export function PreflightCheckModal({
  isOpen,
  onClose,
  onConfirm,
  platform,
  caption,
  hashtags,
  hasImage = false,
  hasVideo = false,
}: PreflightCheckModalProps) {
  const config = platformConfig[platform];

  const checks = useMemo((): CheckResult[] => {
    const results: CheckResult[] = [];

    // Caption length check
    const captionLength = caption.length;
    if (captionLength > config.captionLimit) {
      results.push({
        id: 'caption-length',
        label: 'Caption Length',
        status: 'error',
        message: `${captionLength.toLocaleString()} characters exceeds ${config.name}'s ${config.captionLimit.toLocaleString()} limit`,
        icon: Type,
      });
    } else if (captionLength < config.optimalCaptionLength.min) {
      results.push({
        id: 'caption-length',
        label: 'Caption Length',
        status: 'warning',
        message: `Caption is short (${captionLength} chars). ${config.name} posts perform better with ${config.optimalCaptionLength.min}+ characters`,
        icon: Type,
      });
    } else if (captionLength > config.optimalCaptionLength.max) {
      results.push({
        id: 'caption-length',
        label: 'Caption Length',
        status: 'pass',
        message: `${captionLength.toLocaleString()} characters (within limit, but longer captions may reduce engagement)`,
        icon: Type,
      });
    } else {
      results.push({
        id: 'caption-length',
        label: 'Caption Length',
        status: 'pass',
        message: `${captionLength.toLocaleString()} characters - optimal for ${config.name}`,
        icon: Type,
      });
    }

    // Hashtag count check
    const hashtagCount = hashtags.length;
    if (hashtagCount > config.hashtagLimit) {
      results.push({
        id: 'hashtag-count',
        label: 'Hashtag Count',
        status: 'error',
        message: `${hashtagCount} hashtags exceeds ${config.name}'s recommended limit of ${config.hashtagLimit}`,
        icon: Hash,
      });
    } else if (hashtagCount < config.recommendedHashtags.min) {
      results.push({
        id: 'hashtag-count',
        label: 'Hashtag Count',
        status: 'warning',
        message: `Only ${hashtagCount} hashtags. Consider adding ${config.recommendedHashtags.min}-${config.recommendedHashtags.max} for better reach`,
        icon: Hash,
      });
    } else if (hashtagCount > config.recommendedHashtags.max) {
      results.push({
        id: 'hashtag-count',
        label: 'Hashtag Count',
        status: 'warning',
        message: `${hashtagCount} hashtags may look spammy. ${config.recommendedHashtags.min}-${config.recommendedHashtags.max} is optimal for ${config.name}`,
        icon: Hash,
      });
    } else {
      results.push({
        id: 'hashtag-count',
        label: 'Hashtag Count',
        status: 'pass',
        message: `${hashtagCount} hashtags - optimal range for ${config.name}`,
        icon: Hash,
      });
    }

    // Link check for Instagram
    const hasLinks = /https?:\/\/[^\s]+/.test(caption);
    if (hasLinks && !config.supportsLinks) {
      results.push({
        id: 'links',
        label: 'Links',
        status: 'warning',
        message: `${config.name} doesn't make caption links clickable. Consider "link in bio" instead`,
        icon: LinkIcon,
      });
    } else if (hasLinks && config.supportsLinks) {
      results.push({
        id: 'links',
        label: 'Links',
        status: 'pass',
        message: 'Link detected and will be clickable',
        icon: LinkIcon,
      });
    }

    // Media check
    if (platform === 'tiktok' && !hasVideo) {
      results.push({
        id: 'media',
        label: 'Video Content',
        status: 'warning',
        message: 'TikTok is a video-first platform. Consider adding video content',
        icon: Video,
      });
    } else if (!hasImage && !hasVideo) {
      results.push({
        id: 'media',
        label: 'Media',
        status: 'warning',
        message: 'Posts with images/video get significantly higher engagement',
        icon: ImageIcon,
      });
    } else {
      results.push({
        id: 'media',
        label: 'Media',
        status: 'pass',
        message: hasVideo ? 'Video content attached' : 'Image attached',
        icon: hasVideo ? Video : ImageIcon,
      });
    }

    // Check for duplicate hashtags
    const uniqueHashtags = new Set(hashtags.map(h => h.toLowerCase()));
    if (uniqueHashtags.size !== hashtags.length) {
      results.push({
        id: 'duplicate-hashtags',
        label: 'Duplicate Hashtags',
        status: 'warning',
        message: 'Some hashtags are duplicated. Remove duplicates for cleaner content',
        icon: Hash,
      });
    }

    // Check for empty caption
    if (!caption.trim()) {
      results.push({
        id: 'empty-caption',
        label: 'Caption',
        status: 'error',
        message: 'Caption is empty. Add content before publishing',
        icon: Type,
      });
    }

    return results;
  }, [caption, hashtags, config, platform, hasImage, hasVideo]);

  const errorCount = checks.filter(c => c.status === 'error').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const passCount = checks.filter(c => c.status === 'pass').length;

  const canProceed = errorCount === 0;

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'pass':
        return <Check size={16} className="text-success" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-warning" />;
      case 'error':
        return <XCircle size={16} className="text-critical" />;
    }
  };

  const getStatusColor = (status: CheckResult['status']) => {
    switch (status) {
      case 'pass':
        return 'border-success/20 bg-success/5';
      case 'warning':
        return 'border-warning/20 bg-warning/5';
      case 'error':
        return 'border-critical/20 bg-critical/5';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard className="p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  errorCount > 0
                    ? 'bg-critical/20'
                    : warningCount > 0
                    ? 'bg-warning/20'
                    : 'bg-success/20'
                }`}>
                  <Rocket size={20} className={
                    errorCount > 0
                      ? 'text-critical'
                      : warningCount > 0
                      ? 'text-warning'
                      : 'text-success'
                  } />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Pre-flight Check</h3>
                  <p className="text-xs text-gray-500">
                    Optimizing for {config.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Summary */}
            <div className="p-4 border-b border-glass-border bg-white/2">
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{passCount}</div>
                  <div className="text-xs text-gray-500">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{warningCount}</div>
                  <div className="text-xs text-gray-500">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-critical">{errorCount}</div>
                  <div className="text-xs text-gray-500">Errors</div>
                </div>
              </div>
            </div>

            {/* Checks List */}
            <div className="p-4 space-y-3 max-h-[40vh] overflow-y-auto">
              {checks.map((check) => {
                const Icon = check.icon;
                return (
                  <div
                    key={check.id}
                    className={`p-3 rounded-xl border ${getStatusColor(check.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getStatusIcon(check.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={14} className="text-gray-400" />
                          <span className="text-sm font-medium text-white">
                            {check.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{check.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-glass-border bg-white/2">
              <p className="text-xs text-gray-500">
                {canProceed
                  ? warningCount > 0
                    ? 'Ready with warnings'
                    : 'All checks passed!'
                  : 'Fix errors before saving'
                }
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>
                  Go Back
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={!canProceed}
                  className="gap-2"
                >
                  <Rocket size={16} />
                  {canProceed ? 'Save to Drafts' : 'Cannot Save'}
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
