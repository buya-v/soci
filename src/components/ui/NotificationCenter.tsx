import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Clock,
  TrendingUp,
  FileText,
  Settings,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDistanceToNow } from 'date-fns';

export interface PersistentNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'post' | 'trend' | 'schedule' | 'system';
  actionUrl?: string;
}

const categoryIcons = {
  post: FileText,
  trend: TrendingUp,
  schedule: Clock,
  system: Settings,
};

const typeStyles = {
  success: 'bg-success/10 border-success/20 text-success',
  warning: 'bg-warning/10 border-warning/20 text-warning',
  info: 'bg-primary/10 border-primary/20 text-primary',
  alert: 'bg-critical/10 border-critical/20 text-critical',
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    persistentNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    setActiveView
  } = useAppStore();

  const unreadCount = persistentNotifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: PersistentNotification) => {
    markNotificationRead(notification.id);
    if (notification.actionUrl) {
      // Handle navigation based on category
      if (notification.category === 'post') {
        setActiveView('drafts');
      } else if (notification.category === 'trend') {
        setActiveView('trends');
      } else if (notification.category === 'schedule') {
        setActiveView('drafts');
      }
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md glass-panel border-l border-glass-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Bell size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Notifications</h2>
                  <p className="text-xs text-gray-500">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Actions */}
            {persistentNotifications.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-glass-border bg-white/5">
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-primary hover:text-primary-light transition-colors"
                >
                  Mark all as read
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-gray-500 hover:text-critical transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Clear all
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {persistentNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="p-4 rounded-full bg-white/5 mb-4">
                    <Bell size={32} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-medium">No notifications yet</p>
                  <p className="text-sm text-gray-600 mt-1">
                    We'll notify you about important updates
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-glass-border">
                  {persistentNotifications.map((notification) => {
                    const CategoryIcon = categoryIcons[notification.category];
                    return (
                      <motion.button
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${
                          !notification.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg shrink-0 ${typeStyles[notification.type]}`}>
                            <CategoryIcon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium ${
                                notification.read ? 'text-gray-400' : 'text-white'
                              }`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-600 mt-2">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Notification Bell Button Component
interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const persistentNotifications = useAppStore((state) => state.persistentNotifications);
  const unreadCount = persistentNotifications.filter(n => !n.read).length;

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
    >
      <Bell size={20} className="text-gray-400" />
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-critical text-white text-[10px] font-bold rounded-full"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.span>
      )}
    </button>
  );
}
