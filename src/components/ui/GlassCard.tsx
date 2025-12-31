import React, { ReactNode } from 'react';
import { clsx } from 'clsx';
import { ErrorBoundary } from './ErrorBoundary';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  highlight?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  title, 
  action,
  highlight = false
}) => {
  return (
    <div className={clsx(
      "glass-panel relative overflow-hidden rounded-2xl border transition-all duration-500",
      "bg-glass-bg border-glass-border hover:border-white/20 hover:-translate-y-1",
      highlight && "shadow-glow-soft border-neon/30",
      className
    )}>
      {highlight && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon to-purpleAccent opacity-80" />
      )}
      
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          {title && <h3 className="text-lg font-medium text-white tracking-wide">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      
      <div className="p-6">
        <ErrorBoundary fallbackTitle={`Error in ${title || 'Component'}`}>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
};