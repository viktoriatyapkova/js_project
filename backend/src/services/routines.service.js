import Routine from '../models/Routine.js';
import Move from '../models/Move.js';

class RoutinesService {
  /**
   * Create a new routine
   * @param {Object} routineData - Routine data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Created routine
   */
  static async createRoutine(routineData, userId) {
    // Check if routine name is unique for user
    const isUnique = await Routine.isNameUnique(routineData.name, userId);
    if (!isUnique) {
      const error = new Error('Routine name already exists');
      error.status = 409;
      throw error;
    }

    const routine = await Routine.create({
      ...routineData,
      user_id: userId,
    });
    return routine;
  }

  /**
   * Get all routines for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of routines
   */
  static async getRoutines(userId) {
    const routines = await Routine.findByUserId(userId);
    return routines;
  }

  /**
   * Get routine by ID
   * @param {number} routineId - Routine ID
   * @returns {Promise<Object>} Routine object with moves
   */
  static async getRoutineById(routineId) {
    const routine = await Routine.findById(routineId);
    if (!routine) {
      const error = new Error('Routine not found');
      error.status = 404;
      throw error;
    }

    // Get moves for routine
    const moves = await Routine.getMoves(routineId);
    return {
      ...routine,
      moves,
    };
  }

  /**
   * Update routine
   * @param {number} routineId - Routine ID
   * @param {Object} routineData - Updated routine data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated routine
   */
  static async updateRoutine(routineId, routineData, userId) {
    // Check if name is unique (excluding current routine)
    if (routineData.name) {
      const isUnique = await Routine.isNameUnique(routineData.name, userId, routineId);
      if (!isUnique) {
        const error = new Error('Routine name already exists');
        error.status = 409;
        throw error;
      }
    }

    const routine = await Routine.update(routineId, routineData);
    if (!routine) {
      const error = new Error('Routine not found');
      error.status = 404;
      throw error;
    }
    return routine;
  }

  /**
   * Delete routine
   * @param {number} routineId - Routine ID
   * @returns {Promise<boolean>} True if deleted
   */
  static async deleteRoutine(routineId) {
    const deleted = await Routine.delete(routineId);
    if (!deleted) {
      const error = new Error('Routine not found');
      error.status = 404;
      throw error;
    }
    return deleted;
  }

  /**
   * Get moves for a routine
   * @param {number} routineId - Routine ID
   * @returns {Promise<Array>} Array of moves
   */
  static async getRoutineMoves(routineId) {
    const routine = await Routine.findById(routineId);
    if (!routine) {
      const error = new Error('Routine not found');
      error.status = 404;
      throw error;
    }

    const moves = await Routine.getMoves(routineId);
    return moves;
  }

  /**
   * Add move to routine
   * @param {number} routineId - Routine ID
   * @param {number} moveId - Move ID
   * @param {number} order - Order index
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Created routine_move
   */
  static async addMoveToRoutine(routineId, moveId, order, userId) {
    // Verify routine exists and belongs to user
    const routine = await Routine.findById(routineId);
    if (!routine) {
      const error = new Error('Routine not found');
      error.status = 404;
      throw error;
    }
    if (routine.user_id !== userId) {
      const error = new Error('Access denied');
      error.status = 403;
      throw error;
    }

    // Verify move exists and belongs to user
    const move = await Move.findById(moveId);
    if (!move) {
      const error = new Error('Move not found');
      error.status = 404;
      throw error;
    }
    if (move.user_id !== userId) {
      const error = new Error('Access denied');
      error.status = 403;
      throw error;
    }

    const routineMove = await Routine.addMove(routineId, moveId, order);

    // Recalculate duration
    const duration = await Routine.calculateDuration(routineId);
    await Routine.update(routineId, { duration_minutes: duration });

    return routineMove;
  }

  /**
   * Update move order in routine
   * @param {number} routineId - Routine ID
   * @param {number} moveId - Move ID
   * @param {number} order - New order index
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated routine_move
   */
  static async updateMoveOrder(routineId, moveId, order, userId) {
    const routine = await Routine.findById(routineId);
    if (!routine || routine.user_id !== userId) {
      const error = new Error('Access denied');
      error.status = 403;
      throw error;
    }

    const routineMove = await Routine.updateMoveOrder(routineId, moveId, order);
    if (!routineMove) {
      const error = new Error('Move not found in routine');
      error.status = 404;
      throw error;
    }

    return routineMove;
  }

  /**
   * Remove move from routine
   * @param {number} routineId - Routine ID
   * @param {number} moveId - Move ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if removed
   */
  static async removeMoveFromRoutine(routineId, moveId, userId) {
    const routine = await Routine.findById(routineId);
    if (!routine || routine.user_id !== userId) {
      const error = new Error('Access denied');
      error.status = 403;
      throw error;
    }

    const removed = await Routine.removeMove(routineId, moveId);
    if (!removed) {
      const error = new Error('Move not found in routine');
      error.status = 404;
      throw error;
    }

    // Recalculate duration
    const duration = await Routine.calculateDuration(routineId);
    await Routine.update(routineId, { duration_minutes: duration });

    return removed;
  }

  /**
   * Check if routine belongs to user
   * @param {number} routineId - Routine ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if routine belongs to user
   */
  static async checkOwnership(routineId, userId) {
    return Routine.belongsToUser(routineId, userId);
  }
}

export default RoutinesService;




