import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, maxLength, showCount, className, id, value, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            value={value}
            maxLength={maxLength}
            className={clsx(
              'w-full bg-white/5 border rounded-lg py-2.5 px-3 text-white placeholder-gray-500',
              'transition-all duration-200 resize-none',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              'hover:border-glass-border-hover',
              error ? 'border-critical' : 'border-glass-border',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
            {...props}
          />
          {showCount && maxLength && (
            <div className="absolute bottom-2.5 right-3 text-xs text-gray-500">
              {charCount}/{maxLength}
            </div>
          )}
        </div>
        {error && (
          <p id={`${textareaId}-error`} className="mt-1 text-xs text-critical" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="mt-1 text-xs text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
