import { useEffect, useState } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import MoveForm from '../components/Moves/MoveForm.jsx';
import MoveCard from '../components/Moves/MoveCard.jsx';

function MovesList() {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMove, setEditingMove] = useState(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  useEffect(() => {
    fetchMoves();
  }, [search, difficultyFilter]);

  const fetchMoves = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (difficultyFilter) params.difficulty_level = difficultyFilter;

      const response = await api.get('/moves', { params });
      setMoves(response.data.moves || []);
    } catch (error) {
      toast.error('Failed to load moves');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMove(null);
    setShowForm(true);
  };

  const handleEdit = (move) => {
    setEditingMove(move);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this move?')) {
      return;
    }

    try {
      await api.delete(`/moves/${id}`);
      toast.success('Move deleted successfully');
      fetchMoves();
    } catch (error) {
      toast.error('Failed to delete move');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMove(null);
    fetchMoves();
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Moves</h1>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Move
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search moves..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : moves.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No moves found</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {moves.map((move) => (
            <MoveCard
              key={move.id}
              move={move}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <MoveForm move={editingMove} onClose={handleFormClose} />
      )}
    </div>
  );
}

export default MovesList;

