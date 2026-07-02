import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Pin, Settings, Trash2, Download, LayoutGrid, List as ListIcon } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { PageTransition } from '@/components/common/PageTransition';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { KanbanColumnSkeleton } from '@/components/ui/Skeleton';
import { KanbanColumn } from '@/features/tasks/KanbanColumn';
import { TaskCard } from '@/features/tasks/TaskCard';
import { TaskModal } from '@/features/tasks/TaskModal';
import { BoardSettingsModal } from '@/features/boards/BoardSettingsModal';
import { useBoard, useDeleteBoard } from '@/hooks/useBoards';
import { useCreateTask, useMoveTask, useToggleTaskComplete, useArchiveTask, useDeleteTaskWithUndo } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthProvider';
import {
  getPinnedBoardIds,
  togglePinnedBoard,
  getBoardPrefs,
  setBoardPrefs,
  downloadFile,
  tasksToCSV,
} from '@/utils/localPrefs';
import { isOverdue, formatDate } from '@/utils/date';
import type { Task } from '@/types/models';

export default function BoardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const boardId = id as string;
  const { user } = useAuth();
  const { data, isLoading, error } = useBoard(boardId);
  const createTask = useCreateTask(boardId);
  const moveTask = useMoveTask(boardId);
  const toggleComplete = useToggleTaskComplete(boardId, data?.board.columns || []);
  const archiveTask = useArchiveTask(boardId);
  const deleteBoard = useDeleteBoard();
  const deleteTaskWithUndo = useDeleteTaskWithUndo(boardId);

  const prefs = getBoardPrefs(boardId);
  const [view, setView] = useState<'board' | 'list'>((prefs.view as 'board' | 'list') || 'board');
  const [sort, setSort] = useState(prefs.sort || 'manual');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [collapsed, setCollapsed] = useState<string[]>(prefs.collapsed || []);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  const [pinned, setPinned] = useState(() => getPinnedBoardIds().includes(boardId));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const savePrefs = (next: Partial<{ view: string; sort: string; collapsed: string[] }>) => {
    const merged = { view, sort, collapsed, ...next };
    setBoardPrefs(boardId, merged);
  };

  const filteredTasks = useMemo(() => {
    if (!data) return [];
    let tasks = data.tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    if (priorityFilter !== 'all') tasks = tasks.filter((t) => t.priority === priorityFilter);

    const priorityRank = { high: 0, medium: 1, low: 2 };
    if (sort === 'priority') tasks = [...tasks].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
    else if (sort === 'dueDate')
      tasks = [...tasks].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    else if (sort === 'newest')
      tasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else tasks = [...tasks].sort((a, b) => a.order - b.order);

    return tasks;
  }, [data, search, priorityFilter, sort]);

  const tasksByColumn = (col: string) => filteredTasks.filter((t) => t.column === col);

  const handleDragStart = (e: DragStartEvent) => {
    const task = data?.tasks.find((t) => t._id === e.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over || !data) return;

    const task = data.tasks.find((t) => t._id === active.id);
    if (!task) return;

    const overIsColumn = data.board.columns.includes(String(over.id));
    const targetColumn = overIsColumn ? String(over.id) : data.tasks.find((t) => t._id === over.id)?.column;
    if (!targetColumn || task.column === targetColumn) return;

    const newOrder = tasksByColumn(targetColumn).length;
    moveTask.mutate({ id: task._id, column: targetColumn, order: newOrder });
  };

  const toggleCollapse = (col: string) => {
    const next = collapsed.includes(col) ? collapsed.filter((c) => c !== col) : [...collapsed, col];
    setCollapsed(next);
    savePrefs({ collapsed: next });
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (!data) return;
    const filename = data.board.title.replace(/\s+/g, '_');
    if (format === 'csv') downloadFile(`${filename}.csv`, tasksToCSV(filteredTasks), 'text/csv');
    else downloadFile(`${filename}.json`, JSON.stringify(filteredTasks, null, 2), 'application/json');
  };

  if (isLoading) {
    return (
      <div>
        <Topbar title="Loading…" />
        <div className="px-6 py-6 flex gap-5 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <KanbanColumnSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <Topbar title="Board" />
        <p className="p-6 text-sm text-danger">Board not found, or you don't have access to it.</p>
      </div>
    );
  }

  const { board } = data;
  const ownerName = user?.name || 'You';

  return (
    <div>
      <Topbar
        title={board.title}
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPinned(togglePinnedBoard(boardId).includes(boardId))}
              aria-label="Pin board"
            >
              <Pin className={pinned ? 'h-4 w-4 fill-brand-500 text-brand-500' : 'h-4 w-4'} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" /> Settings
            </Button>
            <Button variant="ghost" size="sm" className="text-danger" onClick={() => setDeleteBoardOpen(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        }
      />

      <PageTransition>
        <div className="px-4 sm:px-6 py-6">
          {board.description && <p className="text-sm text-ink-400 mb-5 max-w-2xl">{board.description}</p>}

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Input
              className="max-w-xs"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select className="w-auto" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <Select
              className="w-auto"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                savePrefs({ sort: e.target.value });
              }}
            >
              <option value="manual">Sort: Manual</option>
              <option value="priority">Sort: Priority</option>
              <option value="dueDate">Sort: Due date</option>
              <option value="newest">Sort: Newest</option>
            </Select>

            <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-900 rounded-xl p-1 ml-auto">
              <button
                onClick={() => {
                  setView('board');
                  savePrefs({ view: 'board' });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  view === 'board' ? 'bg-white dark:bg-ink-800 shadow-soft' : 'text-ink-400'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Board
              </button>
              <button
                onClick={() => {
                  setView('list');
                  savePrefs({ view: 'list' });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  view === 'list' ? 'bg-white dark:bg-ink-800 shadow-soft' : 'text-ink-400'
                }`}
              >
                <ListIcon className="h-3.5 w-3.5" /> List
              </button>
            </div>

            <div className="relative group">
              <Button variant="ghost">
                <Download className="h-4 w-4" /> Export
              </Button>
              <div className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-white dark:bg-ink-900 shadow-popover p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-20">
                <button
                  className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800"
                  onClick={() => handleExport('csv')}
                >
                  Export CSV
                </button>
                <button
                  className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800"
                  onClick={() => handleExport('json')}
                >
                  Export JSON
                </button>
              </div>
            </div>
          </div>

          {view === 'board' ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-5 overflow-x-auto pb-4">
                {board.columns.map((col) => (
                  <KanbanColumn
                    key={col}
                    column={col}
                    tasks={tasksByColumn(col)}
                    ownerName={ownerName}
                    collapsed={collapsed.includes(col)}
                    onToggleCollapse={() => toggleCollapse(col)}
                    onQuickAdd={(column, title) =>
                      createTask.mutate({ title, column, board: boardId, priority: 'medium' })
                    }
                    onOpenTask={setModalTask}
                    onEditTask={setModalTask}
                    onDeleteTask={(task) => setDeleteTaskTarget(task)}
                    onArchiveTask={(task) => archiveTask.mutate({ id: task._id, isArchived: !task.isArchived })}
                    onToggleComplete={(task) => toggleComplete.mutate(task)}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeTask && (
                  <TaskCard
                    task={activeTask}
                    ownerName={ownerName}
                    onOpen={() => {}}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onArchive={() => {}}
                    onToggleComplete={() => {}}
                  />
                )}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 dark:bg-ink-800 text-ink-400 text-xs uppercase">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Title</th>
                    <th className="text-left font-semibold px-4 py-3">Column</th>
                    <th className="text-left font-semibold px-4 py-3">Priority</th>
                    <th className="text-left font-semibold px-4 py-3">Due date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                  {filteredTasks.map((t) => (
                    <tr
                      key={t._id}
                      className="hover:bg-ink-50 dark:hover:bg-ink-800 cursor-pointer"
                      onClick={() => setModalTask(t)}
                    >
                      <td className="px-4 py-3 font-medium">{t.title}</td>
                      <td className="px-4 py-3 text-ink-400">{t.column}</td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className={`px-4 py-3 ${isOverdue(t.dueDate, t.column) ? 'text-danger' : 'text-ink-400'}`}>
                        {t.dueDate ? formatDate(t.dueDate) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button className="text-danger text-xs font-semibold" onClick={() => setDeleteTaskTarget(t)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-ink-400">
                        No tasks match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageTransition>

      <TaskModal
        task={modalTask}
        boardId={boardId}
        columns={board.columns}
        open={!!modalTask}
        onClose={() => setModalTask(null)}
      />

      <BoardSettingsModal board={settingsOpen ? board : null} open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <ConfirmDialog
        open={!!deleteTaskTarget}
        onClose={() => setDeleteTaskTarget(null)}
        onConfirm={() => {
          if (deleteTaskTarget) deleteTaskWithUndo(deleteTaskTarget);
          setDeleteTaskTarget(null);
        }}
        title="Delete task"
        message={`Delete "${deleteTaskTarget?.title}"? You can undo for a few seconds after.`}
      />

      <ConfirmDialog
        open={deleteBoardOpen}
        onClose={() => setDeleteBoardOpen(false)}
        onConfirm={() => deleteBoard.mutate(boardId)}
        title="Delete board"
        message={`Delete "${board.title}" and all its tasks? This can't be undone.`}
        isLoading={deleteBoard.isPending}
      />
    </div>
  );
}
