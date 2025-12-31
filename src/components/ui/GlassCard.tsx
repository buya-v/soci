import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export const GlassCard = ({ children, className, interactive = false }: GlassCardProps) => {
  return (
    <div
      className={cn(
        'glass-panel rounded-2xl p-6 transition-all duration-300',
        interactive && 'hover:bg-white/5 hover:border-white/20 hover:-translate-y-1 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
