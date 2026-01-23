import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  highlight?: boolean;
  noPadding?: boolean;
  hoverable?: boolean;
  variant?: 'default' | 'aurora' | 'gradient-border';
  loading?: boolean;
}

// Skeleton loader for card content
const skeletonWidths = ['w-full', 'w-5/6', 'w-4/5', 'w-3/4', 'w-2/3'];
const SkeletonLoader: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-white/5 rounded w-3/4" />
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <div key={i} className={clsx('h-4 bg-white/5 rounded', skeletonWidths[(i + 1) % skeletonWidths.length])} />
    ))}
  </div>
);

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  highlight = false,
  noPadding = false,
  hoverable = true,
  variant = 'default',
  loading = false,
}) => {
  const isAurora = variant === 'aurora';
  const isGradientBorder = variant === 'gradient-border';

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl',
        // Base glass styling
        'backdrop-blur-xl',
        // Background
        isAurora
          ? 'bg-gradient-to-br from-aurora-neon/5 to-aurora-purple/5'
          : 'bg-glass-bg',
        // Border handling
        isGradientBorder
          ? 'p-[1px] bg-gradient-to-br from-aurora-neon/30 via-aurora-purple/20 to-primary/30'
          : 'border border-glass-border',
        // Hover effects with aurora lift animation
        hoverable && 'card-hover cursor-default',
        hoverable && !isGradientBorder && 'hover:border-glass-border-hover',
        // Highlight state
        highlight && 'shadow-glow-primary border-primary/30',
        className
      )}
    >
      {/* Inner container for gradient border variant */}
      <div
        className={clsx(
          isGradientBorder && 'bg-glass-bg rounded-xl overflow-hidden',
          isGradientBorder && 'backdrop-blur-xl'
        )}
      >
        {/* Aurora highlight bar */}
        {(highlight || isAurora) && (
          <div
            className={clsx(
              'absolute top-0 left-0 w-full h-0.5',
              isAurora
                ? 'bg-gradient-to-r from-aurora-neon via-aurora-purple to-primary'
                : 'gradient-bg'
            )}
          />
        )}

        {/* Card header */}
        {(title || action) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
            <div>
              {title && (
                <h3
                  className={clsx(
                    'text-base font-semibold',
                    isAurora ? 'text-aurora-neon' : 'text-white'
                  )}
                >
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        )}

        {/* Card content */}
        <div className={noPadding ? '' : 'p-5'}>
          {loading ? <SkeletonLoader /> : children}
        </div>
      </div>
    </div>
  );
};
