import React, { useState } from 'react';
import { Wand2, Send, Clock, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { MOCK_POSTS, Post, getSafePosts } from '../data/sociData';
import { safeString } from '../utils/resilience';

export const ContentEngine: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [posts, setPosts] = useState<Post[]>(getSafePosts());

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulation of AI Generation delay
    setTimeout(() => {
      const newPost: Post = {
        id: Date.now().toString(),
        content: "The future of automated engagement is resilient, aesthetic, and intelligent. 🌌 #SociAurora #TechResilience",
        status: 'draft',
        engagement: 0,
        platform: 'twitter',
        timestamp: 'Just now'
      };
      setPosts([newPost, ...posts]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
       <div className="mb-8">
        <h1 className="text-4xl font-light text-white mb-2">Content Engine</h1>
        <p className="text-gray-400">AI-driven creation aligned with your persona.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Console */}
        <div className="lg:col-span-1">
          <GlassCard title="Generator Control" highlight>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-2">Topic Focus</label>
                <input 
                  type="text" 
                  placeholder="e.g., AI Ethics, Web3"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-2">Tone Shift</label>
                <div className="flex gap-2">
                   {['Professional', 'Witty', 'Urgent'].map(tone => (
                     <button key={tone} className="px-3 py-1.5 rounded-md border border-white/10 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                       {tone}
                     </button>
                   ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-neon to-green-400 text-deep font-bold py-3 rounded-lg hover:shadow-glow-soft transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="animate-pulse">Synthesizing...</span>
                ) : (
                  <>
                    <Wand2 size={18} /> Generate Post
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Output Stream */}
        <div className="lg:col-span-2 space-y-4">
          {posts.map((post) => (
            <GlassCard key={post.id} className="animate-slide-in">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-gray-400 border border-white/5">
                     {safeString(post.platform)}
                   </span>
                   <span className="text-xs text-gray-500">{post.timestamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  {post.status === 'published' ? (
                     <span className="flex items-center gap-1 text-green-400 text-xs">
                       <CheckCircle2 size={12} /> Published
                     </span>
                  ) : (
                     <span className="flex items-center gap-1 text-yellow-400 text-xs">
                       <Clock size={12} /> {post.status}
                     </span>
                  )}
                </div>
              </div>
              <p className="text-lg text-white font-light leading-relaxed mb-4">
                {safeString(post.content)}
              </p>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                 <button className="text-xs text-gray-400 hover:text-white transition-colors">Edit</button>
                 <button className="flex items-center gap-1.5 px-3 py-1.5 bg-neon/10 text-neon rounded-md text-xs font-medium hover:bg-neon/20 transition-colors">
                   <Send size={12} /> Post Now
                 </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};