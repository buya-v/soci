
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AnalyticsData } from '../types';

const data: AnalyticsData[] = [
  { name: 'Mon', followers: 2400, engagement: 400, reach: 5000 },
  { name: 'Tue', followers: 2800, engagement: 450, reach: 5500 },
  { name: 'Wed', followers: 3200, engagement: 600, reach: 7200 },
  { name: 'Thu', followers: 4100, engagement: 800, reach: 9800 },
  { name: 'Fri', followers: 4800, engagement: 950, reach: 11000 },
  { name: 'Sat', followers: 5600, engagement: 1100, reach: 13500 },
  { name: 'Sun', followers: 6400, engagement: 1350, reach: 16200 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-sm text-gray-400 mb-1">Total Followers</p>
          <h3 className="text-3xl font-bold">128.4K</h3>
          <p className="text-xs text-green-400 mt-2 font-medium">↑ 12.5% this week</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-sm text-gray-400 mb-1">Avg. Engagement</p>
          <h3 className="text-3xl font-bold">6.8%</h3>
          <p className="text-xs text-green-400 mt-2 font-medium">↑ 2.1% from baseline</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-sm text-gray-400 mb-1">AI-Generated Reach</p>
          <h3 className="text-3xl font-bold">1.2M</h3>
          <p className="text-xs text-purple-400 mt-2 font-medium">Driven by Autonomous Core</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl h-[400px]">
          <h4 className="text-lg font-semibold mb-6">Audience Growth</h4>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorFollow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="followers" stroke="#6366f1" fillOpacity={1} fill="url(#colorFollow)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-6 rounded-2xl h-[400px]">
          <h4 className="text-lg font-semibold mb-6">Engagement Score</h4>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Bar dataKey="engagement" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h4 className="text-lg font-semibold mb-4">Autonomous Activity Log</h4>
        <div className="space-y-4">
          {[
            { time: '2 mins ago', action: 'Published "Future of AI" carousel to Instagram', status: 'Success' },
            { time: '1 hour ago', action: 'Identified breakthrough trend: "Apple Vision Pro 2 Leaks"', status: 'Alert' },
            { time: '3 hours ago', action: 'Optimized hashtag cluster for LinkedIn growth', status: 'Success' },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm">🤖</div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{log.action}</p>
                  <p className="text-xs text-gray-500">{log.time}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                log.status === 'Success' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
