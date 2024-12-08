import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

export const validateLogin = (req, res, next) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};

export const validateForgotPassword = (req, res, next) => {
  try {
    forgotPasswordSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};