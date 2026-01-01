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
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  highlight = false,
  noPadding = false,
  hoverable = true,
}) => {
  return (
    <div className={clsx(
      'glass-panel relative overflow-hidden rounded-xl border',
      'bg-glass-bg border-glass-border',
      hoverable && 'card-hover',
      highlight && 'shadow-glow-primary border-primary/30',
      className
    )}>
      {highlight && (
        <div className="absolute top-0 left-0 w-full h-0.5 gradient-bg" />
      )}

      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
          <div>
            {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  );
};
