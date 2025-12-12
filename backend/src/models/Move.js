import pool from '../utils/database.js';

class Move {
  /**
   * Create a new move
   * @param {Object} moveData - Move data
   * @returns {Promise<Object>} Created move
   */
  static async create(moveData) {
    const { name, description, video_url, difficulty_level, user_id } = moveData;
    const query = `
      INSERT INTO moves (name, description, video_url, difficulty_level, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      name,
      description || null,
      video_url || null,
      difficulty_level || null,
      user_id,
    ]);
    return result.rows[0];
  }

  /**
   * Find move by ID
   * @param {number} id - Move ID
   * @returns {Promise<Object|null>} Move object or null
   */
  static async findById(id) {
    const query = 'SELECT * FROM moves WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all moves for a user
   * @param {number} userId - User ID
   * @param {Object} filters - Filter options (search, difficulty_level)
   * @returns {Promise<Array>} Array of moves
   */
  static async findByUserId(userId, filters = {}) {
    let query = 'SELECT * FROM moves WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (filters.search) {
      query += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${filters.search}%`);
      paramIndex += 1;
    }

    if (filters.difficulty_level) {
      query += ` AND difficulty_level = $${paramIndex}`;
      params.push(filters.difficulty_level);
      paramIndex += 1;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Update move
   * @param {number} id - Move ID
   * @param {Object} moveData - Updated move data
   * @returns {Promise<Object|null>} Updated move or null
   */
  static async update(id, moveData) {
    // Строим динамический запрос только для переданных полей
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (moveData.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(moveData.name);
      paramIndex += 1;
    }

    if (moveData.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(moveData.description || null);
      paramIndex += 1;
    }

    if (moveData.video_url !== undefined) {
      updates.push(`video_url = $${paramIndex}`);
      values.push(moveData.video_url || null);
      paramIndex += 1;
    }

    if (moveData.difficulty_level !== undefined) {
      updates.push(`difficulty_level = $${paramIndex}`);
      values.push(moveData.difficulty_level || null);
      paramIndex += 1;
    }

    if (updates.length === 0) {
      // Если нет полей для обновления, просто возвращаем текущую запись
      return Move.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE moves
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete move
   * @param {number} id - Move ID
   * @returns {Promise<boolean>} True if deleted
   */
  static async delete(id) {
    const query = 'DELETE FROM moves WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Check if move belongs to user
   * @param {number} moveId - Move ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if move belongs to user
   */
  static async belongsToUser(moveId, userId) {
    const query = 'SELECT EXISTS(SELECT 1 FROM moves WHERE id = $1 AND user_id = $2)';
    const result = await pool.query(query, [moveId, userId]);
    return result.rows[0].exists;
  }
}

export default Move;

