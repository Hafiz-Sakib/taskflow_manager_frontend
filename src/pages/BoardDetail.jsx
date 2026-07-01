import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import api from '../api/client';
import Navbar from '../components/Navbar';
import Column from '../components/Column';
import AddTaskModal from '../components/AddTaskModal';

export default function BoardDetail() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalColumn, setModalColumn] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const loadBoard = async () => {
    setLoading(true);
    const res = await api.get(`/boards/${id}`);
    setBoard(res.data.board);
    setTasks(res.data.tasks);
    setLoading(false);
  };

  useEffect(() => {
    loadBoard();
  }, [id]);

  const tasksByColumn = (column) =>
    tasks.filter((t) => t.column === column).sort((a, b) => a.order - b.order);

  const handleAddTask = async (taskData) => {
    const res = await api.post('/tasks', { ...taskData, board: id });
    setTasks((prev) => [...prev, res.data]);
    setModalColumn(null);
  };

  const handleDeleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  const findColumnOfTask = (taskId) => tasks.find((t) => t._id === taskId)?.column;

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id;
    const overId = over.id;

    const activeColumn = findColumnOfTask(activeTaskId);
    // overId could be a task id or a column id
    const overColumn = board.columns.includes(overId) ? overId : findColumnOfTask(overId);

    if (!overColumn || activeColumn === undefined) return;

    let updatedTasks = [...tasks];

    if (activeColumn !== overColumn) {
      // Moving to a different column
      updatedTasks = updatedTasks.map((t) =>
        t._id === activeTaskId ? { ...t, column: overColumn } : t
      );
    }

    // Recalculate order within affected columns
    const reorderPayload = [];
    board.columns.forEach((col) => {
      const colTasks = updatedTasks
        .filter((t) => t.column === col)
        .sort((a, b) => a.order - b.order);
      colTasks.forEach((t, idx) => {
        t.order = idx;
        reorderPayload.push({ _id: t._id, column: col, order: idx });
      });
    });

    setTasks(updatedTasks);
    await api.put('/tasks/reorder/bulk', { tasks: reorderPayload });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-sm text-gray-500 px-6 py-10">Loading board...</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-sm text-gray-500 px-6 py-10">Board not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="px-6 py-6">
        <Link to="/boards" className="text-xs text-gray-400 hover:text-gray-600">
          ← Back to boards
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 mt-1 mb-6">{board.title}</h1>

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {board.columns.map((column) => (
              <Column
                key={column}
                column={column}
                tasks={tasksByColumn(column)}
                onDelete={handleDeleteTask}
                onAddTask={setModalColumn}
              />
            ))}
          </div>
        </DndContext>
      </div>

      {modalColumn && (
        <AddTaskModal
          column={modalColumn}
          onClose={() => setModalColumn(null)}
          onSubmit={handleAddTask}
        />
      )}
    </div>
  );
}
