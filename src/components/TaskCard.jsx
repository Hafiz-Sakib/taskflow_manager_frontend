import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const priorityStyles = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export default function TaskCard({ task, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task._id);
          }}
          className="text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition"
        >
          ✕
        </button>
      </div>
      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityStyles[task.priority]}`}
        >
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="text-[10px] text-gray-400">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
