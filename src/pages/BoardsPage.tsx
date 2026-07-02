import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { PageTransition } from '@/components/common/PageTransition';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { BoardCardSkeleton } from '@/components/ui/Skeleton';
import { BoardCard } from '@/features/boards/BoardCard';
import { CreateBoardModal } from '@/features/boards/CreateBoardModal';
import { useBoards, useDeleteBoard } from '@/hooks/useBoards';
import { useUiStore } from '@/store/uiStore';
import { getPinnedBoardIds, togglePinnedBoard } from '@/utils/localPrefs';
import type { Board } from '@/types/models';

export default function BoardsPage() {
  const { data: boards, isLoading } = useBoards();
  const deleteBoard = useDeleteBoard();
  const { activeWorkspaceId } = useUiStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Board | null>(null);
  const [pinnedIds, setPinnedIds] = useState(getPinnedBoardIds());

  const filtered = useMemo(
    () => (activeWorkspaceId ? (boards || []).filter((b) => b.workspace === activeWorkspaceId) : boards || []),
    [boards, activeWorkspaceId]
  );
  const pinned = filtered.filter((b) => pinnedIds.includes(b._id));
  const others = filtered.filter((b) => !pinnedIds.includes(b._id));

  const handleTogglePin = (id: string) => setPinnedIds(togglePinnedBoard(id));

  return (
    <div>
      <Topbar
        title="Boards"
        right={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New board
          </Button>
        }
      />

      <PageTransition>
        <div className="px-4 sm:px-6 py-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <BoardCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No boards yet"
              description="Create your first board to start organizing tasks into columns."
              action={<Button onClick={() => setCreateOpen(true)}>+ Create a board</Button>}
            />
          ) : (
            <>
              {pinned.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-bold text-sm text-ink-400 uppercase tracking-wide mb-3">Pinned</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {pinned.map((b, i) => (
                      <BoardCard
                        key={b._id}
                        board={b}
                        index={i}
                        isPinned
                        onTogglePin={() => handleTogglePin(b._id)}
                        onDelete={() => setDeleteTarget(b)}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div>
                {pinned.length > 0 && (
                  <h2 className="font-bold text-sm text-ink-400 uppercase tracking-wide mb-3">All boards</h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {others.map((b, i) => (
                    <BoardCard
                      key={b._id}
                      board={b}
                      index={i}
                      isPinned={false}
                      onTogglePin={() => handleTogglePin(b._id)}
                      onDelete={() => setDeleteTarget(b)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </PageTransition>

      <CreateBoardModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteBoard.mutate(deleteTarget._id);
          setDeleteTarget(null);
        }}
        title="Delete board"
        message={`Delete "${deleteTarget?.title}" and all its tasks? This can't be undone.`}
        isLoading={deleteBoard.isPending}
      />
    </div>
  );
}
