import { useState, useEffect } from 'react';
import { RootErrorBoundary } from './components/ui/ErrorBoundary';
import { Navigation } from './components/layout/Navigation';
import { StatCard } from './components/dashboard/StatCard';
import { TrendFeed } from './components/dashboard/TrendFeed';
import { GlassCard } from './components/ui/GlassCard';
import { Metric, Trend, GeneratedPost } from './types';
import { Bot, Sparkles, AlertTriangle } from 'lucide-react';

// --- Mock Data Service (Internal for Demo) ---
const MOCK_DATA = {
  metrics: [
    { label: 'Total Reach', value: '2.4M', trend: 12.5 },
    { label: 'Engagement Rate', value: '4.8%', trend: -2.1 },
    { label: 'Content Generated', value: 142, trend: 8.4 },
    { label: 'Auto-Replies', value: 890, trend: 24.0 }
  ] as Metric[],
  trends: [
    { id: 't1', topic: '#AIRevolution', volume: 450000, sentiment: 'positive', momentum: 94 },
    { id: 't2', topic: 'Sustainable Tech', volume: 120000, sentiment: 'neutral', momentum: 76 },
    { id: 't3', topic: 'Remote Work 2.0', volume: 89000, sentiment: 'positive', momentum: 65 },
  ] as Trend[]
};

function App() {
  const [currentView, setCurrentView] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metric[] | null>(null);
  const [trends, setTrends] = useState<Trend[] | null>(null);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);

  // Simulating Data Fetch with potential random failure for robustness testing
  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Network delay
        
        // Defensive: 5% chance of initialization failure to test ErrorBoundary (remove in prod)
        // if (Math.random() > 0.95) throw new Error("API Gateway Timeout");

        setMetrics(MOCK_DATA.metrics);
        setTrends(MOCK_DATA.trends);
      } catch (e) {
        console.error("Data fetch failed", e);
        // In a real app, we might set an error state, but here we let the boundary catch criticals
        // or handle gracefully by leaving data null
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Feature: Content Generation Logic
  const handleGenerate = (trend: Trend) => {
    const newPost: GeneratedPost = {
      id: Date.now().toString(),
      content: `Just analyzing the impact of ${trend.topic}. The data suggests a ${trend.sentiment} shift in global sentiment. #TechTrends #SociAI`,
      platform: 'linkedin',
      predictedEngagement: Math.floor(Math.random() * 20) + 80,
      status: 'draft'
    };
    setGeneratedPosts([newPost, ...generatedPosts]);
  };

  // Simulate a critical error for testing
  const throwTestError = () => {
    throw new Error("Manual System Override Triggered");
  };

  return (
    <RootErrorBoundary>
      <div className="min-h-screen bg-primary font-sans text-slate-300 selection:bg-accent-primary/30">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        
        <main className="pl-64 min-h-screen">
          {/* Top Bar */}
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-20 bg-primary/80">
             <h2 className="text-xl font-semibold text-white capitalize">{currentView}</h2>
             <div className="flex items-center gap-4">
                <button 
                  onClick={throwTestError}
                  className="text-xs text-red-500/50 hover:text-red-500 transition-colors flex items-center gap-1"
                  title="Test Error Boundary"
                >
                  <AlertTriangle className="w-3 h-3" /> Simulate Crash
                </button>
                <div className="h-8 w-8 rounded-full bg-accent-secondary/20 border border-accent-secondary/50 flex items-center justify-center animate-pulse">
                    <Bot className="w-4 h-4 text-accent-secondary" />
                </div>
             </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-8 max-w-7xl mx-auto space-y-8">
            
            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((index) => (
                <StatCard 
                  key={index} 
                  data={metrics ? metrics[index] : null} 
                  isLoading={isLoading} 
                />
              ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Feed - Trends */}
              <section className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent-primary" />
                        Live Trend Analysis
                    </h3>
                    <span className="text-xs text-slate-500">Auto-refresh: ON</span>
                </div>
                <TrendFeed 
                    trends={trends} 
                    isLoading={isLoading} 
                    onGenerate={handleGenerate}
                />
              </section>

              {/* Side Panel - Recent Activity / Drafts */}
              <section className="space-y-6">
                 <h3 className="text-lg font-semibold text-white">Generated Drafts</h3>
                 <div className="space-y-4">
                    {generatedPosts.length === 0 && !isLoading ? (
                        <div className="p-6 rounded-xl border border-dashed border-white/10 text-center">
                            <p className="text-sm text-slate-500">AI is waiting for input...</p>
                        </div>
                    ) : (
                        generatedPosts.map(post => (
                            <GlassCard key={post.id} className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-accent-secondary uppercase">{post.platform}</span>
                                    <span className="text-xs text-green-400">{post.predictedEngagement}% Match</span>
                                </div>
                                <p className="text-sm text-slate-300 mb-3 line-clamp-3">"{post.content}"</p>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded text-white transition-colors">
                                        Publish
                                    </button>
                                    <button className="flex-1 py-1.5 text-xs border border-white/10 hover:border-white/30 rounded text-slate-400 transition-colors">
                                        Edit
                                    </button>
                                </div>
                            </GlassCard>
                        ))
                    )}
                 </div>
              </section>
            </div>

          </div>
        </main>
      </div>
    </RootErrorBoundary>
  );
}

export default App;