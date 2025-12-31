import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, User, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: User, label: 'Persona', path: '/persona' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 border-r border-border h-screen bg-background flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-2 border-b border-border/50">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Soci<span className="text-primary">.ai</span></h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary/10 text-primary"
                : "text-muted hover:text-zinc-50 hover:bg-zinc-800/50"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="bg-surface p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-secondary" />
            <span className="text-xs font-medium text-zinc-400">System Status</span>
          </div>
          <div className="text-sm font-bold text-zinc-100">Operational</div>
          <div className="mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};