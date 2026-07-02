import { cn } from '@/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-ink-100 dark:bg-ink-800', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
    </div>
  );
}

export function BoardCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-5 space-y-4">
      <Skeleton className="h-1.5 w-10" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-1.5 w-full" />
    </div>
  );
}

export function KanbanColumnSkeleton() {
  return (
    <div className="flex w-[300px] shrink-0 flex-col gap-3">
      <Skeleton className="h-5 w-24" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}
