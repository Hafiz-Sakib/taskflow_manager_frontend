import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';
import { queryKeys } from '@/constants/queryKeys';

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: analyticsApi.dashboard,
  });
}

export function useBoardStats(boardId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.boardStats(boardId || ''),
    queryFn: () => analyticsApi.boardStats(boardId as string),
    enabled: !!boardId,
  });
}

export function useRecentBoards() {
  return useQuery({
    queryKey: queryKeys.recentBoards,
    queryFn: analyticsApi.recent,
  });
}
