import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { boardsApi, type CreateBoardPayload, type UpdateBoardPayload } from '@/api/boards';
import { extractErrorMessage } from '@/api/axios';
import { queryKeys } from '@/constants/queryKeys';

export function useBoards(includeArchived = false) {
  return useQuery({
    queryKey: queryKeys.boards(includeArchived),
    queryFn: () => boardsApi.list(includeArchived),
  });
}

export function useBoard(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.board(id || ''),
    queryFn: () => boardsApi.get(id as string),
    enabled: !!id,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBoardPayload) => boardsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Board created');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useUpdateBoard(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateBoardPayload) => boardsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(id) });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Board updated');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useArchiveBoard(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isArchived: boolean) => boardsApi.archive(id, isArchived),
    onSuccess: (board) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success(board.isArchived ? 'Board archived' : 'Board restored');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => boardsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Board deleted');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useBoardActivity(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.boardActivity(id || ''),
    queryFn: () => boardsApi.activity(id as string),
    enabled: !!id,
  });
}
