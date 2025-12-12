import Move from '../models/Move.js';

class MovesService {
  /**
   * Create a new move
   * @param {Object} moveData - Move data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Created move
   */
  static async createMove(moveData, userId) {
    const move = await Move.create({
      ...moveData,
      user_id: userId,
    });
    return move;
  }

  /**
   * Get all moves for a user
   * @param {number} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of moves
   */
  static async getMoves(userId, filters = {}) {
    const moves = await Move.findByUserId(userId, filters);
    return moves;
  }

  /**
   * Get move by ID
   * @param {number} moveId - Move ID
   * @returns {Promise<Object>} Move object
   */
  static async getMoveById(moveId) {
    const move = await Move.findById(moveId);
    if (!move) {
      const error = new Error('Move not found');
      error.status = 404;
      throw error;
    }
    return move;
  }

  /**
   * Update move
   * @param {number} moveId - Move ID
   * @param {Object} moveData - Updated move data
   * @returns {Promise<Object>} Updated move
   */
  static async updateMove(moveId, moveData) {
    const move = await Move.update(moveId, moveData);
    if (!move) {
      const error = new Error('Move not found');
      error.status = 404;
      throw error;
    }
    return move;
  }

  /**
   * Delete move
   * @param {number} moveId - Move ID
   * @returns {Promise<boolean>} True if deleted
   */
  static async deleteMove(moveId) {
    const deleted = await Move.delete(moveId);
    if (!deleted) {
      const error = new Error('Move not found');
      error.status = 404;
      throw error;
    }
    return deleted;
  }

  /**
   * Check if move belongs to user
   * @param {number} moveId - Move ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if move belongs to user
   */
  static async checkOwnership(moveId, userId) {
    return Move.belongsToUser(moveId, userId);
  }
}

export default MovesService;



