import { useState } from 'react';
import TaskCard from './TaskCard.jsx';

export default function KanbanColumn({
  column,
  tasks,
  onDrop,
  onAddTask,
  onQuickAdd,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  dragTaskRef,
  selectMode,
  selectedIds,
  onToggleSelect,
}) {
  const [isOver, setIsOver] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    if (dragTaskRef.current) {
      onDrop(dragTaskRef.current, column);
    }
  };

  const submitQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) {
      setQuickOpen(false);
      return;
    }
    onQuickAdd(column, quickTitle.trim());
    setQuickTitle('');
  };

  return (
    <div className="flex w-[280px] shrink-0 flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{column}</h3>
          <span className="text-xs text-ink-400 bg-ink-100 dark:bg-ink-800 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column)}
          className="text-ink-400 hover:text-brand-500 rounded p-1"
          aria-label={`Add task to ${column}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={() => setIsOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col gap-2.5 min-h-[120px] rounded-2xl p-1.5 flex-1 transition-colors ${
          isOver ? 'column-dropzone bg-brand-50/60 dark:bg-brand-900/20' : ''
        }`}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onDragStart={(e) => {
              dragTaskRef.current = task;
              e.currentTarget.classList.add('task-dragging');
            }}
            onDragEnd={(e) => e.currentTarget.classList.remove('task-dragging')}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onToggleComplete={onToggleComplete}
            selectMode={selectMode}
            selected={selectedIds?.includes(task._id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
        {tasks.length === 0 && !quickOpen && (
          <p className="text-xs text-ink-400 text-center py-6">No tasks yet</p>
        )}

        {quickOpen ? (
          <form onSubmit={submitQuickAdd} className="px-0.5">
            <input
              autoFocus
              className="input text-sm py-2"
              placeholder="Task title, press Enter"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onBlur={() => !quickTitle.trim() && setQuickOpen(false)}
              onKeyDown={(e) => e.key === 'Escape' && setQuickOpen(false)}
            />
          </form>
        ) : (
          !selectMode && (
            <button
              onClick={() => setQuickOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-ink-400 hover:text-brand-500 px-1.5 py-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Add task
            </button>
          )
        )}
      </div>
    </div>
  );
}
