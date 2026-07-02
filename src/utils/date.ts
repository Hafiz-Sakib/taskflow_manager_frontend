import { format, formatDistanceToNow, isPast, isToday, startOfDay, differenceInCalendarDays } from 'date-fns';

export function formatDate(date: string | Date | null | undefined, pattern = 'MMM d, yyyy') {
  if (!date) return null;
  return format(new Date(date), pattern);
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isDoneColumn(column: string) {
  return column.trim().toLowerCase() === 'done';
}

export function isOverdue(dueDate: string | null, column: string) {
  if (!dueDate || isDoneColumn(column)) return false;
  return isPast(startOfDay(new Date(dueDate))) && !isToday(new Date(dueDate));
}

export function isDueToday(dueDate: string | null, column: string) {
  if (!dueDate || isDoneColumn(column)) return false;
  return isToday(new Date(dueDate));
}

export function isDueSoon(dueDate: string | null, column: string) {
  if (!dueDate || isDoneColumn(column)) return false;
  const days = differenceInCalendarDays(new Date(dueDate), new Date());
  return days >= 0 && days <= 2;
}
