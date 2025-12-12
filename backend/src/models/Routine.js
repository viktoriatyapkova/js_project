import pool from '../utils/database.js';

class Routine {
  /**
   * Create a new routine
   * @param {Object} routineData - Routine data
   * @returns {Promise<Object>} Created routine
   */
  static async create(routineData) {
    const { name, description, duration_minutes, user_id } = routineData;
    const query = `
      INSERT INTO routines (name, description, duration_minutes, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [
      name,
      description || null,
      duration_minutes || null,
      user_id,
    ]);
    return result.rows[0];
  }

  /**
   * Find routine by ID
   * @param {number} id - Routine ID
   * @returns {Promise<Object|null>} Routine object or null
   */
  static async findById(id) {
    const query = 'SELECT * FROM routines WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all routines for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of routines
   */
  static async findByUserId(userId) {
    const query = 'SELECT * FROM routines WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Update routine
   * @param {number} id - Routine ID
   * @param {Object} routineData - Updated routine data
   * @returns {Promise<Object|null>} Updated routine or null
   */
  static async update(id, routineData) {
    // Строим динамический запрос только для переданных полей
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (routineData.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(routineData.name);
      paramIndex += 1;
    }

    if (routineData.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(routineData.description || null);
      paramIndex += 1;
    }

    if (routineData.duration_minutes !== undefined) {
      updates.push(`duration_minutes = $${paramIndex}`);
      values.push(routineData.duration_minutes || null);
      paramIndex += 1;
    }

    if (updates.length === 0) {
      // Если нет полей для обновления, просто возвращаем текущую запись
      return Routine.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE routines
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete routine
   * @param {number} id - Routine ID
   * @returns {Promise<boolean>} True if deleted
   */
  static async delete(id) {
    const query = 'DELETE FROM routines WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Check if routine belongs to user
   * @param {number} routineId - Routine ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if routine belongs to user
   */
  static async belongsToUser(routineId, userId) {
    const query = 'SELECT EXISTS(SELECT 1 FROM routines WHERE id = $1 AND user_id = $2)';
    const result = await pool.query(query, [routineId, userId]);
    return result.rows[0].exists;
  }

  /**
   * Check if routine name is unique for user
   * @param {string} name - Routine name
   * @param {number} userId - User ID
   * @param {number} excludeId - Routine ID to exclude (for updates)
   * @returns {Promise<boolean>} True if name is unique
   */
  static async isNameUnique(name, userId, excludeId = null) {
    let query = 'SELECT EXISTS(SELECT 1 FROM routines WHERE name = $1 AND user_id = $2';
    const params = [name, userId];
    if (excludeId) {
      query += ' AND id != $3';
      params.push(excludeId);
    }
    query += ')';
    const result = await pool.query(query, params);
    return !result.rows[0].exists;
  }

  /**
   * Get moves for a routine
   * @param {number} routineId - Routine ID
   * @returns {Promise<Array>} Array of moves with order
   */
  static async getMoves(routineId) {
    const query = `
      SELECT m.*, rm.order_index
      FROM routine_moves rm
      JOIN moves m ON rm.move_id = m.id
      WHERE rm.routine_id = $1
      ORDER BY rm.order_index ASC
    `;
    const result = await pool.query(query, [routineId]);
    return result.rows;
  }

  /**
   * Add move to routine
   * @param {number} routineId - Routine ID
   * @param {number} moveId - Move ID
   * @param {number} order - Order index
   * @returns {Promise<Object>} Created routine_move
   */
  static async addMove(routineId, moveId, order) {
    const query = `
      INSERT INTO routine_moves (routine_id, move_id, order_index)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [routineId, moveId, order]);
    return result.rows[0];
  }

  /**
   * Remove move from routine
   * @param {number} routineId - Routine ID
   * @param {number} moveId - Move ID
   * @returns {Promise<boolean>} True if removed
   */
  static async removeMove(routineId, moveId) {
    const query = 'DELETE FROM routine_moves WHERE routine_id = $1 AND move_id = $2';
    const result = await pool.query(query, [routineId, moveId]);
    return result.rowCount > 0;
  }

  /**
   * Update move order in routine
   * @param {number} routineId - Routine ID
   * @param {number} moveId - Move ID
   * @param {number} order - New order index
   * @returns {Promise<Object|null>} Updated routine_move or null
   */
  static async updateMoveOrder(routineId, moveId, order) {
    const query = `
      UPDATE routine_moves
      SET order_index = $1
      WHERE routine_id = $2 AND move_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [order, routineId, moveId]);
    return result.rows[0] || null;
  }

  /**
   * Calculate routine duration based on moves
   * @param {number} routineId - Routine ID
   * @returns {Promise<number>} Calculated duration in minutes
   */
  static async calculateDuration(routineId) {
    // Simple calculation: assume each move takes 1 minute
    // This can be enhanced with actual move durations if needed
    const query = 'SELECT COUNT(*) as count FROM routine_moves WHERE routine_id = $1';
    const result = await pool.query(query, [routineId]);
    return parseInt(result.rows[0].count, 10);
  }
}

export default Routine;

