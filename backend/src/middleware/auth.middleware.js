import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Middleware to authenticate user via JWT token
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Middleware to check if user owns a resource
 * @param {Function} getResource - Function to get resource by ID
 */
export const checkOwner = (getResource) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.routineId || req.params.moveId;
      const resource = await getResource(resourceId);

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      if (resource.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Authorization error' });
    }
  };
};

export default {
  authenticate,
  checkOwner,
};




