import { useState } from 'react';
import PriorityBadge from './PriorityBadge.jsx';
import { formatDate, isOverdue, isDueSoon, isDoneColumn } from '../utils/helpers.js';

export default function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  onToggleComplete,
  selectMode = false,
  selected = false,
  onToggleSelect,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const overdue = isOverdue(task.dueDate, task.column);
  const dueSoon = isDueSoon(task.dueDate, task.column);
  const done = isDoneColumn(task.column);

  return (
    <div
      draggable={!selectMode}
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => selectMode && onToggleSelect(task._id)}
      className={`group card p-3.5 transition-shadow ${
        selectMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
      } ${selected ? 'ring-2 ring-brand-500' : 'hover:shadow-card'} ${done ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start gap-2.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!selectMode) onToggleComplete(task);
          }}
          className={`mt-0.5 h-[18px] w-[18px] shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
            selectMode
              ? selected
                ? 'bg-brand-500 border-brand-500'
                : 'border-ink-300 dark:border-ink-600'
              : done
              ? 'bg-priority-low border-priority-low'
              : 'border-ink-300 dark:border-ink-600 hover:border-brand-500'
          }`}
          aria-label={selectMode ? 'Select task' : done ? 'Mark incomplete' : 'Mark complete'}
        >
          {(selectMode ? selected : done) && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold leading-snug ${done ? 'line-through text-ink-400' : ''}`}>
              {task.title}
            </p>
            {!selectMode && (
              <div className="relative shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((o) => !o);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-ink-900 dark:hover:text-white rounded p-0.5 transition-opacity"
                  aria-label="Task options"
                >
                  ⋮
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-6 z-20 w-32 card p-1 shadow-card">
                      <button
                        className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800"
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit(task);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="w-full text-left text-xs px-2.5 py-2 rounded-lg text-priority-high hover:bg-priority-high/10"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(task);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-ink-400 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span
                className={`text-xs font-medium ${
                  overdue ? 'text-priority-high' : dueSoon ? 'text-priority-medium' : 'text-ink-400'
                }`}
              >
                {overdue ? 'Overdue · ' : ''}
                {formatDate(task.dueDate, { year: undefined })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
