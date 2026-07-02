import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/forms/FormField';
import { boardSchema, type BoardFormValues } from './schemas';
import { useCreateBoard } from '@/hooks/useBoards';
import { useUiStore } from '@/store/uiStore';

export function CreateBoardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createBoard = useCreateBoard();
  const { activeWorkspaceId } = useUiStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BoardFormValues>({
    resolver: zodResolver(boardSchema),
    defaultValues: { title: '', description: '', columns: 'To Do, In Progress, Done' },
  });

  const onSubmit = (values: BoardFormValues) => {
    const columns = values.columns
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    createBoard.mutate(
      {
        title: values.title,
        description: values.description,
        columns: columns.length ? columns : undefined,
        workspace: activeWorkspaceId || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Create board">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Title" htmlFor="title" error={errors.title?.message}>
          <Input
            id="title"
            autoFocus
            placeholder="e.g. Website Redesign"
            error={errors.title?.message}
            {...register('title')}
          />
        </FormField>
        <FormField label="Description" htmlFor="description" error={errors.description?.message}>
          <Textarea id="description" placeholder="What's this board for? (optional)" {...register('description')} />
        </FormField>
        <FormField
          label="Columns"
          htmlFor="columns"
          error={errors.columns?.message}
          hint="Comma-separated list of column names"
        >
          <Input id="columns" error={errors.columns?.message} {...register('columns')} />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createBoard.isPending}>
            Create board
          </Button>
        </div>
      </form>
    </Modal>
  );
}
