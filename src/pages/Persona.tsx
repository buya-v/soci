import { useState } from 'react';
import { useSociStore } from '@/store/useSociStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save } from 'lucide-react';

export const Persona = () => {
  const { persona, setPersona, addLog } = useSociStore();
  const [localPersona, setLocalPersona] = useState(persona);

  const handleSave = () => {
    setPersona(localPersona);
    addLog('Persona updated successfully. Content engine re-calibrating...', 'success');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-zinc-100 mb-6">Persona Configuration</h2>
      
      <div className="grid gap-6">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Tone of Voice</label>
              <input 
                type="text" 
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={localPersona.tone}
                onChange={(e) => setLocalPersona({...localPersona, tone: e.target.value})}
              />
              <p className="text-xs text-zinc-500 mt-1">The personality the AI adopts when writing (e.g., "Witty", "Professional", "Sarcastic")</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Target Niche</label>
              <input 
                type="text" 
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={localPersona.niche}
                onChange={(e) => setLocalPersona({...localPersona, niche: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Target Audience</label>
              <textarea 
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-24 resize-none"
                value={localPersona.targetAudience}
                onChange={(e) => setLocalPersona({...localPersona, targetAudience: e.target.value})}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4 text-red-400">Safety Boundaries</h3>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Forbidden Keywords (comma separated)</label>
            <input 
              type="text" 
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
              value={localPersona.forbiddenKeywords.join(', ')}
              onChange={(e) => setLocalPersona({...localPersona, forbiddenKeywords: e.target.value.split(',').map(s => s.trim())})}
            />
             <p className="text-xs text-zinc-500 mt-1">The AI will NEVER use these words or engage with content containing them.</p>
          </div>
        </Card>

        <div className="flex justify-end">
           <Button size="lg" onClick={handleSave} className="gap-2">
             <Save className="w-4 h-4" /> Save Configuration
           </Button>
        </div>
      </div>
    </div>
  );
};