import { Badge } from '@/components/ui/Badge';
import { PRIORITY_META } from '@/constants/priority';
import type { Priority } from '@/types/models';
import { cn } from '@/utils/cn';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return (
    <Badge className={meta.color}>
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </Badge>
  );
}
