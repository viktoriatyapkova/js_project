import RoutinesService from '../services/routines.service.js';

class RoutinesController {
  /**
   * Get all routines for authenticated user
   */
  static async getRoutines(req, res, next) {
    try {
      const routines = await RoutinesService.getRoutines(req.user.id);
      res.status(200).json({
        routines,
        count: routines.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get routine by ID
   */
  static async getRoutineById(req, res, next) {
    try {
      const routine = await RoutinesService.getRoutineById(req.params.id);
      res.status(200).json({
        routine,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new routine
   */
  static async createRoutine(req, res, next) {
    try {
      const routine = await RoutinesService.createRoutine(req.body, req.user.id);
      res.status(201).json({
        message: 'Routine created successfully',
        routine,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update routine
   */
  static async updateRoutine(req, res, next) {
    try {
      const routine = await RoutinesService.updateRoutine(
        req.params.id,
        req.body,
        req.user.id
      );
      res.status(200).json({
        message: 'Routine updated successfully',
        routine,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete routine
   */
  static async deleteRoutine(req, res, next) {
    try {
      await RoutinesService.deleteRoutine(req.params.id);
      res.status(200).json({
        message: 'Routine deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get moves for a routine
   */
  static async getRoutineMoves(req, res, next) {
    try {
      const moves = await RoutinesService.getRoutineMoves(req.params.id);
      res.status(200).json({
        moves,
        count: moves.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add move to routine
   */
  static async addMoveToRoutine(req, res, next) {
    try {
      const { move_id, order } = req.body;
      const routineMove = await RoutinesService.addMoveToRoutine(
        req.params.id,
        move_id,
        order,
        req.user.id
      );
      res.status(201).json({
        message: 'Move added to routine successfully',
        routine_move: routineMove,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update move order in routine
   */
  static async updateMoveOrder(req, res, next) {
    try {
      const { order } = req.body;
      const routineMove = await RoutinesService.updateMoveOrder(
        req.params.id,
        req.params.moveId,
        order,
        req.user.id
      );
      res.status(200).json({
        message: 'Move order updated successfully',
        routine_move: routineMove,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove move from routine
   */
  static async removeMoveFromRoutine(req, res, next) {
    try {
      await RoutinesService.removeMoveFromRoutine(
        req.params.id,
        req.params.moveId,
        req.user.id
      );
      res.status(200).json({
        message: 'Move removed from routine successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RoutinesController;




