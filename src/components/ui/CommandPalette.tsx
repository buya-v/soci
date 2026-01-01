import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  FileText,
  Calendar,
  Video,
  Zap,
  Keyboard,
  Bell,
  Moon,
  Sun,
  Plus,
  Clock,
  Hash,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: 'navigation' | 'actions' | 'settings';
  keywords: string[];
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onShowShortcuts: () => void;
  onShowNotifications: () => void;
  onShowDataManager?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onShowShortcuts,
  onShowNotifications,
  onShowDataManager,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { setActiveView, theme, setTheme } = useAppStore();

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Define all available commands
  const commands: Command[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      description: 'View analytics and overview',
      icon: <LayoutDashboard size={18} />,
      category: 'navigation',
      keywords: ['dashboard', 'home', 'analytics', 'overview', 'stats'],
      action: () => {
        setActiveView('dashboard');
        onClose();
      },
    },
    {
      id: 'nav-trends',
      label: 'Go to Trend Engine',
      description: 'Discover trending topics',
      icon: <TrendingUp size={18} />,
      category: 'navigation',
      keywords: ['trends', 'trending', 'viral', 'discover', 'topics'],
      action: () => {
        setActiveView('trends');
        onClose();
      },
    },
    {
      id: 'nav-content',
      label: 'Go to Content Lab',
      description: 'Create AI-powered content',
      icon: <Sparkles size={18} />,
      category: 'navigation',
      keywords: ['content', 'create', 'generate', 'ai', 'write', 'lab'],
      action: () => {
        setActiveView('content');
        onClose();
      },
    },
    {
      id: 'nav-drafts',
      label: 'Go to Drafts & Queue',
      description: 'Manage scheduled posts',
      icon: <FileText size={18} />,
      category: 'navigation',
      keywords: ['drafts', 'queue', 'scheduled', 'posts', 'pending'],
      action: () => {
        setActiveView('drafts');
        onClose();
      },
    },
    {
      id: 'nav-calendar',
      label: 'Go to Calendar',
      description: 'View content calendar',
      icon: <Calendar size={18} />,
      category: 'navigation',
      keywords: ['calendar', 'schedule', 'dates', 'plan', 'timeline'],
      action: () => {
        setActiveView('calendar');
        onClose();
      },
    },
    {
      id: 'nav-video',
      label: 'Go to Video Lab',
      description: 'Create video content',
      icon: <Video size={18} />,
      category: 'navigation',
      keywords: ['video', 'reels', 'tiktok', 'clips', 'shorts'],
      action: () => {
        setActiveView('video');
        onClose();
      },
    },
    {
      id: 'nav-automation',
      label: 'Go to Automation Hub',
      description: 'Manage automations and workflows',
      icon: <Zap size={18} />,
      category: 'navigation',
      keywords: ['automation', 'workflows', 'rules', 'triggers', 'auto'],
      action: () => {
        setActiveView('automation');
        onClose();
      },
    },
    // Actions
    {
      id: 'action-new-post',
      label: 'Create New Post',
      description: 'Start creating a new post',
      icon: <Plus size={18} />,
      category: 'actions',
      keywords: ['new', 'create', 'post', 'add', 'write'],
      action: () => {
        setActiveView('content');
        onClose();
      },
    },
    {
      id: 'action-schedule',
      label: 'Schedule Content',
      description: 'Schedule a post for later',
      icon: <Clock size={18} />,
      category: 'actions',
      keywords: ['schedule', 'later', 'time', 'post', 'plan'],
      action: () => {
        setActiveView('calendar');
        onClose();
      },
    },
    {
      id: 'action-hashtags',
      label: 'Find Trending Hashtags',
      description: 'Discover popular hashtags',
      icon: <Hash size={18} />,
      category: 'actions',
      keywords: ['hashtags', 'tags', 'trending', 'popular'],
      action: () => {
        setActiveView('trends');
        onClose();
      },
    },
    // Settings
    {
      id: 'settings-theme',
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle between light and dark theme',
      icon: theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />,
      category: 'settings',
      keywords: ['theme', 'dark', 'light', 'mode', 'appearance'],
      action: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: 'settings-shortcuts',
      label: 'View Keyboard Shortcuts',
      description: 'See all available shortcuts',
      icon: <Keyboard size={18} />,
      category: 'settings',
      keywords: ['keyboard', 'shortcuts', 'keys', 'hotkeys', 'help'],
      action: () => {
        onClose();
        onShowShortcuts();
      },
    },
    {
      id: 'settings-notifications',
      label: 'Open Notifications',
      description: 'View recent notifications',
      icon: <Bell size={18} />,
      category: 'settings',
      keywords: ['notifications', 'alerts', 'messages', 'inbox'],
      action: () => {
        onClose();
        onShowNotifications();
      },
    },
    ...(onShowDataManager ? [{
      id: 'settings-data',
      label: 'Manage Data',
      description: 'Import, export, or reset your data',
      icon: <HardDrive size={18} />,
      category: 'settings' as const,
      keywords: ['data', 'backup', 'export', 'import', 'reset', 'storage'],
      action: () => {
        onClose();
        onShowDataManager();
      },
    }] : []),
  ], [theme, setActiveView, toggleTheme, onClose, onShowShortcuts, onShowNotifications, onShowDataManager]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;

    const searchLower = search.toLowerCase();
    return commands.filter(command => {
      const matchesLabel = command.label.toLowerCase().includes(searchLower);
      const matchesDescription = command.description?.toLowerCase().includes(searchLower);
      const matchesKeywords = command.keywords.some(kw => kw.includes(searchLower));
      return matchesLabel || matchesDescription || matchesKeywords;
    });
  }, [commands, search]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {
      navigation: [],
      actions: [],
      settings: [],
    };
    filteredCommands.forEach(cmd => {
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredCommands, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const selectedItem = list.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'navigation': return 'Navigation';
      case 'actions': return 'Quick Actions';
      case 'settings': return 'Settings';
      default: return category;
    }
  };

  let globalIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-surface border border-glass-border rounded-xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-glass-border">
                <Search size={20} className="text-gray-500" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-base"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-glass-border rounded text-xs text-gray-500">
                  ESC
                </kbd>
              </div>

              {/* Command List */}
              <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Search size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No commands found</p>
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, cmds]) => {
                    if (cmds.length === 0) return null;
                    return (
                      <div key={category} className="mb-2">
                        <p className="text-xs font-medium text-gray-500 uppercase px-2 py-1">
                          {getCategoryLabel(category)}
                        </p>
                        {cmds.map((command) => {
                          globalIndex++;
                          const currentIndex = globalIndex;
                          return (
                            <button
                              key={command.id}
                              data-index={currentIndex}
                              onClick={command.action}
                              onMouseEnter={() => setSelectedIndex(currentIndex)}
                              className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                                transition-colors group
                                ${selectedIndex === currentIndex
                                  ? 'bg-primary/20 text-white'
                                  : 'text-gray-300 hover:bg-white/5'
                                }
                              `}
                            >
                              <span className={`
                                ${selectedIndex === currentIndex ? 'text-primary' : 'text-gray-500'}
                              `}>
                                {command.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{command.label}</p>
                                {command.description && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {command.description}
                                  </p>
                                )}
                              </div>
                              <ArrowRight
                                size={14}
                                className={`
                                  opacity-0 group-hover:opacity-100 transition-opacity
                                  ${selectedIndex === currentIndex ? 'opacity-100 text-primary' : 'text-gray-500'}
                                `}
                              />
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-glass-border bg-white/5 text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↵</kbd>
                    to select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded">esc</kbd>
                  to close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to handle Cmd+K shortcut
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
}
