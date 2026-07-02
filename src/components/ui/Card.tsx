import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl bg-white dark:bg-ink-900 shadow-soft dark:shadow-card-dark', className)}
      {...props}
    />
  );
}
