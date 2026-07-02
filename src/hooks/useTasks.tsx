import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tasksApi, type CreateTaskPayload, type UpdateTaskPayload, type TaskFilters } from '@/api/tasks';
import { extractErrorMessage } from '@/api/axios';
import { queryKeys } from '@/constants/queryKeys';
import type { BoardWithTasks, Task } from '@/types/models';

export function useTasksList(filters: TaskFilters) {
  return useQuery({
    queryKey: queryKeys.tasks(filters as Record<string, unknown>),
    queryFn: () => tasksApi.list(filters),
  });
}

export function useCreateTask(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.create(payload),
    onSuccess: (task) => {
      queryClient.setQueryData<BoardWithTasks | undefined>(queryKeys.board(boardId), (old) =>
        old ? { ...old, tasks: [...old.tasks, task] } : old
      );
      toast.success('Task created');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useUpdateTask(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) => tasksApi.update(id, payload),
    onSuccess: (task) => {
      queryClient.setQueryData<BoardWithTasks | undefined>(queryKeys.board(boardId), (old) =>
        old ? { ...old, tasks: old.tasks.map((t) => (t._id === task._id ? task : t)) } : old
      );
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

/**
 * WHY (optimistic update): dragging a card should feel instant. This
 * updates the cached board's tasks synchronously in `onMutate` (before the
 * network call resolves), and rolls back to the previous snapshot in
 * `onError` if the request actually fails.
 */
export function useMoveTask(boardId: string) {
  const queryClient = useQueryClient();
  const boardKey = queryKeys.board(boardId);

  return useMutation({
    mutationFn: ({ id, column, order }: { id: string; column: string; order: number }) =>
      tasksApi.update(id, { column, order }),
    onMutate: async ({ id, column, order }) => {
      await queryClient.cancelQueries({ queryKey: boardKey });
      const previous = queryClient.getQueryData<BoardWithTasks>(boardKey);

      queryClient.setQueryData<BoardWithTasks | undefined>(boardKey, (old) =>
        old ? { ...old, tasks: old.tasks.map((t) => (t._id === id ? { ...t, column, order } : t)) } : old
      );

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous);
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useToggleTaskComplete(boardId: string, columns: string[]) {
  const queryClient = useQueryClient();
  const boardKey = queryKeys.board(boardId);
  const doneColumn = columns.find((c) => c.trim().toLowerCase() === 'done');

  return useMutation({
    mutationFn: (task: Task) => {
      const isDone = task.column.trim().toLowerCase() === 'done';
      const target = isDone ? columns[0] : doneColumn;
      if (!target) throw new Error('This board has no "Done" column');
      return tasksApi.update(task._id, { column: target });
    },
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: boardKey });
      const previous = queryClient.getQueryData<BoardWithTasks>(boardKey);
      const isDone = task.column.trim().toLowerCase() === 'done';
      const target = isDone ? columns[0] : doneColumn;

      if (target) {
        queryClient.setQueryData<BoardWithTasks | undefined>(boardKey, (old) =>
          old ? { ...old, tasks: old.tasks.map((t) => (t._id === task._id ? { ...t, column: target } : t)) } : old
        );
      }
      return { previous };
    },
    onError: (err, _task, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous);
      toast.error(extractErrorMessage(err));
    },
  });
}

/**
 * WHY (undo delete): the backend soft-deletes, but there's no "undelete"
 * endpoint — so real undo is implemented client-side by delaying the
 * actual network call. The task disappears from the UI immediately
 * (optimistic), and the DELETE request only fires after a grace period
 * unless the user clicks Undo, which cancels the pending timer and
 * restores the card.
 */
export function useDeleteTaskWithUndo(boardId: string) {
  const queryClient = useQueryClient();
  const boardKey = queryKeys.board(boardId);
  const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

  return (task: Task) => {
    const previous = queryClient.getQueryData<BoardWithTasks>(boardKey);

    queryClient.setQueryData<BoardWithTasks | undefined>(boardKey, (old) =>
      old ? { ...old, tasks: old.tasks.filter((t) => t._id !== task._id) } : old
    );

    const timer = setTimeout(async () => {
      pendingTimers.delete(task._id);
      try {
        await tasksApi.remove(task._id);
      } catch (err) {
        toast.error(extractErrorMessage(err));
        if (previous) queryClient.setQueryData(boardKey, previous);
      }
    }, 5000);

    pendingTimers.set(task._id, timer);

    toast(
      (t) => (
        <span className="flex items-center gap-3">
          Task deleted
          <button
            className="font-bold text-brand-500 underline"
            onClick={() => {
              const pending = pendingTimers.get(task._id);
              if (pending) clearTimeout(pending);
              pendingTimers.delete(task._id);
              if (previous) queryClient.setQueryData(boardKey, previous);
              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </span>
      ),
      { duration: 5000 }
    );
  };
}

export function useArchiveTask(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) => tasksApi.archive(id, isArchived),
    onSuccess: (task) => {
      queryClient.setQueryData<BoardWithTasks | undefined>(queryKeys.board(boardId), (old) =>
        old ? { ...old, tasks: old.tasks.map((t) => (t._id === task._id ? task : t)) } : old
      );
      toast.success(task.isArchived ? 'Task archived' : 'Task restored');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useReorderTasks() {
  return useMutation({
    mutationFn: (tasks: { _id: string; column: string; order: number }[]) => tasksApi.reorder(tasks),
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useAddComment(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => tasksApi.addComment(id, text),
    onSuccess: (task) => {
      queryClient.setQueryData<BoardWithTasks | undefined>(queryKeys.board(boardId), (old) =>
        old ? { ...old, tasks: old.tasks.map((t) => (t._id === task._id ? task : t)) } : old
      );
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useAddAttachment(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, url }: { id: string; name: string; url: string }) =>
      tasksApi.addAttachment(id, { name, url }),
    onSuccess: (task) => {
      queryClient.setQueryData<BoardWithTasks | undefined>(queryKeys.board(boardId), (old) =>
        old ? { ...old, tasks: old.tasks.map((t) => (t._id === task._id ? task : t)) } : old
      );
      toast.success('Attachment added');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useChecklist(boardId: string) {
  const queryClient = useQueryClient();
  const boardKey = queryKeys.board(boardId);
  const syncTask = (task: Task) => {
    queryClient.setQueryData<BoardWithTasks | undefined>(boardKey, (old) =>
      old ? { ...old, tasks: old.tasks.map((t) => (t._id === task._id ? task : t)) } : old
    );
  };

  const addItem = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => tasksApi.addChecklistItem(id, text),
    onSuccess: syncTask,
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const toggleItem = useMutation({
    mutationFn: ({ id, itemId, done }: { id: string; itemId: string; done: boolean }) =>
      tasksApi.toggleChecklistItem(id, itemId, done),
    onSuccess: syncTask,
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const removeItem = useMutation({
    mutationFn: ({ id, itemId }: { id: string; itemId: string }) => tasksApi.removeChecklistItem(id, itemId),
    onSuccess: syncTask,
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  return { addItem, toggleItem, removeItem };
}
