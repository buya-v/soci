import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'aurora';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  onClick,
  type = 'button',
  title,
}: ButtonProps) {
  const baseStyles = clsx(
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
    'transition-all duration-400 ease-aurora relative overflow-hidden',
    'focus:outline-none focus:ring-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
  );

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variantStyles = {
    primary: clsx(
      'gradient-bg text-white',
      'shadow-md hover:shadow-lg hover:shadow-primary/25',
      'focus:ring-primary/30'
    ),
    aurora: clsx(
      'bg-aurora-neon text-black font-semibold',
      'shadow-md hover:shadow-glow-soft',
      'focus:ring-aurora-neon/30',
      'hover:bg-aurora-neon/90'
    ),
    secondary: clsx(
      'bg-white/5 text-gray-200 border border-glass-border',
      'hover:bg-white/10 hover:border-glass-border-hover hover:shadow-glow-soft',
      'focus:ring-aurora-neon/20'
    ),
    ghost: clsx(
      'bg-transparent text-gray-400',
      'hover:text-white hover:bg-white/5',
      'focus:ring-white/10'
    ),
    danger: clsx(
      'bg-critical/10 text-critical border border-critical/20',
      'hover:bg-critical/20 hover:border-critical/30',
      'focus:ring-critical/30'
    ),
  };

  const isDisabled = isLoading || disabled;

  return (
    <motion.button
      type={type}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={isDisabled}
      onClick={onClick}
      title={title}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
