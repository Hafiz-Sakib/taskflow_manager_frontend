export const queryKeys = {
  me: ['me'] as const,
  boards: (includeArchived = false) => ['boards', { includeArchived }] as const,
  board: (id: string) => ['boards', id] as const,
  boardActivity: (id: string) => ['boards', id, 'activity'] as const,
  tasks: (filters: Record<string, unknown>) => ['tasks', filters] as const,
  workspaces: ['workspaces'] as const,
  dashboard: ['analytics', 'dashboard'] as const,
  boardStats: (id: string) => ['analytics', 'boards', id] as const,
  recentBoards: ['analytics', 'recent'] as const,
  notifications: (page: number) => ['notifications', page] as const,
};
