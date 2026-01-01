import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { ViewType } from '@/types';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
}

export const shortcuts: Omit<ShortcutConfig, 'action'>[] = [
  { key: '1', description: 'Go to Dashboard' },
  { key: '2', description: 'Go to Trend Radar' },
  { key: '3', description: 'Go to Content Lab' },
  { key: '4', description: 'Go to Queue' },
  { key: '5', description: 'Go to Calendar' },
  { key: '6', description: 'Go to Video Lab' },
  { key: '7', description: 'Go to Automation' },
  { key: 'n', ctrlKey: true, description: 'New Post (go to Content Lab)' },
  { key: 'k', metaKey: true, description: 'Open Command Palette' },
  { key: '/', description: 'Show Keyboard Shortcuts' },
];

export function useKeyboardShortcuts(onShowHelp?: () => void) {
  const { setActiveView, addNotification } = useAppStore();

  const handleNavigation = useCallback((view: ViewType, name: string) => {
    setActiveView(view);
    addNotification({
      type: 'info',
      title: 'Navigation',
      message: `Switched to ${name}`,
      duration: 1500,
    });
  }, [setActiveView, addNotification]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event;

      // Number keys for navigation (without modifiers)
      if (!ctrlKey && !metaKey && !shiftKey) {
        switch (key) {
          case '1':
            event.preventDefault();
            handleNavigation('dashboard', 'Dashboard');
            break;
          case '2':
            event.preventDefault();
            handleNavigation('trends', 'Trend Radar');
            break;
          case '3':
            event.preventDefault();
            handleNavigation('content', 'Content Lab');
            break;
          case '4':
            event.preventDefault();
            handleNavigation('drafts', 'Queue');
            break;
          case '5':
            event.preventDefault();
            handleNavigation('calendar', 'Calendar');
            break;
          case '6':
            event.preventDefault();
            handleNavigation('video', 'Video Lab');
            break;
          case '7':
            event.preventDefault();
            handleNavigation('automation', 'Automation');
            break;
          case '/':
          case '?':
            event.preventDefault();
            onShowHelp?.();
            break;
        }
      }

      // Ctrl/Cmd + N for new post
      if ((ctrlKey || metaKey) && key.toLowerCase() === 'n') {
        event.preventDefault();
        handleNavigation('content', 'Content Lab');
      }
      // Note: Cmd+K is handled by the CommandPalette component directly
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNavigation, onShowHelp]);
}
