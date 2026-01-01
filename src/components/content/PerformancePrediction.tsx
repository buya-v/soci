import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Hash,
  Target,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Users,
  Heart,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { EngagementPrediction, PredictionFactor } from '@/services/predictions';
import type { Platform } from '@/types';

interface PerformancePredictionProps {
  prediction: EngagementPrediction;
  platform: Platform;
  onSuggestTime?: () => void;
  onSuggestHashtags?: () => void;
}

export function PerformancePrediction({
  prediction,
  platform: _platform,
  onSuggestTime,
  onSuggestHashtags,
}: PerformancePredictionProps) {
  // Platform is available for future platform-specific UI customizations
  void _platform;
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-critical';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Work';
  };

  const getViralBadge = () => {
    const colors = {
      high: 'bg-success/20 text-success border-success/30',
      medium: 'bg-warning/20 text-warning border-warning/30',
      low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[prediction.viralPotential];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          AI Performance Prediction
        </h4>
        <span className={`text-xs px-2 py-1 rounded-full border ${getViralBadge()}`}>
          {prediction.viralPotential.charAt(0).toUpperCase() + prediction.viralPotential.slice(1)} Viral Potential
        </span>
      </div>

      {/* Main Score */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-white/10"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${prediction.score * 2.2} 220`}
              strokeLinecap="round"
              className={getScoreColor(prediction.score)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${getScoreColor(prediction.score)}`}>
              {prediction.score}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <p className={`text-lg font-semibold ${getScoreColor(prediction.score)}`}>
            {getScoreLabel(prediction.score)}
          </p>
          <p className="text-xs text-gray-500">
            {prediction.confidence}% confidence
          </p>

          {/* Estimated Metrics */}
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Users size={12} className="text-gray-500" />
              <span className="text-xs text-gray-400">
                ~{formatNumber(prediction.estimatedReach)} reach
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={12} className="text-gray-500" />
              <span className="text-xs text-gray-400">
                ~{formatNumber(prediction.estimatedEngagement)} engagements
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Factors */}
      <div className="space-y-2 mb-4">
        <p className="text-xs font-medium text-gray-500 uppercase">Analysis Factors</p>
        <div className="grid grid-cols-2 gap-2">
          {prediction.factors.slice(0, 6).map((factor, index) => (
            <FactorChip key={index} factor={factor} />
          ))}
        </div>
      </div>

      {/* Best Time */}
      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg mb-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-primary" />
          <div>
            <p className="text-xs text-gray-400">Best Time to Post</p>
            <p className="text-sm text-white font-medium">
              {prediction.bestTimeToPost.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}{' '}
              at{' '}
              {prediction.bestTimeToPost.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        {onSuggestTime && (
          <button
            onClick={onSuggestTime}
            className="text-xs text-primary hover:text-primary-light transition-colors"
          >
            Use this time
          </button>
        )}
      </div>

      {/* Suggestions */}
      {prediction.suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
            <Lightbulb size={12} />
            Suggestions
          </p>
          <div className="space-y-1.5">
            {prediction.suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-xs text-gray-400"
              >
                <span className="text-primary mt-0.5">•</span>
                <span>{suggestion}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {onSuggestHashtags && (
        <div className="mt-4 pt-3 border-t border-glass-border">
          <button
            onClick={onSuggestHashtags}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm transition-colors"
          >
            <Hash size={14} />
            Get Hashtag Suggestions
          </button>
        </div>
      )}
    </GlassCard>
  );
}

function FactorChip({ factor }: { factor: PredictionFactor }) {
  const getIcon = () => {
    switch (factor.impact) {
      case 'positive':
        return <CheckCircle size={12} className="text-success" />;
      case 'negative':
        return <AlertCircle size={12} className="text-critical" />;
      default:
        return <Target size={12} className="text-gray-500" />;
    }
  };

  const getBg = () => {
    switch (factor.impact) {
      case 'positive':
        return 'bg-success/10 border-success/20';
      case 'negative':
        return 'bg-critical/10 border-critical/20';
      default:
        return 'bg-white/5 border-glass-border';
    }
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border ${getBg()}`}
      title={factor.description}
    >
      {getIcon()}
      <span className="text-xs text-gray-300 truncate">{factor.name}</span>
    </div>
  );
}

// Compact version for queue/drafts
export function MiniPerformanceScore({
  score,
  viralPotential,
}: {
  score: number;
  viralPotential: 'low' | 'medium' | 'high';
}) {
  const getColor = () => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-critical';
  };

  return (
    <div className="flex items-center gap-1.5" title={`Performance Score: ${score}/100`}>
      {score >= 70 ? (
        <TrendingUp size={12} className={getColor()} />
      ) : (
        <TrendingDown size={12} className={getColor()} />
      )}
      <span className={`text-xs font-medium ${getColor()}`}>{score}</span>
      {viralPotential === 'high' && <Zap size={10} className="text-success" />}
    </div>
  );
}
