import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({ className, full }: { className?: string; full?: boolean }) {
  return (
    <div className={cn('flex items-center justify-center', full && 'h-full min-h-[240px]', className)}>
      <Loader2 className="h-6 w-6 animate-spin text-brand-500" aria-label="Loading" />
    </div>
  );
}
