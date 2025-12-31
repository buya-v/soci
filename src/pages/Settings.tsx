import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Key, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export const Settings = () => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-zinc-100 mb-6">Platform Settings</h2>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> API Credentials
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900/50 rounded-lg border border-border flex items-center justify-between">
               <div>
                 <div className="font-medium text-zinc-200">Twitter (X) API V2</div>
                 <div className="text-sm text-emerald-500">● Connected (Read/Write)</div>
               </div>
               <Button variant="outline" size="sm">Re-Authenticate</Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">OpenAI API Key</label>
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"} 
                  value="sk-proj-****************************"
                  readOnly
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 pr-10 text-zinc-100"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Rate Limiting
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                 <span className="text-sm text-zinc-300">Max Posts per Day</span>
                 <span className="text-sm font-mono text-primary">12 / 24</span>
              </div>
              <input type="range" className="w-full accent-primary h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer" min="1" max="24" defaultValue="12" />
              <p className="text-xs text-zinc-500 mt-2">Setting this too high increases risk of shadowbanning.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};