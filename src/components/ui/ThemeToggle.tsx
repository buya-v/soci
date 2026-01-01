import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useAppStore, type Theme } from '@/store/useAppStore';

const themes: { id: Theme; icon: typeof Sun; label: string }[] = [
  { id: 'light', icon: Sun, label: 'Light' },
  { id: 'dark', icon: Moon, label: 'Dark' },
  { id: 'system', icon: Monitor, label: 'System' },
];

interface ThemeToggleProps {
  variant?: 'compact' | 'full';
}

export function ThemeToggle({ variant = 'full' }: ThemeToggleProps) {
  const { theme, setTheme } = useAppStore();

  if (variant === 'compact') {
    const currentIndex = themes.findIndex(t => t.id === theme);
    const CurrentIcon = themes[currentIndex].icon;

    return (
      <button
        onClick={() => {
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].id);
        }}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        title={`Current: ${themes[currentIndex].label}. Click to switch.`}
      >
        <CurrentIcon size={18} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-glass-border">
      {themes.map(({ id, icon: Icon, label }) => {
        const isActive = theme === id;
        return (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={`
              relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
              transition-colors
              ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
            `}
            title={label}
          >
            {isActive && (
              <motion.div
                layoutId="themeToggleBg"
                className="absolute inset-0 rounded-lg bg-primary/20 border border-primary/30"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              <Icon size={16} />
            </span>
            <span className="relative z-10 hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
