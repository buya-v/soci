import React from 'react';
import { LayoutDashboard, TrendingUp, PenTool, Settings, Activity } from 'lucide-react';
import { useSociStore } from '../../store/useSociStore';
import { motion } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useSociStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trends', label: 'Trend Radar', icon: TrendingUp },
    { id: 'composer', label: 'Content Lab', icon: PenTool },
    { id: 'settings', label: 'Configuration', icon: Settings },
  ];

  return (
    <motion.aside 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl h-screen flex flex-col"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Soci<span className="text-indigo-500">.ai</span></span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 relative group ${
                isActive 
                  ? 'text-white bg-indigo-500/10 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'group-hover:text-white'}`} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute inset-0 rounded-lg bg-indigo-500/5"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="glass-panel p-4 rounded-xl">
          <p className="text-xs text-slate-400 mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-green-400">ONLINE: v1.1.0</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};