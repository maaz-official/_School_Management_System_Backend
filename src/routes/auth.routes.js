import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateLogin, validateForgotPassword } from '../validators/auth.validator.js';

const router = express.Router();

// Public routes
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

export { router as authRoutes };