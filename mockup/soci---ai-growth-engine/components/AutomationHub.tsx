
import React from 'react';
import { UserNiche } from '../types';

interface AutomationHubProps {
  niche: UserNiche;
  setNiche: (niche: UserNiche) => void;
}

const AutomationHub: React.FC<AutomationHubProps> = ({ niche, setNiche }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <div className="glass-panel p-8 rounded-3xl">
        <h3 className="text-2xl font-bold mb-6">Engine Core Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Primary Niche / Category</label>
              <input 
                type="text"
                value={niche.category}
                onChange={(e) => setNiche({...niche, category: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
                placeholder="e.g. Web3, Tech, Sustainable Fashion"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Target Audience</label>
              <input 
                type="text"
                value={niche.targetAudience}
                onChange={(e) => setNiche({...niche, targetAudience: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
                placeholder="e.g. Early adopters, Developers, Gen Z"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Brand Voice</label>
              <select 
                value={niche.voice}
                onChange={(e) => setNiche({...niche, voice: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
              >
                <option>Professional & Authoritative</option>
                <option>Witty & Memetic</option>
                <option>Empathetic & Community-driven</option>
                <option>Futuristic & Innovative</option>
              </select>
            </div>
          </div>

          <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-2xl p-6 space-y-6">
            <h4 className="font-bold flex items-center space-x-2">
              <span className="text-indigo-400">⚡</span>
              <span>Autonomous Mode</span>
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-Post Discovery</p>
                  <p className="text-xs text-gray-500">Scan trends every 6 hours</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1 shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                </div>
              </div>
              <div className="flex items-center justify-between opacity-50">
                <div>
                  <p className="text-sm font-medium">AI Image Synthesis</p>
                  <p className="text-xs text-gray-500">Auto-generate visuals for posts</p>
                </div>
                <div className="w-12 h-6 bg-gray-700 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Smart Scheduling</p>
                  <p className="text-xs text-gray-500">Post when engagement is highest</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl border-red-500/20">
         <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center">
           <span className="mr-2">⚠️</span> Advanced Permissions
         </h3>
         <p className="text-sm text-gray-400 mb-6">Soci requires access to your social media API keys to enable fully autonomous execution. All keys are encrypted at rest.</p>
         <div className="grid grid-cols-2 gap-4">
            {['Instagram Graph API', 'Twitter Developer v2', 'LinkedIn OAuth', 'TikTok for Business'].map(api => (
              <div key={api} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
                <span className="text-sm font-medium">{api}</span>
                <span className="text-[10px] text-gray-500">Disconnected</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default AutomationHub;
