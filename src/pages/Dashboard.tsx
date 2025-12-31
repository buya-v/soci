import { useState, useEffect } from 'react';
import { useSociStore } from '@/store/useSociStore';
import { TrendCard } from '@/components/dashboard/TrendCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Trend } from '@/types';
import { Play, Pause, BarChart3, Users, Zap } from 'lucide-react';

// Mock Data
const MOCK_TRENDS: Trend[] = [
  { id: '1', topic: 'AI Agents', volume: '24.5K', sociScore: 9.8, category: 'Tech' },
  { id: '2', topic: 'Web3 Gaming', volume: '12K', sociScore: 8.4, category: 'Crypto' },
  { id: '3', topic: '#DevLife', volume: '8.2K', sociScore: 7.2, category: 'Lifestyle' },
];

export const Dashboard = () => {
  const { isAiActive, toggleAi, addLog, addPost } = useSociStore();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Simulate autonomous background tasks
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isAiActive) {
      interval = setInterval(() => {
        const actions = [
          () => addLog('Scanning X (Twitter) for viral hashtags...', 'info'),
          () => addLog('Analyzing sentiment on recent mention @soci_ai...', 'info'),
          () => addLog('Sentiment analysis result: Positive (0.89)', 'success'),
          () => addLog('Checking rate limits for API key ending in ...8x92', 'warning'),
        ];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        randomAction();
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [isAiActive, addLog]);

  const handleGenerate = async (trend: Trend) => {
    setGeneratingId(trend.id);
    addLog(`Initiating generation pipeline for trend: ${trend.topic}`, 'info');
    
    // Simulate API delay
    setTimeout(() => {
      const newPostContent = `Just explored ${trend.topic} and it's mind-blowing! 🚀 The potential for automation is insane. What are your thoughts? #${trend.category} #Innovation`;
      
      addPost({
        content: newPostContent,
        trendId: trend.id,
        platform: 'twitter',
        status: 'scheduled'
      });
      
      addLog(`Content generated & queued successfully for ${trend.topic}`, 'success');
      setGeneratingId(null);
    }, 2000);
  };

  return (
    <div className="p-8 h-screen overflow-hidden flex flex-col">
      <header className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-zinc-100">Command Center</h2>
          <p className="text-muted mt-1">Monitor trends and autonomous activity</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-end mr-4">
            <span className="text-xs text-muted uppercase tracking-widest font-semibold">Engine Status</span>
            <span className={isAiActive ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
              {isAiActive ? 'AUTONOMOUS' : 'MANUAL OVERRIDE'}
            </span>
          </div>
          <Button 
            size="lg" 
            onClick={toggleAi}
            className={isAiActive ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50 shadow-none" : ""}
          >
            {isAiActive ? <Pause className="mr-2 w-5 h-5" /> : <Play className="mr-2 w-5 h-5" />}
            {isAiActive ? 'Stop Engine' : 'Start Engine'}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Col: Stats */}
        <div className="col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Audience Growth
              </CardTitle>
            </CardHeader>
            <div className="text-3xl font-bold mb-1">12,403</div>
            <div className="text-sm text-emerald-400 flex items-center gap-1">
              +12.5% <span className="text-muted">this week</span>
            </div>
          </Card>
          <Card>
             <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Engagement Rate
              </CardTitle>
            </CardHeader>
            <div className="text-3xl font-bold mb-1">4.8%</div>
            <div className="text-sm text-emerald-400 flex items-center gap-1">
              +0.3% <span className="text-muted">vs last month</span>
            </div>
          </Card>
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
            <Zap className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold text-primary mb-1">Pro Tip</h3>
            <p className="text-sm text-primary/80">
              Switching your persona to "Witty" during weekends increases engagement by 15%.
            </p>
          </div>
        </div>

        {/* Middle Col: Trends */}
        <div className="col-span-5 flex flex-col min-h-0">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-lg">Identified Trends</h3>
            <span className="text-xs text-muted">Updated 2m ago</span>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 pb-4 flex-1 custom-scrollbar">
             {MOCK_TRENDS.map(trend => (
               <TrendCard 
                 key={trend.id} 
                 trend={trend} 
                 onGenerate={handleGenerate} 
                 isGenerating={generatingId === trend.id}
               />
             ))}
          </div>
        </div>

        {/* Right Col: Logs */}
        <div className="col-span-4 h-full min-h-0">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};
