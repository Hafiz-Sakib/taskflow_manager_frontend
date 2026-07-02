import { Link } from 'react-router-dom';
import { Pin, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/utils/date';
import { cn } from '@/utils/cn';
import type { Board } from '@/types/models';

const COLORS = ['#6d5dfc', '#ef4d8b', '#28c281', '#f5a15c', '#3b6cf6', '#b13bde'];

export function BoardCard({
  board,
  index,
  progress,
  isPinned,
  onTogglePin,
  onDelete,
}: {
  board: Board;
  index: number;
  progress?: number;
  isPinned: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-5 group relative">
      <div className="flex items-center justify-between mb-4">
        <div className="h-1.5 w-10 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
        <button
          onClick={onTogglePin}
          className="text-ink-300 hover:text-brand-500"
          aria-label={isPinned ? 'Unpin board' : 'Pin board'}
        >
          <Pin className={cn('h-4 w-4', isPinned && 'fill-brand-500 text-brand-500')} />
        </button>
      </div>

      <Link to={`/app/boards/${board._id}`} className="block">
        <h3 className="font-bold mb-1 pr-6 truncate">{board.title}</h3>
        {board.description && <p className="text-sm text-ink-400 line-clamp-2 mb-4">{board.description}</p>}
      </Link>

      {progress !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-ink-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
            <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-ink-400">
        <span>{board.columns.length} columns</span>
        <span>{formatDate(board.createdAt)}</span>
      </div>

      <button
        onClick={onDelete}
        className="absolute top-5 right-12 opacity-0 group-hover:opacity-100 text-ink-400 hover:text-danger transition-opacity"
        aria-label="Delete board"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </Card>
  );
}
