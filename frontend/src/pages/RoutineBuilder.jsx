import { useEffect, useState } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import RoutineForm from '../components/Routines/RoutineForm.jsx';
import RoutineCard from '../components/Routines/RoutineCard.jsx';

function RoutineBuilder() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const response = await api.get('/routines');
      setRoutines(response.data.routines || []);
    } catch (error) {
      toast.error('Failed to load routines');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRoutine(null);
    setShowForm(true);
  };

  const handleEdit = (routine) => {
    setEditingRoutine(routine);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this routine?')) {
      return;
    }

    try {
      await api.delete(`/routines/${id}`);
      toast.success('Routine deleted successfully');
      fetchRoutines();
    } catch (error) {
      toast.error('Failed to delete routine');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRoutine(null);
    fetchRoutines();
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Routines</h1>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Create Routine
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : routines.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No routines found</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <RoutineForm routine={editingRoutine} onClose={handleFormClose} />
      )}
    </div>
  );
}

export default RoutineBuilder;




