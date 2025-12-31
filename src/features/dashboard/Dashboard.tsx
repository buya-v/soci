import React from 'react';
import { BarChart3, Users, Globe, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useSociStore } from '../../store/useSociStore';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ label, value, trend, icon: Icon, delay }: any) => (
  <GlassCard delay={delay} className="flex items-center justify-between">
    <div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      <div className="flex items-center gap-1 mt-1 text-green-400 text-xs font-mono">
        <ArrowUpRight className="w-3 h-3" />
        {trend}
      </div>
    </div>
    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
      <Icon className="w-5 h-5 text-indigo-400" />
    </div>
  </GlassCard>
);

export const Dashboard: React.FC = () => {
  const { posts } = useSociStore();
  const recentPosts = posts.filter(p => p.status === 'published').slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Reach" 
          value="128.4K" 
          trend="+12% this week" 
          icon={Globe} 
          delay={0.1}
        />
        <StatCard 
          label="Engagement Rate" 
          value="4.8%" 
          trend="+0.8% this week" 
          icon={Users} 
          delay={0.2}
        />
        <StatCard 
          label="Posts Generated" 
          value="42" 
          trend="Auto-pilot active" 
          icon={BarChart3} 
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard delay={0.4} className="min-h-[300px]">
          <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentPosts.length === 0 ? (
              <p className="text-slate-500 text-sm">No activity recorded yet.</p>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="flex gap-4 p-3 rounded-lg bg-slate-900/40 border border-slate-800/50">
                  <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                     {post.platform.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                     <p className="text-slate-200 text-sm line-clamp-2">{post.content}</p>
                     <div className="flex justify-between mt-2 text-xs text-slate-500">
                       <span>{formatDistanceToNow(new Date(post.timestamp))} ago</span>
                       <span className="text-indigo-400">Published</span>
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard delay={0.5}>
           <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded bg-slate-900/40">
                 <span className="text-slate-300 text-sm">API Latency</span>
                 <span className="text-green-400 font-mono text-sm">24ms</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-slate-900/40">
                 <span className="text-slate-300 text-sm">Token Usage</span>
                 <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                       <div className="w-[45%] h-full bg-cyan-500" />
                    </div>
                    <span className="text-slate-400 font-mono text-xs">45%</span>
                 </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-slate-900/40">
                 <span className="text-slate-300 text-sm">Safety Guardrails</span>
                 <span className="text-indigo-400 text-sm font-medium">Active</span>
              </div>
           </div>
        </GlassCard>
      </div>
    </div>
  );
};
