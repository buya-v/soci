import React from 'react';
import { LayoutDashboard, Zap, Settings, Activity } from 'lucide-react';
import { clsx } from 'clsx';

interface NavDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const NavDock: React.FC<NavDockProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'content', icon: Zap, label: 'Generator' },
    { id: 'settings', icon: Settings, label: 'Config' },
  ];

  return (
    <>
      {/* Status Indicator (Top Right) */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
        <div className="w-2 h-2 rounded-full bg-neon shadow-[0_0_10px_#00FFC2] animate-pulse" />
        <span className="text-xs font-mono text-neon/80 uppercase">System Optimal</span>
      </div>

      {/* Floating Navigation Dock (Bottom Center) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/50">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={clsx(
                  "relative px-6 py-3 rounded-xl transition-all duration-300 group flex flex-col items-center gap-1",
                  isActive 
                    ? "bg-white/10 text-neon shadow-glow-soft"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={20} className={clsx(
                  "transition-transform duration-300",
                  isActive && "scale-110"
                )} />
                <span className={clsx(
                  "text-[10px] font-medium transition-all duration-300",
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 absolute"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};