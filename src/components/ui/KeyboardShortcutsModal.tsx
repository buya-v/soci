import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { shortcuts } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-white/10 border border-glass-border rounded text-xs font-mono text-gray-300">
      {children}
    </span>
  );
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const getKeyDisplay = (shortcut: typeof shortcuts[0]) => {
    const keys: string[] = [];
    if (shortcut.ctrlKey) keys.push(isMac ? '⌃' : 'Ctrl');
    if (shortcut.metaKey) keys.push(isMac ? '⌘' : 'Ctrl');
    if (shortcut.shiftKey) keys.push(isMac ? '⇧' : 'Shift');
    keys.push(shortcut.key.toUpperCase());
    return keys;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-panel rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Keyboard size={20} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-1">
              {/* Navigation Section */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Navigation
                </h4>
                <div className="space-y-2">
                  {shortcuts.slice(0, 6).map((shortcut) => (
                    <div
                      key={shortcut.key + shortcut.description}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm text-gray-300">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {getKeyDisplay(shortcut).map((key, i) => (
                          <KeyBadge key={i}>{key}</KeyBadge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Actions
                </h4>
                <div className="space-y-2">
                  {shortcuts.slice(6).map((shortcut) => (
                    <div
                      key={shortcut.key + shortcut.description}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm text-gray-300">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {getKeyDisplay(shortcut).map((key, i) => (
                          <KeyBadge key={i}>{key}</KeyBadge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-glass-border">
              <p className="text-xs text-gray-500 text-center">
                Press <KeyBadge>/</KeyBadge> or <KeyBadge>?</KeyBadge> anytime to show this help
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
