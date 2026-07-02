import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, X, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/forms/FormField';
import { useUpdateBoard } from '@/hooks/useBoards';
import type { Board } from '@/types/models';

export function BoardSettingsModal({
  board,
  open,
  onClose,
}: {
  board: Board | null;
  open: boolean;
  onClose: () => void;
}) {
  const updateBoard = useUpdateBoard(board?._id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [newColumn, setNewColumn] = useState('');

  useEffect(() => {
    if (board) {
      setTitle(board.title);
      setDescription(board.description);
      setColumns(board.columns);
    }
  }, [board, open]);

  if (!board) return null;

  const moveColumn = (idx: number, dir: -1 | 1) => {
    setColumns((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const addColumn = () => {
    if (!newColumn.trim()) return;
    setColumns((prev) => [...prev, newColumn.trim()]);
    setNewColumn('');
  };

  const handleSubmit = () => {
    const clean = columns.map((c) => c.trim()).filter(Boolean);
    if (clean.length === 0) return;
    updateBoard.mutate({ title, description, columns: clean }, { onSuccess: onClose });
  };

  return (
    <Modal open={open} onClose={onClose} title="Board settings">
      <div className="space-y-4">
        <FormField label="Title" htmlFor="board-title">
          <Input id="board-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="Description" htmlFor="board-description">
          <Textarea id="board-description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>

        <FormField
          label="Columns"
          htmlFor="board-columns"
          hint="Renaming/removing a column here migrates its tasks automatically."
        >
          <div className="space-y-2">
            {columns.map((c, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Input
                  value={c}
                  onChange={(e) => setColumns((prev) => prev.map((col, i) => (i === idx ? e.target.value : col)))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveColumn(idx, -1)}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveColumn(idx, 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-danger"
                  disabled={columns.length <= 1}
                  onClick={() => setColumns((prev) => prev.filter((_, i) => i !== idx))}
                  aria-label="Remove column"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              value={newColumn}
              onChange={(e) => setNewColumn(e.target.value)}
              placeholder="New column name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addColumn();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addColumn}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </FormField>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={updateBoard.isPending}>
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
