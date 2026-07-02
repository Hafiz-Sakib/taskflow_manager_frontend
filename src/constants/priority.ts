import type { Priority } from '@/types/models';

export const PRIORITY_META: Record<Priority, { label: string; color: string; dot: string }> = {
  low: { label: 'Low', color: 'text-priority-low bg-priority-low/10', dot: 'bg-priority-low' },
  medium: { label: 'Medium', color: 'text-priority-medium bg-priority-medium/10', dot: 'bg-priority-medium' },
  high: { label: 'High', color: 'text-priority-high bg-priority-high/10', dot: 'bg-priority-high' },
};

export const DEFAULT_COLUMNS = ['To Do', 'In Progress', 'Done'];
