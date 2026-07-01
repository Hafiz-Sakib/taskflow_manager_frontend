import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';

export default function Boards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const loadBoards = async () => {
    setLoading(true);
    const res = await api.get('/boards');
    setBoards(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post('/boards', { title, description });
    setTitle('');
    setDescription('');
    setShowForm(false);
    loadBoards();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this board and all its tasks?')) return;
    await api.delete(`/boards/${id}`);
    loadBoards();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Your Boards</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
          >
            + New Board
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white border border-gray-100 rounded-xl p-5 mb-8 shadow-sm"
          >
            <input
              type="text"
              placeholder="Board title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full mb-3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mb-3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={2}
            />
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
            >
              Create
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">Loading boards...</p>
        ) : boards.length === 0 ? (
          <p className="text-sm text-gray-500">
            No boards yet. Create your first board to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board._id}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition group"
              >
                <Link to={`/boards/${board._id}`}>
                  <h2 className="font-medium text-gray-900 mb-1">{board.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {board.description || 'No description'}
                  </p>
                </Link>
                <button
                  onClick={() => handleDelete(board._id)}
                  className="mt-3 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                  Delete board
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
