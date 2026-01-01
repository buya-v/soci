
import React, { useState } from 'react';
import { generatePostContent, generatePostImage } from '../services/gemini';
import { Trend, UserNiche, GeneratedPost } from '../types';

interface ContentLabProps {
  selectedTrend: Trend | null;
  niche: UserNiche;
}

const ContentLab: React.FC<ContentLabProps> = ({ selectedTrend, niche }) => {
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Partial<GeneratedPost> | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleGenerate = async () => {
    if (!selectedTrend) return;
    setLoading(true);
    try {
      const result = await generatePostContent(selectedTrend, niche);
      setPost(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!post?.caption) return;
    setIsGeneratingImage(true);
    try {
      const url = await generatePostImage(post.caption);
      setPost(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-bold mb-4">Content Strategy</h3>
          {selectedTrend ? (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Targeting Trend</p>
                <p className="font-semibold">{selectedTrend.topic}</p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full gradient-bg py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {loading ? 'Brainstorming...' : 'Generate AI Concept'}
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Select a trend from the radar to start generating high-engagement content.</p>
          )}
        </div>

        {post && (
          <div className="glass-panel p-6 rounded-2xl space-y-4 animate-in slide-in-from-bottom duration-500">
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Caption</label>
                <textarea 
                  className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 mt-2 text-sm text-gray-200 h-32"
                  value={post.caption}
                  onChange={(e) => setPost({...post, caption: e.target.value})}
                />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Strategic Hashtags</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {post.hashtags?.map((tag, idx) => (
                    <span key={idx} className="bg-purple-500/10 text-purple-400 text-xs px-2 py-1 rounded">#{tag}</span>
                  ))}
                </div>
             </div>
             <div className="flex space-x-3">
                <button 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="flex-1 bg-white text-black py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                >
                  {isGeneratingImage ? 'Synthesizing...' : post.imageUrl ? 'Regenerate Image' : 'Generate Visual Asset'}
                </button>
                <button className="flex-1 border border-gray-700 hover:bg-white/5 py-2 rounded-xl font-bold text-sm">
                  Schedule Post
                </button>
             </div>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-4">
        <h3 className="text-xl font-bold">Preview</h3>
        <div className="flex-1 glass-panel rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative aspect-[4/5] max-w-sm mx-auto bg-black">
          {/* Mock Social Feed Preview */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full gradient-bg"></div>
              <div>
                <p className="text-xs font-bold">YourBrand_AI</p>
                <p className="text-[10px] text-gray-500">Sponsored by Gemini</p>
              </div>
            </div>
            <span className="text-xl">...</span>
          </div>

          <div className="relative aspect-square bg-gray-900 flex items-center justify-center">
            {post?.imageUrl ? (
              <img src={post.imageUrl} alt="AI Generated" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-600 text-sm">No visual asset generated yet</p>
                <p className="text-xs text-gray-700 mt-2">Click "Generate Visual Asset" to create AI imagery</p>
              </div>
            )}
          </div>

          <div className="p-4 space-y-2">
            <div className="flex space-x-4 text-xl">
              <span>❤️</span> <span>💬</span> <span>✈️</span>
            </div>
            <div className="mt-2 h-20 overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-sm">
                <span className="font-bold mr-2">YourBrand_AI</span>
                {post?.caption || 'The future is being written in real-time. Are you ready for the next shift in global markets?'}
              </p>
              <p className="text-sm text-indigo-400 mt-1">
                {post?.hashtags?.map(h => `#${h} `)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentLab;
