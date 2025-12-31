import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { tailwindMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return tailwindMerge(clsx(inputs));
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hoverEffect = false, 
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "glass-panel rounded-xl p-6 transition-all duration-300",
        hoverEffect && "hover:bg-slate-800/50 hover:border-indigo-500/30",
        className
      )}
    >
      {children}
    </motion.div>
  );
};