import express from 'express';
import MovesController from '../controllers/moves.controller.js';
import { authenticate, checkOwner } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { moveSchema } from '../utils/validators.js';
import Move from '../models/Move.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/moves
 * @desc    Get all moves for authenticated user (supports ?search=term&difficulty_level=level)
 * @access  Private
 */
router.get('/', MovesController.getMoves);

/**
 * @route   GET /api/moves/:id
 * @desc    Get move by ID
 * @access  Private
 */
router.get('/:id', MovesController.getMoveById);

/**
 * @route   POST /api/moves
 * @desc    Create a new move
 * @access  Private
 */
router.post('/', validateRequest(moveSchema), MovesController.createMove);

/**
 * @route   PUT /api/moves/:id
 * @desc    Update move
 * @access  Private
 */
router.put(
  '/:id',
  checkOwner(async (id) => {
    const move = await Move.findById(id);
    return move;
  }),
  validateRequest(moveSchema),
  MovesController.updateMove
);

/**
 * @route   DELETE /api/moves/:id
 * @desc    Delete move
 * @access  Private
 */
router.delete(
  '/:id',
  checkOwner(async (id) => {
    const move = await Move.findById(id);
    return move;
  }),
  MovesController.deleteMove
);

export default router;

