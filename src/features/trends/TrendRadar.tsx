import React from 'react';
import { RefreshCw, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { useSociStore } from '../../store/useSociStore';

export const TrendRadar: React.FC = () => {
  const { trends, isLoading, refreshTrends, generatePost } = useSociStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Global Trend Radar</h2>
          <p className="text-slate-400 text-sm">Real-time vector analysis of viral subjects.</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={refreshTrends}
          isLoading={isLoading}
        >
          <RefreshCw className="w-4 h-4" />
          Scan Network
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trends.map((trend, index) => (
          <GlassCard key={trend.id} delay={index * 0.1} hoverEffect className="group relative overflow-hidden">
            {/* Decorative BG Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-indigo-500/20" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 rounded text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {trend.category}
                </span>
                <span className="flex items-center gap-1 text-cyan-400 font-mono text-sm">
                  <TrendingUp className="w-3 h-3" />
                  {trend.confidence}%
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">
                {trend.topic}
              </h3>
              
              <p className="text-slate-400 text-sm mb-4">
                Volume: <span className="text-slate-200">{trend.volume}</span> • Engagement Velocity: <span className="text-green-400">High</span>
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {trend.hashtags.map(tag => (
                  <span key={tag} className="text-xs text-slate-500">{tag}</span>
                ))}
              </div>

              <Button 
                className="w-full" 
                onClick={() => generatePost(trend)}
                disabled={isLoading}
              >
                <Zap className="w-4 h-4" />
                Auto-Generate Draft
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};