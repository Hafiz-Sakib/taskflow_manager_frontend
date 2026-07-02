import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      aria-invalid={!!error}
      className={cn(
        'w-full rounded-xl border bg-white dark:bg-ink-900 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-ink-400 resize-y min-h-[90px]',
        error ? 'border-danger focus:border-danger' : 'border-ink-200 dark:border-ink-700 focus:border-brand-400',
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';
