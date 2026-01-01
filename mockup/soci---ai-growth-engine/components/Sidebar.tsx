
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: AppTab.DASHBOARD, label: 'Growth Hub', icon: '📊' },
    { id: AppTab.TRENDS, label: 'Trend Radar', icon: '📡' },
    { id: AppTab.CONTENT, label: 'Content Lab', icon: '🎨' },
    { id: AppTab.VIDEO, label: 'Video Lab', icon: '🎬' },
    { id: AppTab.AUTOMATION, label: 'Engine Config', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-3xl font-bold gradient-text tracking-tighter">Soci.</h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Autonomous AI Agent</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-300">Engine Online</span>
          </div>
          <p className="text-[10px] text-gray-500">v2.5 Autonomous Core Active</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
