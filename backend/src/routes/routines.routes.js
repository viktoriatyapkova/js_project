import express from 'express';
import Joi from 'joi';
import RoutinesController from '../controllers/routines.controller.js';
import { authenticate, checkOwner } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { routineSchema, routineMoveSchema } from '../utils/validators.js';
import Routine from '../models/Routine.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/routines
 * @desc    Get all routines for authenticated user
 * @access  Private
 */
router.get('/', RoutinesController.getRoutines);

/**
 * @route   GET /api/routines/:id
 * @desc    Get routine by ID
 * @access  Private
 */
router.get('/:id', RoutinesController.getRoutineById);

/**
 * @route   POST /api/routines
 * @desc    Create a new routine
 * @access  Private
 */
router.post('/', validateRequest(routineSchema), RoutinesController.createRoutine);

/**
 * @route   PUT /api/routines/:id
 * @desc    Update routine
 * @access  Private
 */
router.put(
  '/:id',
  checkOwner(async (id) => {
    const routine = await Routine.findById(id);
    return routine;
  }),
  validateRequest(routineSchema),
  RoutinesController.updateRoutine
);

/**
 * @route   DELETE /api/routines/:id
 * @desc    Delete routine
 * @access  Private
 */
router.delete(
  '/:id',
  checkOwner(async (id) => {
    const routine = await Routine.findById(id);
    return routine;
  }),
  RoutinesController.deleteRoutine
);

/**
 * @route   GET /api/routines/:id/moves
 * @desc    Get moves for a routine
 * @access  Private
 */
router.get('/:id/moves', RoutinesController.getRoutineMoves);

/**
 * @route   POST /api/routines/:id/moves
 * @desc    Add move to routine
 * @access  Private
 */
router.post(
  '/:id/moves',
  checkOwner(async (id) => {
    const routine = await Routine.findById(id);
    return routine;
  }),
  validateRequest(routineMoveSchema),
  RoutinesController.addMoveToRoutine
);

/**
 * @route   PUT /api/routines/:id/moves/:moveId
 * @desc    Update move order in routine
 * @access  Private
 */
router.put(
  '/:id/moves/:moveId',
  checkOwner(async (id) => {
    const routine = await Routine.findById(id);
    return routine;
  }),
  validateRequest(Joi.object({ order: Joi.number().integer().min(0).required() })),
  RoutinesController.updateMoveOrder
);

/**
 * @route   DELETE /api/routines/:id/moves/:moveId
 * @desc    Remove move from routine
 * @access  Private
 */
router.delete(
  '/:id/moves/:moveId',
  checkOwner(async (id) => {
    const routine = await Routine.findById(id);
    return routine;
  }),
  RoutinesController.removeMoveFromRoutine
);

export default router;

