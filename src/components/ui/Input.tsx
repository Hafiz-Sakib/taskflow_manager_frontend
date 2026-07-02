import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      aria-invalid={!!error}
      className={cn(
        'w-full rounded-xl border bg-white dark:bg-ink-900 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-ink-400',
        error ? 'border-danger focus:border-danger' : 'border-ink-200 dark:border-ink-700 focus:border-brand-400',
        className
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';
