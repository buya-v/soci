import React from 'react';
import { Shield, Key, User, Save } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

export const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-4xl font-light text-white mb-2">System Configuration</h1>
        <p className="text-gray-400">Secure credentials and behavioral boundaries.</p>
      </div>

      <GlassCard title="API Credentials" action={<Shield size={18} className="text-neon" />}>
        <div className="space-y-4">
          <div className="group">
            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Key size={14} /> Twitter/X API Key
            </label>
            <div className="flex gap-3">
              <input 
                type="password" 
                defaultValue="sk_live_........................." 
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:border-neon transition-colors"
                readOnly
              />
              <button className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm text-white transition-colors">
                Update
              </button>
            </div>
          </div>
          <div className="group">
            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Key size={14} /> LinkedIn Client ID
            </label>
            <div className="flex gap-3">
              <input 
                type="password" 
                defaultValue="8675309_LI_V2" 
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:border-neon transition-colors"
                readOnly
              />
              <button className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm text-white transition-colors">
                Update
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Persona & Safety" action={<User size={18} className="text-purpleAccent" />}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Response Tone</label>
              <select className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purpleAccent transition-colors">
                <option>Professional Leader</option>
                <option>Tech Visionary</option>
                <option>Friendly Helper</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Daily Posts</label>
              <input 
                type="number" 
                defaultValue={5}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purpleAccent transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg transition-all">
              <Save size={16} /> Save Configuration
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};