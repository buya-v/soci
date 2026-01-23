import React from 'react';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/store/useAppStore';
import { isAnyAIConfigured } from '@/services/ai';

type HealthStatus = 'healthy' | 'warning' | 'error';

interface HealthIndicatorProps {
  className?: string;
  variant?: 'compact' | 'detailed';
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  className,
  variant = 'compact',
}) => {
  const errorState = useAppStore((state) => state.errorState);
  const unresolvedErrors = errorState.errors.filter((e) => !e.resolved);
  const errorCount = unresolvedErrors.length;

  // Determine health status
  const getStatus = (): HealthStatus => {
    if (!isAnyAIConfigured()) return 'warning';
    if (errorCount > 3) return 'error';
    if (errorCount > 0) return 'warning';
    return 'healthy';
  };

  const status = getStatus();

  const statusConfig = {
    healthy: {
      color: 'text-aurora-neon',
      bgColor: 'bg-aurora-neon/10',
      borderColor: 'border-aurora-neon/30',
      icon: CheckCircle,
      label: 'Systems Nominal',
      glow: 'shadow-glow-soft',
    },
    warning: {
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      icon: AlertCircle,
      label: errorCount > 0 ? `${errorCount} Issue${errorCount > 1 ? 's' : ''}` : 'API Not Configured',
      glow: '',
    },
    error: {
      color: 'text-critical',
      bgColor: 'bg-critical/10',
      borderColor: 'border-critical/30',
      icon: AlertCircle,
      label: `${errorCount} Errors`,
      glow: '',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Format last error time
  const getLastErrorTime = () => {
    if (!errorState.lastError) return null;
    const time = new Date(errorState.lastError.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
  };

  if (variant === 'compact') {
    return (
      <div
        className={clsx(
          'flex items-center gap-2 px-2 py-1.5 rounded-lg',
          config.bgColor,
          'border',
          config.borderColor,
          config.glow,
          'transition-all duration-400 ease-aurora',
          className
        )}
      >
        <Icon size={14} className={config.color} />
        <span className={clsx('text-[10px] font-medium', config.color)}>
          {config.label}
        </span>
        {errorCount > 0 && (
          <span
            className={clsx(
              'w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold',
              status === 'error' ? 'bg-critical text-white' : 'bg-warning text-black'
            )}
          >
            {errorCount}
          </span>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div
      className={clsx(
        'p-3 rounded-lg',
        config.bgColor,
        'border',
        config.borderColor,
        config.glow,
        'transition-all duration-400 ease-aurora',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity size={16} className={config.color} />
          <span className={clsx('text-sm font-medium', config.color)}>
            System Health
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={clsx(
              'w-2 h-2 rounded-full animate-pulse',
              status === 'healthy' && 'bg-aurora-neon',
              status === 'warning' && 'bg-warning',
              status === 'error' && 'bg-critical'
            )}
          />
          <span className="text-xs text-gray-400">{config.label}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">AI Provider</span>
          <span className={isAnyAIConfigured() ? 'text-aurora-neon' : 'text-warning'}>
            {isAnyAIConfigured() ? 'Connected' : 'Not Configured'}
          </span>
        </div>

        {errorState.lastError && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 flex items-center gap-1">
              <Clock size={10} />
              Last Issue
            </span>
            <span className="text-gray-400">{getLastErrorTime()}</span>
          </div>
        )}

        {errorCount > 0 && (
          <div className="mt-2 p-2 rounded bg-black/20 border border-white/5">
            <p className="text-[10px] text-gray-400 truncate">
              {errorState.lastError?.message || 'Unknown error'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
