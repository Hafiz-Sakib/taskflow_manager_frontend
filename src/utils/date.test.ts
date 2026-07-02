import { describe, it, expect } from 'vitest';
import { isOverdue, isDueToday, isDoneColumn } from '@/utils/date';

describe('date utils', () => {
  it('isDoneColumn is case-insensitive', () => {
    expect(isDoneColumn('Done')).toBe(true);
    expect(isDoneColumn('done')).toBe(true);
    expect(isDoneColumn('DONE')).toBe(true);
    expect(isDoneColumn('In Progress')).toBe(false);
  });

  it('isOverdue is false for tasks in a Done column regardless of date', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(isOverdue(yesterday, 'Done')).toBe(false);
    expect(isOverdue(yesterday, 'To Do')).toBe(true);
  });

  it('isOverdue is false with no due date', () => {
    expect(isOverdue(null, 'To Do')).toBe(false);
  });

  it('isDueToday is true only for today, not yesterday or tomorrow', () => {
    const today = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    expect(isDueToday(today, 'To Do')).toBe(true);
    expect(isDueToday(tomorrow, 'To Do')).toBe(false);
  });
});
