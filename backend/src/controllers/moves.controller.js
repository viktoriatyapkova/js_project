import MovesService from '../services/moves.service.js';

class MovesController {
  /**
   * Get all moves for authenticated user
   */
  static async getMoves(req, res, next) {
    try {
      const { q, search, difficulty_level } = req.query;
      const filters = {};
      // Support both 'q' and 'search' query parameters
      const searchTerm = q || search;
      if (searchTerm) filters.search = searchTerm;
      if (difficulty_level) filters.difficulty_level = difficulty_level;

      const moves = await MovesService.getMoves(req.user.id, filters);
      res.status(200).json({
        moves,
        count: moves.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get move by ID
   */
  static async getMoveById(req, res, next) {
    try {
      const move = await MovesService.getMoveById(req.params.id);
      res.status(200).json({
        move,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new move
   */
  static async createMove(req, res, next) {
    try {
      const move = await MovesService.createMove(req.body, req.user.id);
      res.status(201).json({
        message: 'Move created successfully',
        move,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update move
   */
  static async updateMove(req, res, next) {
    try {
      const move = await MovesService.updateMove(req.params.id, req.body);
      res.status(200).json({
        message: 'Move updated successfully',
        move,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete move
   */
  static async deleteMove(req, res, next) {
    try {
      await MovesService.deleteMove(req.params.id);
      res.status(200).json({
        message: 'Move deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MovesController;

