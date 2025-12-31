import React from 'react';
import { TrendingUp, Users, Activity, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Trend, getSafeTrends } from '../data/sociData';
import { safeString } from '../utils/resilience';

export const Dashboard: React.FC = () => {
  const trends = getSafeTrends();

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-white mb-2">Mission Control</h1>
        <p className="text-gray-400">Real-time analysis of digital resonance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="group" highlight>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-neon/10 text-neon group-hover:bg-neon/20 transition-colors">
              <Users size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-neon bg-neon/10 px-2 py-1 rounded">
              +12% <ArrowUpRight size={12} className="ml-1" />
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">24.5k</div>
          <div className="text-sm text-gray-400">Total Reach (7d)</div>
        </GlassCard>

        <GlassCard className="group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-purpleAccent/10 text-purpleAccent group-hover:bg-purpleAccent/20 transition-colors">
              <Activity size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
              +5% <ArrowUpRight size={12} className="ml-1" />
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">8.2%</div>
          <div className="text-sm text-gray-400">Engagement Rate</div>
        </GlassCard>

        <GlassCard className="group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs text-gray-500 px-2 py-1">Live</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">12</div>
          <div className="text-sm text-gray-400">Active Trends Tracked</div>
        </GlassCard>
      </div>

      {/* Trend Analysis Table */}
      <GlassCard title="Viral Vectors & Trends">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/5">
                <th className="pb-4 pl-2">Topic</th>
                <th className="pb-4">Volume</th>
                <th className="pb-4">Sentiment</th>
                <th className="pb-4 text-right">Relevance</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {trends.map((trend: Trend) => (
                <tr key={trend.id} className="group border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 pl-2 font-medium text-white">{safeString(trend.topic)}</td>
                  <td className="py-4 text-gray-400">{safeString(trend.volume)}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${trend.sentiment === 'positive' ? 'bg-green-500/10 text-green-400' : 
                        trend.sentiment === 'negative' ? 'bg-critical/10 text-critical' : 'bg-gray-500/10 text-gray-400'}`}>
                      {safeString(trend.sentiment)}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-gray-300">{trend.relevance}%</span>
                      <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-neon shadow-[0_0_10px_#00FFC2]"
                          style={{ width: `${trend.relevance}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};