import { BarChart2, Bot, LayoutDashboard, Settings, Zap } from 'lucide-react';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-glow'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-accent-primary' : 'text-slate-500 group-hover:text-white'}`} />
    <span className="font-medium">{label}</span>
  </button>
);

export const Navigation = ({ currentView, onViewChange }: { currentView: string; onViewChange: (v: string) => void }) => {
  return (
    <aside className="w-64 h-screen border-r border-white/5 bg-primary/50 backdrop-blur-xl flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">Soci<span className="text-accent-primary">.ai</span></h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavItem 
          icon={LayoutDashboard} 
          label="Overview" 
          active={currentView === 'overview'} 
          onClick={() => onViewChange('overview')} 
        />
        <NavItem 
          icon={Bot} 
          label="Content Engine" 
          active={currentView === 'engine'} 
          onClick={() => onViewChange('engine')} 
        />
        <NavItem 
          icon={BarChart2} 
          label="Analytics" 
          active={currentView === 'analytics'} 
          onClick={() => onViewChange('analytics')} 
        />
        <div className="pt-4 mt-4 border-t border-white/5">
            <NavItem 
            icon={Settings} 
            label="Configuration" 
            active={currentView === 'settings'} 
            onClick={() => onViewChange('settings')} 
            />
        </div>
      </nav>

      <div className="p-4">
        <div className="glass-panel p-4 rounded-xl">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700" />
                <div>
                    <p className="text-sm font-medium text-white">Alex Creator</p>
                    <p className="text-xs text-slate-500">Pro Plan</p>
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
};
