import AuthService from '../services/auth.service.js';

class AuthController {
  /**
   * Register a new user
   */
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        message: 'User registered successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({
        message: 'Login successful',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user (client-side token removal)
   */
  static async logout(req, res) {
    res.status(200).json({
      message: 'Logout successful',
    });
  }

  /**
   * Get current user
   */
  static async getCurrentUser(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);
      res.status(200).json({
        user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;




