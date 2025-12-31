import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = ({ className, children, hoverEffect = false, ...props }: CardProps) => {
  return (
    <div 
      className={cn(
        "bg-surface border border-border rounded-xl p-6 relative overflow-hidden transition-all duration-300",
        hoverEffect && "hover:border-primary/50 hover:shadow-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4", className)}>{children}</div>
);

export const CardTitle = ({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold text-zinc-100", className)}>{children}</h3>
);
