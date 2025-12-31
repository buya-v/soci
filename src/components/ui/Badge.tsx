import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  const variants = {
    default: "bg-zinc-800 text-zinc-400 border-zinc-700",
    success: "bg-emerald-950/50 text-emerald-400 border-emerald-900",
    warning: "bg-amber-950/50 text-amber-400 border-amber-900",
    danger: "bg-red-950/50 text-red-400 border-red-900",
  };

  return (
    <span className={cn(
      "px-2 py-1 rounded-full text-xs font-medium border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};