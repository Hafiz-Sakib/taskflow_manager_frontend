import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, error, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={!!error}
        className={cn(
          'w-full appearance-none rounded-xl border bg-white dark:bg-ink-900 px-3.5 py-2.5 pr-9 text-sm outline-none transition-colors',
          error ? 'border-danger focus:border-danger' : 'border-ink-200 dark:border-ink-700 focus:border-brand-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
});
Select.displayName = 'Select';
