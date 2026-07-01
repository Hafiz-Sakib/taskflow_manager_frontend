import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

export default function Column({ column, tasks, onDelete, onAddTask }) {
  const { setNodeRef } = useDroppable({ id: column });

  return (
    <div className="bg-gray-100 rounded-xl p-3 w-72 flex-shrink-0 flex flex-col max-h-[75vh]">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-semibold text-gray-700">{column}</h2>
        <span className="text-xs text-gray-400 bg-white rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto space-y-2 min-h-[60px]">
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onDelete={onDelete} />
          ))}
        </SortableContext>
      </div>

      <button
        onClick={() => onAddTask(column)}
        className="mt-3 text-xs text-gray-500 hover:text-brand-600 text-left px-1 transition"
      >
        + Add task
      </button>
    </div>
  );
}
