import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, ExternalLink, Sparkles, Loader2, Brain, Globe, Settings2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import {
  analyzeTrendRelevance,
  isAnthropicConfigured,
  initAnthropicClient,
  type TrendAnalysis,
} from '@/services/ai';
import { fetchTrends, trendSources, calculateNicheRelevance } from '@/services/trends';
import type { Trend } from '@/types';

interface TrendCardProps {
  trend: Trend;
  onDraftPost: (trend: Trend) => void;
  onAnalyze: (trend: Trend) => void;
  analysis?: TrendAnalysis | null;
  isAnalyzing?: boolean;
}

function TrendCard({ trend, onDraftPost, onAnalyze, analysis, isAnalyzing }: TrendCardProps) {
  const getSentimentColor = (sentiment: Trend['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'text-success bg-success/10';
      case 'negative': return 'text-critical bg-critical/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 80) return 'bg-primary/20 text-primary-light';
    if (relevance >= 60) return 'bg-accent-purple/20 text-accent-purple';
    return 'bg-gray-500/20 text-gray-400';
  };

  const relevanceScore = analysis?.relevanceScore ?? trend.relevance;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-5 border border-glass-border hover:border-primary/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSentimentColor(trend.sentiment)}`}>
              {trend.sentiment}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRelevanceColor(relevanceScore)}`}>
              {relevanceScore}% Match
            </span>
            {analysis && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-purple/20 text-accent-purple">
                AI Analyzed
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">{trend.topic}</h3>
          <p className="text-sm text-gray-500">
            {(trend.volume / 1000).toFixed(0)}K mentions
          </p>
        </div>
      </div>

      {/* AI Analysis Section */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 bg-accent-purple/5 rounded-lg border border-accent-purple/20"
        >
          <p className="text-xs text-gray-400 mb-2">{analysis.reasoning}</p>
          {analysis.suggestedAngles.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] text-gray-500 uppercase mb-1">Suggested Angles</p>
              <div className="flex flex-wrap gap-1">
                {analysis.suggestedAngles.slice(0, 3).map((angle, i) => (
                  <span key={i} className="text-xs bg-white/5 px-2 py-0.5 rounded text-gray-300">
                    {angle}
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.bestPlatforms.length > 0 && (
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-gray-500">Best for:</p>
              {analysis.bestPlatforms.map((p) => (
                <span key={p} className="text-xs text-primary capitalize">{p}</span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Source Section */}
      {trend.source && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Source</p>
          <a
            href={trend.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-light transition-colors"
          >
            {trend.source}
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAnalyze(trend)}
          disabled={isAnalyzing || !!analysis}
          className="flex-1"
        >
          {isAnalyzing ? (
            <Loader2 size={14} className="mr-1 animate-spin" />
          ) : (
            <Brain size={14} className="mr-1" />
          )}
          {analysis ? 'Analyzed' : 'Analyze'}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onDraftPost(trend)}
          className="flex-1"
        >
          <Sparkles size={14} className="mr-1" />
          Draft Post
        </Button>
      </div>
    </motion.div>
  );
}

function TrendSkeleton() {
  return (
    <div className="glass-panel rounded-xl p-5 border border-glass-border">
      <div className="flex gap-2 mb-3">
        <div className="skeleton h-5 w-16 rounded" />
        <div className="skeleton h-5 w-20 rounded" />
      </div>
      <div className="skeleton h-6 w-3/4 rounded mb-2" />
      <div className="skeleton h-4 w-1/4 rounded mb-4" />
      <div className="skeleton h-9 w-full rounded" />
    </div>
  );
}

export function TrendEngine() {
  const { apiKeys, persona, setActiveView, addNotification, addActivity } = useAppStore();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [analyses, setAnalyses] = useState<Record<string, TrendAnalysis>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [enabledSources, setEnabledSources] = useState<string[]>(['reddit', 'hackernews']);
  const [showSourceSettings, setShowSourceSettings] = useState(false);

  // Initialize Anthropic client
  useEffect(() => {
    if (apiKeys.anthropic) {
      initAnthropicClient(apiKeys.anthropic);
    }
  }, [apiKeys.anthropic]);

  // Fetch trends on mount
  useEffect(() => {
    handleRefresh();
  }, []);

  const anthropicReady = isAnthropicConfigured();

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const niche = persona?.niche || 'technology';
      const niches = [niche.toLowerCase()];

      // Add related niches based on persona topics
      if (persona?.topics) {
        persona.topics.forEach(topic => {
          if (topic.toLowerCase().includes('ai') || topic.toLowerCase().includes('machine learning')) {
            niches.push('ai');
          }
          if (topic.toLowerCase().includes('startup') || topic.toLowerCase().includes('business')) {
            niches.push('startups');
          }
          if (topic.toLowerCase().includes('marketing') || topic.toLowerCase().includes('social')) {
            niches.push('marketing');
          }
        });
      }

      const fetchedTrends = await fetchTrends({
        sources: enabledSources,
        niches: [...new Set(niches)],
        limit: 12,
      });

      // Calculate relevance based on persona
      const trendsWithRelevance = fetchedTrends.map(trend => ({
        ...trend,
        relevance: calculateNicheRelevance(
          trend,
          persona?.niche || 'Technology',
          persona?.topics || []
        ),
      }));

      setTrends(trendsWithRelevance);
      setAnalyses({}); // Clear analyses on refresh

      addNotification({
        type: 'success',
        title: 'Trends Updated',
        message: `Found ${trendsWithRelevance.length} trending topics from ${enabledSources.length} sources`,
      });

      addActivity({
        id: crypto.randomUUID(),
        action: 'Trends Scanned',
        description: `Fetched ${trendsWithRelevance.length} trends from Reddit & Hacker News`,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    } catch (error) {
      console.error('Failed to fetch trends:', error);
      addNotification({
        type: 'error',
        title: 'Fetch Failed',
        message: 'Could not fetch trends. Using cached data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSource = (sourceId: string) => {
    setEnabledSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleAnalyzeTrend = async (trend: Trend) => {
    if (!anthropicReady) {
      addNotification({
        type: 'warning',
        title: 'API Key Required',
        message: 'Configure Anthropic API key in Automation Hub',
      });
      return;
    }

    setAnalyzingId(trend.id);

    try {
      const analysis = await analyzeTrendRelevance(
        trend.topic,
        persona?.niche || 'Technology',
        persona?.topics || ['innovation', 'productivity']
      );

      setAnalyses(prev => ({ ...prev, [trend.id]: analysis }));

      addActivity({
        id: crypto.randomUUID(),
        action: 'Trend Analyzed',
        description: `AI analyzed "${trend.topic}" - ${analysis.relevanceScore}% relevance`,
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      addNotification({
        type: 'success',
        title: 'Analysis Complete',
        message: `${trend.topic} is ${analysis.relevanceScore}% relevant to your niche`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isCreditsError = errorMessage.includes('credit balance') || errorMessage.includes('too low');

      addNotification({
        type: 'error',
        title: isCreditsError ? 'API Credits Depleted' : 'Analysis Failed',
        message: isCreditsError
          ? 'Your Anthropic API credits are exhausted. Please add credits at console.anthropic.com or update your API key in Automation settings.'
          : errorMessage || 'Could not analyze trend',
      });
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDraftPost = (trend: Trend) => {
    // Navigate to content lab with the trend topic
    setActiveView('content');
    addNotification({
      type: 'info',
      title: 'Topic Ready',
      message: `Use "${trend.topic}" as your content topic`,
    });
  };

  const handleAnalyzeAll = async () => {
    if (!anthropicReady) {
      addNotification({
        type: 'warning',
        title: 'API Key Required',
        message: 'Configure Anthropic API key in Automation Hub',
      });
      return;
    }

    for (const trend of filteredTrends.slice(0, 4)) {
      if (!analyses[trend.id]) {
        await handleAnalyzeTrend(trend);
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      }
    }
  };

  const filteredTrends = trends.filter(trend =>
    trend.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold gradient-text mb-2">Trend Radar</h1>
          <p className="text-gray-400">Discover viral topics in your niche</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            anthropicReady ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          }`}>
            <span className={`w-2 h-2 rounded-full ${anthropicReady ? 'bg-success' : 'bg-warning'}`} />
            AI Analysis {anthropicReady ? 'Ready' : 'Not Configured'}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Scan Trends
        </Button>
        <Button
          variant="primary"
          onClick={handleAnalyzeAll}
          disabled={!anthropicReady || analyzingId !== null}
        >
          <Brain size={16} className="mr-2" />
          Analyze All with AI
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowSourceSettings(!showSourceSettings)}
        >
          <Settings2 size={16} className="mr-2" />
          Sources
        </Button>
      </div>

      {/* Source Settings */}
      {showSourceSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={16} className="text-primary" />
              <h3 className="text-sm font-medium text-white">Trend Sources</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    enabledSources.includes(source.id)
                      ? 'bg-primary/20 text-primary-light border border-primary/30'
                      : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                  }`}
                >
                  {source.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select sources to scan for trending topics. Click "Scan Trends" to fetch new data.
            </p>
          </GlassCard>
        </motion.div>
      )}

      {/* Search */}
      <GlassCard className="p-4" noPadding>
        <div className="relative p-4">
          <Search size={18} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search trends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
          />
        </div>
      </GlassCard>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <TrendSkeleton />
            <TrendSkeleton />
            <TrendSkeleton />
            <TrendSkeleton />
          </>
        ) : filteredTrends.length > 0 ? (
          filteredTrends.map((trend, index) => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TrendCard
                trend={trend}
                onDraftPost={handleDraftPost}
                onAnalyze={handleAnalyzeTrend}
                analysis={analyses[trend.id]}
                isAnalyzing={analyzingId === trend.id}
              />
            </motion.div>
          ))
        ) : (
          <GlassCard className="col-span-full p-12 text-center">
            <p className="text-gray-400 mb-2">No trends found</p>
            <p className="text-sm text-gray-500">Try adjusting your search or refresh the trends</p>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}
