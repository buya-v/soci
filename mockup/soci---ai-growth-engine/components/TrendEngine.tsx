
import React, { useState } from 'react';
import { discoverTrends } from '../services/gemini';
import { Trend, UserNiche } from '../types';

interface TrendEngineProps {
  niche: UserNiche;
  onSelectTrend: (trend: Trend) => void;
}

const TrendEngine: React.FC<TrendEngineProps> = ({ niche, onSelectTrend }) => {
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const result = await discoverTrends(niche);
      setTrends(result);
    } catch (error) {
      console.error("Failed to fetch trends", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trend Radar</h2>
          <p className="text-gray-400">Real-time market signals grounded by Google Search</p>
        </div>
        <button
          onClick={fetchTrends}
          disabled={loading}
          className="gradient-bg px-6 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Scanning Universe...' : 'Refresh Scan'}
        </button>
      </div>

      {trends.length === 0 && !loading && (
        <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-gray-700">
          <p className="text-gray-400 mb-4">No trends discovered yet. Click refresh to start scanning.</p>
          <div className="text-4xl">🛸</div>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 glass-panel rounded-2xl animate-pulse bg-gray-800/50"></div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {trends.map((trend) => (
          <div key={trend.id} className="glass-panel p-6 rounded-2xl hover:border-indigo-500/50 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {Math.round(trend.relevance * 100)}% Match
                  </span>
                  <span className="text-gray-500 text-xs">• Real-time signal</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-300 transition-colors">{trend.topic}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{trend.description}</p>
              </div>
              <button 
                onClick={() => onSelectTrend(trend)}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200"
              >
                Draft Post
              </button>
            </div>
            
            {trend.sources && trend.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Grounding Sources</p>
                <div className="flex flex-wrap gap-2">
                  {trend.sources.map((s, idx) => (
                    <a 
                      key={idx} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center space-x-1"
                    >
                      <span>🔗</span>
                      <span>{s.title.slice(0, 30)}...</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendEngine;
