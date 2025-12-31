import { useState } from 'react';
import { Globe, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Trend } from '../../types';
import { Skeleton } from '../ui/Skeleton';

interface Props {
  trends: Trend[] | null;
  isLoading: boolean;
  onGenerate: (trend: Trend) => void;
}

export const TrendFeed = ({ trends, isLoading, onGenerate }: Props) => {
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleAction = (trend: Trend) => {
    setGeneratingId(trend.id);
    // Simulation delay for interaction
    setTimeout(() => {
        onGenerate(trend);
        setGeneratingId(null);
    }, 1500);
  };

  if (isLoading) {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
            ))}
        </div>
    );
  }

  // Defensive Data Check
  if (!trends || trends.length === 0) {
    return (
        <div className="p-8 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No active signals detected in your niche.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      {trends.map((trend) => (
        <GlassCard key={trend.id} className="group relative overflow-hidden">
          {/* Subtle background gradient based on sentiment */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-[60px] opacity-10 pointer-events-none ${trend.sentiment === 'positive' ? 'from-green-500' : 'from-accent-secondary'}`} />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/5 text-accent-primary">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">{trend.topic}</h4>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Momentum: {trend.momentum ?? 0}/100
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 capitalize">
                        {trend.sentiment}
                    </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleAction(trend)}
              disabled={generatingId === trend.id}
              className="px-4 py-2 bg-accent-primary hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-wait text-white rounded-lg text-sm font-medium transition-all shadow-glow flex items-center gap-2"
            >
              {generatingId === trend.id ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</>
              ) : (
                  'Generate Post'
              )}
            </button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};