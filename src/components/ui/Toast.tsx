import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'border-success/30 bg-success/10',
  error: 'border-critical/30 bg-critical/10',
  warning: 'border-warning/30 bg-warning/10',
  info: 'border-info/30 bg-info/10',
};

const iconStyles = {
  success: 'text-success',
  error: 'text-critical',
  warning: 'text-warning',
  info: 'text-info',
};

function Toast({ id, type, title, message, duration = 5000 }: ToastProps) {
  const removeNotification = useAppStore((state) => state.removeNotification);
  const Icon = icons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        removeNotification(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, removeNotification]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        glass-panel rounded-xl border p-4 min-w-[300px] max-w-[400px]
        ${styles[type]}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className={iconStyles[type]} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white">{title}</p>
          {message && (
            <p className="text-sm text-gray-400 mt-1">{message}</p>
          )}
        </div>
        <button
          onClick={() => removeNotification(id)}
          className="text-gray-500 hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const notifications = useAppStore((state) => state.notifications);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <Toast key={notification.id} {...notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}
