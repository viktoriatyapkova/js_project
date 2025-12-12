function RoutineCard({ routine, onEdit, onDelete }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{routine.name}</h3>
        {routine.description && (
          <p className="text-sm text-gray-600 mb-4">{routine.description}</p>
        )}
        {routine.duration_minutes && (
          <p className="text-sm text-gray-500">
            Duration: {routine.duration_minutes} minutes
          </p>
        )}
      </div>
      <div className="bg-gray-50 px-6 py-3 flex justify-end gap-2">
        <button
          onClick={() => onEdit(routine)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(routine.id)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default RoutineCard;



