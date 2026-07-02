import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workspacesApi } from '@/api/workspaces';
import { extractErrorMessage } from '@/api/axios';
import { queryKeys } from '@/constants/queryKeys';

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces,
    queryFn: workspacesApi.list,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => workspacesApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
      toast.success('Workspace created');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workspacesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
      toast.success('Workspace deleted');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}
