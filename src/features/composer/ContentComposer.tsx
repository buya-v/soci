import React, { useState } from 'react';
import { Send, Sparkles, Image as ImageIcon, Hash } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { useSociStore } from '../../store/useSociStore';
import { Post } from '../../types';

export const ContentComposer: React.FC = () => {
  const { posts, addPost, activeView } = useSociStore();
  // Find the most recent draft or default to empty
  const latestDraft = posts.find(p => p.status === 'draft');
  
  const [content, setContent] = useState(latestDraft?.content || '');
  const [isPublishing, setIsPublishing] = useState(false);

  // Sync local state when a new draft arrives via store
  React.useEffect(() => {
    if (latestDraft) setContent(latestDraft.content);
  }, [latestDraft]);

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const newPost: Post = {
      id: Date.now().toString(),
      content,
      platform: 'twitter',
      status: 'published',
      timestamp: new Date().toISOString(),
      predictedEngagement: 'High'
    };
    
    addPost(newPost);
    setContent('');
    setIsPublishing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="w-5 h-5 text-indigo-500" />
        <h2 className="text-2xl font-bold text-white">AI Content Lab</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="min-h-[300px] flex flex-col">
            <div className="flex gap-2 mb-4 border-b border-slate-800 pb-3">
              <button className="px-3 py-1 text-sm bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">Twitter/X</button>
              <button className="px-3 py-1 text-sm text-slate-500 hover:text-slate-300">LinkedIn</button>
              <button className="px-3 py-1 text-sm text-slate-500 hover:text-slate-300">Instagram</button>
            </div>
            
            <textarea
              className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-slate-200 text-lg leading-relaxed placeholder:text-slate-600"
              placeholder="Start writing or select a trend to auto-generate..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                  <Hash className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {content.length} / 280 chars
              </div>
            </div>
          </GlassCard>

          <div className="flex justify-end gap-3">
            <Button variant="ghost">Save Draft</Button>
            <Button 
              onClick={handlePublish} 
              isLoading={isPublishing}
              disabled={!content}
            >
              <Send className="w-4 h-4" />
              Publish Now
            </Button>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <div className="space-y-4">
          <GlassCard className="h-full bg-indigo-950/20">
            <h3 className="text-sm font-bold text-indigo-300 mb-4 uppercase tracking-wider">AI Insights</h3>
            
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Predicted Impact</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 w-[85%] h-full" />
                </div>
                <p className="text-right text-xs text-cyan-400 mt-1 font-mono">85/100</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <p className="text-xs text-slate-400 mb-2">Tone Analysis</p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">Professional</span>
                  <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">Informative</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <p className="text-xs text-slate-400 mb-2">Suggested Hashtags</p>
                <div className="flex flex-wrap gap-2">
                  {['#Tech', '#Growth', '#Innovation'].map(t => (
                    <span key={t} className="text-xs text-indigo-400 cursor-pointer hover:underline">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};