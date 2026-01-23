import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  TrendingUp,
  PenTool,
  FileText,
  Calendar,
  Video,
  Settings,
  Zap,
  Keyboard,
  BookTemplate,
  Hash,
  Image,
  Wallet,
  LogOut,
  CheckCircle,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NotificationBell } from '@/components/ui/NotificationCenter';
import { HealthIndicator } from '@/components/ui/HealthIndicator';
import { useAppStore } from '@/store/useAppStore';
import type { ViewType } from '@/types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onShowShortcuts?: () => void;
  onShowNotifications?: () => void;
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
  { id: 'published', label: 'Published', icon: CheckCircle },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'video', label: 'Video Lab', icon: Video },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'automation', label: 'Automation', icon: Settings },
];

export function Sidebar({ activeView, onViewChange, onShowShortcuts, onShowNotifications }: SidebarProps) {
  const logout = useAppStore((state) => state.logout);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen w-64 glass-panel border-r border-glass-border flex flex-col z-50"
    >
      {/* Logo Section */}
      <div className="p-5 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center shadow-glow-primary">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">SOCI</h1>
            <p className="text-xs text-gray-500">AI Growth Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 overflow-y-auto">
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
                    transition-all duration-400 ease-aurora text-left relative
                    ${isActive
                      ? 'bg-aurora-neon/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 hover:shadow-glow-soft'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBg"
                      className="absolute inset-0 rounded-lg bg-aurora-neon/10 border border-aurora-neon/20 shadow-glow-soft"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-aurora-neon' : ''}`}>
                    <Icon size={18} />
                  </span>
                  <span className="relative z-10 text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status Section */}
      <div className="flex-shrink-0 p-3 border-t border-glass-border space-y-2">
        {/* Theme & Notifications */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Theme</span>
            <ThemeToggle variant="compact" />
          </div>
          <div className="flex items-center gap-2">
            {onShowShortcuts && (
              <button
                onClick={onShowShortcuts}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                title="Keyboard Shortcuts (/)"
              >
                <Keyboard size={14} />
              </button>
            )}
            {onShowNotifications && (
              <NotificationBell onClick={onShowNotifications} />
            )}
          </div>
        </div>

        {/* Health Status */}
        <HealthIndicator className="mx-1" />

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-critical/10 hover:bg-critical/20 transition-colors text-critical/80 hover:text-critical border border-critical/20"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}
