function MoveCard({ move, onEdit, onDelete }) {
  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900">{move.name}</h3>
          {move.difficulty_level && (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(
                move.difficulty_level
              )}`}
            >
              {move.difficulty_level}
            </span>
          )}
        </div>
        {move.description && (
          <p className="text-sm text-gray-600 mb-4">{move.description}</p>
        )}
        {move.video_url && (
          <a
            href={move.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            Watch Video →
          </a>
        )}
      </div>
      <div className="bg-gray-50 px-6 py-3 flex justify-end gap-2">
        <button
          onClick={() => onEdit(move)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(move.id)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default MoveCard;




