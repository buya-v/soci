import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  TrendingUp,
  PenTool,
  FileText,
  Video,
  Settings,
  Menu,
  X,
  Zap,
  BookTemplate,
  Hash,
  Image,
  Calendar,
} from 'lucide-react';
import type { ViewType } from '@/types';

interface MobileNavProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Growth Hub', icon: LayoutDashboard },
  { id: 'trends', label: 'Trend Radar', icon: TrendingUp },
  { id: 'content', label: 'Content Lab', icon: PenTool },
  { id: 'templates', label: 'Templates', icon: BookTemplate },
  { id: 'hashtags', label: 'Hashtags', icon: Hash },
  { id: 'media', label: 'Media Library', icon: Image },
  { id: 'drafts', label: 'Queue', icon: FileText },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'video', label: 'Video Lab', icon: Video },
  { id: 'automation', label: 'Automation', icon: Settings },
];

export function MobileNav({ activeView, onViewChange, isOpen, onToggle }: MobileNavProps) {
  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-14 glass-panel border-b border-glass-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <h1 className="text-lg font-bold gradient-text">SOCI</h1>
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={onToggle}
            />

            {/* Menu Panel */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-14 right-0 bottom-0 w-64 glass-panel border-l border-glass-border z-50 overflow-y-auto"
            >
              <div className="p-3">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = activeView === item.id;
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => onViewChange(item.id)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                            transition-all duration-200 text-left
                            ${isActive
                              ? 'bg-primary/15 text-white border border-primary/20'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }
                          `}
                        >
                          <Icon size={18} className={isActive ? 'text-primary-light' : ''} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Status */}
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-glass-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-success">Engine Online</span>
                  </div>
                  <p className="text-[10px] text-gray-500">v2.0 Autonomous Core</p>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-glass-border z-40">
        <div className="flex justify-around items-center h-16 px-1 pb-safe">
          {navItems.slice(0, 5).map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-w-[56px]
                  transition-all duration-200
                  ${isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-500 hover:text-gray-300'
                  }
                `}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] mt-0.5 font-medium">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
